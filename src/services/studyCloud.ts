import { signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import type {
  AtlasUserState,
  GroupMember,
  GroupNote,
  StudyGroup,
} from '../types/atlas';
import {
  generateInviteCode,
  getTodayIsoDate,
  mergeUserStates,
  sanitizeUserState,
} from '../utils/atlasLogic';

function safeDisplayName(user: User): string {
  const raw = (user.displayName || user.email?.split('@')[0] || 'مهندس اطلس').trim();
  return raw.slice(0, 60) || 'مهندس اطلس';
}

function toMillis(ts: unknown): number | undefined {
  if (ts instanceof Timestamp) return ts.toMillis();
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts) {
    try {
      return (ts as { toMillis: () => number }).toMillis();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function buildProfileUpdateFields(user: User, state: AtlasUserState) {
  const clean = sanitizeUserState(state);
  return {
    displayName: safeDisplayName(user),
    completedIds: clean.completedIds.slice(0, 120),
    bookmarkedIds: clean.bookmarkedIds.slice(0, 120),
    xp: clean.xp,
    streakDays: clean.streakDays,
    lastActiveDate: clean.lastActiveDate || getTodayIsoDate(),
    focusMinutes: clean.focusMinutes,
    activeGroupId: clean.activeGroupId,
    lastReadId: clean.lastReadId,
    theme: clean.theme,
    fontScale: clean.fontScale,
    activePathId: clean.activePathId,
    adhdMode: clean.adhdMode,
    checkOutcomes: clean.checkOutcomes,
    notes: clean.notes,
    updatedAt: serverTimestamp(),
  };
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function loadAndMergeUserProfile(
  user: User,
  localState: AtlasUserState
): Promise<AtlasUserState> {
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const clean = sanitizeUserState(localState);
      await setDoc(ref, {
        uid: user.uid,
        ...buildProfileUpdateFields(user, clean),
        createdAt: serverTimestamp(),
      });
      return clean;
    }

    const cloudRaw = snap.data();
    const cloudState = sanitizeUserState(cloudRaw);
    const merged = mergeUserStates(localState, cloudState);

    await updateDoc(ref, buildProfileUpdateFields(user, merged));
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCloudUserProfile(
  user: User,
  state: AtlasUserState
): Promise<void> {
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        ...buildProfileUpdateFields(user, state),
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, buildProfileUpdateFields(user, state));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createStudyGroup(
  user: User,
  name: string,
  description: string,
  weeklyGoalChapters: number,
  userState: AtlasUserState
): Promise<StudyGroup> {
  const groupId = generateInviteCode();
  const groupPath = `studyGroups/${groupId}`;
  const memberPath = `studyGroups/${groupId}/members/${user.uid}`;
  const trimmedName = name.trim().slice(0, 60);
  const trimmedDesc = description.trim().slice(0, 240);
  const goal = Math.min(120, Math.max(1, Math.round(weeklyGoalChapters)));

  try {
    // Step 1: Create parent StudyGroup document first so member rules see parent group
    await setDoc(doc(db, 'studyGroups', groupId), {
      id: groupId,
      name: trimmedName,
      description: trimmedDesc,
      ownerId: user.uid,
      weeklyGoalChapters: goal,
      memberUids: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, groupPath);
  }

  try {
    // Step 2: Create owner GroupMember card
    await setDoc(doc(db, 'studyGroups', groupId, 'members', user.uid), {
      uid: user.uid,
      groupId,
      displayName: safeDisplayName(user),
      role: 'owner',
      xp: userState.xp,
      completedCount: userState.completedIds.length,
      streakDays: userState.streakDays,
      lastChapterId: userState.lastReadId,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, memberPath);
  }

  return {
    id: groupId,
    name: trimmedName,
    description: trimmedDesc,
    ownerId: user.uid,
    weeklyGoalChapters: goal,
    memberUids: [user.uid],
  };
}

export async function joinStudyGroup(
  user: User,
  rawInviteCode: string,
  userState: AtlasUserState
): Promise<{ ok: boolean; group?: StudyGroup; error?: string }> {
  const groupId = rawInviteCode.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{4,64}$/.test(groupId)) {
    return { ok: false, error: 'فرمت کد دعوت معتبر نیست (مثال: ATLAS-7K4M2P).' };
  }

  const groupPath = `studyGroups/${groupId}`;
  const groupRef = doc(db, 'studyGroups', groupId);

  let data: Record<string, unknown> | undefined;
  try {
    const snap = await getDoc(groupRef);
    if (!snap.exists()) {
      return { ok: false, error: 'گروهی با این کد دعوت پیدا نشد. کد را دوباره بررسی کنید.' };
    }
    data = snap.data();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, groupPath);
  }

  const existingMembers = Array.isArray(data?.memberUids)
    ? (data.memberUids as string[])
    : [];
  const alreadyMember = existingMembers.includes(user.uid);

  if (!alreadyMember) {
    if (existingMembers.length >= 25) {
      return { ok: false, error: 'ظرفیت این گروه مطالعه تکمیل شده است (حداکثر ۲۵ عضو).' };
    }
    try {
      await updateDoc(groupRef, {
        memberUids: [...existingMembers, user.uid],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, groupPath);
    }
  }

  const role: 'owner' | 'member' =
    data?.ownerId === user.uid ? 'owner' : 'member';
  const memberPath = `studyGroups/${groupId}/members/${user.uid}`;
  const memberRef = doc(db, 'studyGroups', groupId, 'members', user.uid);

  try {
    const memberSnap = await getDoc(memberRef);
    if (!memberSnap.exists()) {
      await setDoc(memberRef, {
        uid: user.uid,
        groupId,
        displayName: safeDisplayName(user),
        role,
        xp: userState.xp,
        completedCount: userState.completedIds.length,
        streakDays: userState.streakDays,
        lastChapterId: userState.lastReadId,
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(memberRef, {
        displayName: safeDisplayName(user),
        xp: userState.xp,
        completedCount: userState.completedIds.length,
        streakDays: userState.streakDays,
        lastChapterId: userState.lastReadId,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, memberPath);
  }

  return {
    ok: true,
    group: {
      id: groupId,
      name: String(data?.name ?? 'گروه مطالعه'),
      description: String(data?.description ?? ''),
      ownerId: String(data?.ownerId ?? ''),
      weeklyGoalChapters: Number(data?.weeklyGoalChapters ?? 6),
      memberUids: alreadyMember ? existingMembers : [...existingMembers, user.uid],
    },
  };
}

export async function leaveStudyGroup(
  user: User,
  group: StudyGroup
): Promise<void> {
  const memberPath = `studyGroups/${group.id}/members/${user.uid}`;
  const groupPath = `studyGroups/${group.id}`;

  try {
    await deleteDoc(doc(db, 'studyGroups', group.id, 'members', user.uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, memberPath);
  }

  if (group.ownerId === user.uid) {
    // Owner can delete the group if they are the only remaining member
    if (group.memberUids.length <= 1) {
      try {
        await deleteDoc(doc(db, 'studyGroups', group.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, groupPath);
      }
    }
    return;
  }

  const remaining = group.memberUids.filter((id) => id !== user.uid);
  try {
    await updateDoc(doc(db, 'studyGroups', group.id), {
      memberUids: remaining,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, groupPath);
  }
}

export async function syncMemberProgress(
  user: User,
  groupId: string,
  state: AtlasUserState
): Promise<void> {
  if (!groupId) return;
  const memberPath = `studyGroups/${groupId}/members/${user.uid}`;
  const memberRef = doc(db, 'studyGroups', groupId, 'members', user.uid);
  try {
    const snap = await getDoc(memberRef);
    if (!snap.exists()) return;
    await updateDoc(memberRef, {
      displayName: safeDisplayName(user),
      xp: state.xp,
      completedCount: state.completedIds.length,
      streakDays: state.streakDays,
      lastChapterId: state.lastReadId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, memberPath);
  }
}

export function subscribeStudyGroup(
  groupId: string,
  onData: (group: StudyGroup | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `studyGroups/${groupId}`;
  return onSnapshot(
    doc(db, 'studyGroups', groupId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const d = snap.data();
      onData({
        id: String(d.id ?? snap.id),
        name: String(d.name ?? ''),
        description: String(d.description ?? ''),
        ownerId: String(d.ownerId ?? ''),
        weeklyGoalChapters: Number(d.weeklyGoalChapters ?? 6),
        memberUids: Array.isArray(d.memberUids) ? (d.memberUids as string[]) : [],
        createdAtMs: toMillis(d.createdAt),
      });
    },
    (err) => {
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeGroupMembers(
  groupId: string,
  onData: (members: GroupMember[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `studyGroups/${groupId}/members`;
  const q = query(
    collection(db, 'studyGroups', groupId, 'members'),
    orderBy('xp', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: GroupMember[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          uid: String(d.uid ?? docSnap.id),
          groupId: String(d.groupId ?? groupId),
          displayName: String(d.displayName ?? 'عضو گروه'),
          role: d.role === 'owner' ? 'owner' : 'member',
          xp: Number(d.xp ?? 0),
          completedCount: Number(d.completedCount ?? 0),
          streakDays: Number(d.streakDays ?? 0),
          lastChapterId: String(d.lastChapterId ?? 'T01-C01'),
          updatedAtMs: toMillis(d.updatedAt),
        };
      });
      onData(list);
    },
    (err) => {
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export function subscribeGroupNotes(
  groupId: string,
  onData: (notes: GroupNote[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = `studyGroups/${groupId}/notes`;
  const q = query(
    collection(db, 'studyGroups', groupId, 'notes'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list: GroupNote[] = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: String(d.id ?? docSnap.id),
          groupId: String(d.groupId ?? groupId),
          chapterId: String(d.chapterId ?? 'T01-C01'),
          authorUid: String(d.authorUid ?? ''),
          authorName: String(d.authorName ?? 'هم‌گروهی'),
          body: String(d.body ?? ''),
          createdAtMs: toMillis(d.createdAt),
        };
      });
      onData(list);
    },
    (err) => {
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function postGroupNote(
  user: User,
  groupId: string,
  chapterId: string,
  body: string
): Promise<void> {
  const cleanBody = body.trim().slice(0, 800);
  if (!cleanBody) return;
  const noteId = `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `studyGroups/${groupId}/notes/${noteId}`;

  try {
    await setDoc(doc(db, 'studyGroups', groupId, 'notes', noteId), {
      id: noteId,
      groupId,
      chapterId,
      authorUid: user.uid,
      authorName: safeDisplayName(user),
      body: cleanBody,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteGroupNote(
  groupId: string,
  noteId: string
): Promise<void> {
  const path = `studyGroups/${groupId}/notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'studyGroups', groupId, 'notes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
