# Security Specification — Atlas Modern Engineering Firestore Rules

## 1. Data Invariants
1. **Private User Isolation (PII Guard)**: `/users/{userId}` is strictly owner-only (`request.auth.uid == userId`). No user can read, list, or mutate another user's private profile, notes, or bookmarks.
2. **Invite-Code Study Group Privacy**: `/studyGroups/{groupId}` does NOT allow arbitrary collection scraping; `list` requires `request.auth.uid in resource.data.memberUids`. Creating a group requires verified auth, `ownerId == request.auth.uid`, and `memberUids == [request.auth.uid]`.
3. **Bounded Friend Circle**: `studyGroups/{groupId}.memberUids` is strictly bounded to `<= 25` members (`size() >= 1 && size() <= 25`) with verified string type checks.
4. **Master Gate Membership Sync**: Access to `/studyGroups/{groupId}/members/{memberId}` and `/studyGroups/{groupId}/notes/{noteId}` is strictly gated by parent study group membership (`request.auth.uid in get(.../studyGroups/$(groupId)).data.memberUids` or `memberId == request.auth.uid` on self-join).
5. **Identity Integrity & Immutability**: `uid`, `ownerId`, `authorUid`, `groupId`, and `createdAt` cannot be spoofed on create or modified on update.
6. **Temporal Integrity**: All `createdAt` and `updatedAt` timestamps must strictly equal `request.time`.
7. **Zero Shadow Fields & Bounded Sizes**: Every `create` checks `hasAll` + `hasOnly`; every `update` checks `affectedKeys().hasOnly(...)` inside an action-based pattern wrapped by `isValid[Entity]()`; every string enforces `.size()` limits; every ID path variable enforces `isValidId()`.

## 2. The "Dirty Dozen" Attack Payloads (Must Return PERMISSION_DENIED)
1. **Cross-user profile read**: User B attempts `get('/users/userA')`.
2. **User collection scraping**: User A attempts `list('/users')`.
3. **Shadow field injection on user profile**: User A creates `/users/userA` with extra ghost key `isAdmin: true`.
4. **UID spoofing on profile**: User A creates `/users/userA` with `uid: "userB"`.
5. **Client timestamp forgery**: User A creates `/users/userA` with `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
6. **Unverified email write**: User with `email_verified: false` attempts to create a study group.
7. **StudyGroup list scraping**: User C attempts `list('/studyGroups')` without filtering by `memberUids array-contains userC`.
8. **ID Poisoning**: User A attempts to create `/studyGroups/../../evil..` or a 300-char ID.
9. **Owner hijacking on StudyGroup update**: Non-owner member attempts to update `ownerId` or `name` of `/studyGroups/{groupId}`.
10. **Non-member note injection**: Outsider User C (not in `memberUids`) attempts to post a note to `/studyGroups/{groupId}/notes/{noteId}`.
11. **Member XP spoofing for another friend**: User A attempts to update `/studyGroups/{groupId}/members/userB` to overwrite User B's XP.
12. **Value poisoning / Denial of Wallet**: Member posts a 50KB `body` to `/studyGroups/{groupId}/notes/{noteId}` exceeding `maxLength: 800`.
