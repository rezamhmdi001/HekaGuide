import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTERS_META,
  CHAPTER_MAP,
  DOMAINS,
  STUDY_PATHS,
  TRACKS,
  TRACK_MAP,
} from '../data/manifest';
import { GLOSSARY } from '../data/glossary';
import { clearTrackCache, loadChapter, loadTrack } from '../data/trackLoader';
import {
  computeBadges,
  computeDomainProgress,
  exportUserStateJson,
  generateInviteCode,
  getAdjacentChapters,
  getFilteredTracks,
  getLevelInfo,
  getSpacedReviewQueue,
  importUserStateJson,
  mergeUserStates,
  normalizeSearchText,
  parseRoute,
  sanitizeUserState,
  searchAtlas,
  toPersianDigits,
  touchStudyStreak,
} from './atlasLogic';

describe('Manifest & Curriculum Completeness (5 Domains · 20 Tracks · 120 Chapters)', () => {
  it('defines exactly 5 domains, 20 tracks, 120 unique chapters, and 4 study paths', () => {
    assert.equal(DOMAINS.length, 5);
    assert.equal(TRACKS.length, 20);
    assert.equal(CHAPTERS_META.length, 120);
    assert.equal(STUDY_PATHS.length, 4);

    const uniqueIds = new Set(CHAPTERS_META.map((c) => c.id));
    assert.equal(uniqueIds.size, 120);

    for (const track of TRACKS) {
      assert.equal(track.chapterIds.length, 6, `Track ${track.id} must have 6 chapters`);
    }

    for (const path of STUDY_PATHS) {
      assert.ok(path.trackIds.length > 0);
      for (const tid of path.trackIds) {
        assert.ok(tid in TRACK_MAP, `Study path ${path.id} references unknown track ${tid}`);
      }
    }
  });

  it('loads all 20 dynamic track modules and verifies all 120 chapters have full non-stub content and valid cross-links', async () => {
    clearTrackCache();
    let totalChapters = 0;
    const checkTypes = new Set<string>();

    for (const track of TRACKS) {
      const content = await loadTrack(track.id);
      assert.equal(content.trackId, track.id);
      assert.equal(
        content.chapters.length,
        6,
        `Track module ${track.id} must export 6 chapters`
      );

      for (const ch of content.chapters) {
        totalChapters++;
        const meta = CHAPTER_MAP[ch.id];
        assert.ok(meta, `Chapter ${ch.id} missing in CHAPTER_MAP`);
        assert.equal(ch.trackId, track.id);
        assert.equal(ch.domainId, meta.domainId);
        assert.equal(ch.code, meta.code);
        assert.equal(ch.title, meta.title, `Title mismatch for ${ch.id}`);

        // Anti-stub assertions
        assert.ok(ch.originStory.length >= 2, `${ch.id} originStory too short`);
        assert.ok(
          ch.originStory.every((p) => p.trim().length > 40),
          `${ch.id} has empty/stub originStory paragraph`
        );
        assert.ok(ch.mentalModel.paragraphs.length >= 2, `${ch.id} mentalModel too short`);
        assert.ok(ch.mentalModel.rulesOfThumb.length >= 2, `${ch.id} missing rulesOfThumb`);
        assert.ok(ch.mentalModel.diagram.nodes.length >= 2, `${ch.id} diagram missing nodes`);
        assert.ok(ch.lab.length >= 1, `${ch.id} missing code lab`);
        assert.ok(ch.lab[0].code.trim().length > 20, `${ch.id} lab code too short`);
        assert.ok(ch.warStory.symptom.trim().length > 15, `${ch.id} missing warStory symptom`);
        assert.ok(ch.warStory.rootCause.trim().length > 15, `${ch.id} missing warStory rootCause`);
        assert.ok(
          ch.warStory.preventionRule.trim().length > 15,
          `${ch.id} missing warStory preventionRule`
        );
        assert.ok(ch.deepDive.content.length >= 1, `${ch.id} missing deepDive`);

        // Interactive check structure
        checkTypes.add(ch.check.type);
        if (ch.check.type === 'triage' || ch.check.type === 'predict') {
          assert.ok(ch.check.options.length >= 2, `${ch.id} needs >=2 options`);
          assert.equal(
            ch.check.options.filter((o) => o.isCorrect).length,
            1,
            `${ch.id} must have exactly 1 correct option`
          );
        } else if (ch.check.type === 'spot_bug') {
          assert.ok(
            ch.check.lines.some((l) => l.isBug),
            `${ch.id} spot_bug must mark a bug line`
          );
        } else if (ch.check.type === 'recall') {
          assert.ok(ch.check.modelAnswer.trim().length > 25, `${ch.id} recall answer too short`);
        }

        // Cross-links integrity
        assert.ok(ch.crossLinks.length >= 2, `${ch.id} must have >=2 crossLinks`);
        for (const link of ch.crossLinks) {
          assert.ok(
            link.targetId in CHAPTER_MAP,
            `${ch.id} crossLink targets invalid chapter ${link.targetId}`
          );
          assert.notEqual(link.targetId, ch.id, `${ch.id} must not self-link`);
        }
      }
    }

    assert.equal(totalChapters, 120);
    assert.deepEqual(
      Array.from(checkTypes).sort(),
      ['predict', 'recall', 'spot_bug', 'triage']
    );

    // Verify loadChapter direct lookup
    const sample = await loadChapter('T18-C03');
    assert.ok(sample);
    assert.equal(sample.id, 'T18-C03');
  });

  it('verifies glossary entries reference valid chapters', () => {
    assert.ok(GLOSSARY.length >= 40);
    for (const g of GLOSSARY) {
      if (g.relatedChapterId) {
        assert.ok(
          g.relatedChapterId in CHAPTER_MAP,
          `Glossary term ${g.term} references invalid chapter ${g.relatedChapterId}`
        );
      }
    }
  });
});

describe('Search, Navigation, Routing, Progress & Persistence Logic', () => {
  it('normalizes Arabic/Persian glyphs and searches across Persian, English, CLI, and error codes', () => {
    assert.equal(normalizeSearchText('سيستم‌عامل كرنل'), 'سیستم عامل کرنل');

    const kv = searchAtlas('KV-Cache');
    assert.ok(kv.chapters.some((c) => c.id === 'T18-C03'));
    assert.ok(kv.glossary.some((g) => g.term.toLowerCase().includes('kv-cache')));

    const err525 = searchAtlas('525');
    assert.ok(err525.chapters.some((c) => c.id === 'T04-C05'));

    const sysd = searchAtlas('systemd');
    assert.ok(sysd.chapters.some((c) => c.id === 'T02-C06'));

    const mcp = searchAtlas('MCP');
    assert.ok(mcp.chapters.some((c) => c.id === 'T20-C02'));
  });

  it('filters tracks per curated study path', () => {
    assert.equal(getFilteredTracks('architect').length, 20);
    assert.ok(getFilteredTracks('ai').some((t) => t.id === 'T20'));
    assert.ok(getFilteredTracks('devops').some((t) => t.id === 'T15'));
    assert.ok(getFilteredTracks('fullstack').some((t) => t.id === 'T07'));
  });

  it('computes domain progress accurately and resolves adjacent chapters', () => {
    const prog = computeDomainProgress(['T01-C01', 'T01-C02', 'T17-C01']);
    const d01 = prog.find((p) => p.domainId === 'D01')!;
    const d05 = prog.find((p) => p.domainId === 'D05')!;
    assert.equal(d01.completed, 2);
    assert.equal(d01.total, 24);
    assert.equal(d01.percent, 8);
    assert.equal(d05.completed, 1);

    const adjFirst = getAdjacentChapters('T01-C01');
    assert.equal(adjFirst.prev, null);
    assert.equal(adjFirst.next?.id, 'T01-C02');
    assert.equal(adjFirst.isNextNewTrack, false);

    const adjTrackEnd = getAdjacentChapters('T01-C06');
    assert.equal(adjTrackEnd.next?.id, 'T02-C01');
    assert.equal(adjTrackEnd.isNextNewTrack, true);

    const adjLast = getAdjacentChapters('T20-C06');
    assert.equal(adjLast.next, null);
  });

  it('parses clean paths and hash fallback routes cleanly', () => {
    assert.deepEqual(parseRoute('/', ''), { tab: 'atlas' });
    assert.deepEqual(parseRoute('/chapter/T18-C03', ''), {
      tab: 'read',
      chapterId: 'T18-C03',
    });
    assert.deepEqual(parseRoute('/', '#/chapter/t05-c06'), {
      tab: 'read',
      chapterId: 'T05-C06',
    });
    assert.deepEqual(parseRoute('/search', ''), { tab: 'search' });
    assert.deepEqual(parseRoute('/progress', ''), { tab: 'progress' });
    assert.deepEqual(parseRoute('/chapter/INVALID', ''), { tab: 'atlas' });
  });

  it('exports, imports, and sanitizes persisted state safely', () => {
    const raw = sanitizeUserState({
      completedIds: ['T01-C01', 'T01-C01', 'FAKE-ID'],
      bookmarkedIds: ['T18-C03'],
      checkOutcomes: { 'T01-C01': 'passed', 'T18-C03': 'review', BAD: 'passed' },
      notes: { 'T01-C01': 'نکته مهم تست', 'T02-C01': '   ' },
      lastReadId: 'T18-C03',
      theme: 'sepia',
      fontScale: 1.5,
      activePathId: 'ai',
    });

    assert.deepEqual(raw.completedIds, ['T01-C01']);
    assert.equal(raw.fontScale, 1.25);
    assert.equal(raw.theme, 'sepia');
    assert.equal(raw.notes['T02-C01'], undefined);

    const json = exportUserStateJson(raw);
    const imported = importUserStateJson(json);
    assert.equal(imported.ok, true);
    assert.deepEqual(imported.state, raw);

    const broken = importUserStateJson('{not valid json');
    assert.equal(broken.ok, false);

    assert.equal(toPersianDigits(120), '۱۲۰');
  });

  it('computes levels, daily streaks, badges, review queues, invite codes, and merges local + cloud states cleanly', () => {
    const lvl1 = getLevelInfo(0);
    assert.equal(lvl1.level, 1);
    const lvl3 = getLevelInfo(400);
    assert.equal(lvl3.level, 3);
    assert.ok(lvl3.progressPercent > 0 && lvl3.progressPercent < 100);

    // Streak transitions
    const s1 = touchStudyStreak(0, '2026-11-18', '2026-11-20');
    assert.equal(s1.streakDays, 1);
    const s2 = touchStudyStreak(2, '2026-11-19', '2026-11-20');
    assert.equal(s2.streakDays, 3);
    const sSame = touchStudyStreak(3, '2026-11-20', '2026-11-20');
    assert.equal(sSame.streakDays, 3);
    const sReset = touchStudyStreak(5, '2026-11-17', '2026-11-20');
    assert.equal(sReset.streakDays, 1);

    // Local + Cloud state merge preserves union of progress and strongest outcomes
    const local = sanitizeUserState({
      completedIds: ['T01-C01'],
      bookmarkedIds: ['T01-C02'],
      checkOutcomes: { 'T01-C01': 'review' },
      notes: { 'T01-C01': 'یادداشت کوتاه' },
      xp: 90,
      streakDays: 2,
      focusMinutes: 15,
      lastActiveDate: '2026-11-20',
    });
    const cloud = sanitizeUserState({
      completedIds: ['T01-C01', 'T17-C04'],
      bookmarkedIds: ['T18-C03'],
      checkOutcomes: { 'T01-C01': 'passed', 'T17-C04': 'failed' },
      notes: { 'T01-C01': 'یادداشت مفصل‌تر از فضای ابری برای این فصل' },
      xp: 220,
      streakDays: 4,
      focusMinutes: 30,
      activeGroupId: 'ATLAS-7K4M2P',
      lastActiveDate: '2026-11-19',
    });

    const merged = mergeUserStates(local, cloud);
    assert.deepEqual(merged.completedIds.sort(), ['T01-C01', 'T17-C04']);
    assert.equal(merged.checkOutcomes['T01-C01'], 'passed');
    assert.equal(merged.checkOutcomes['T17-C04'], 'failed');
    assert.equal(merged.activeGroupId, 'ATLAS-7K4M2P');
    assert.equal(merged.focusMinutes, 30);
    assert.equal(merged.streakDays, 4);
    assert.ok(merged.xp >= 220);

    // Badges & Spaced review queue
    const badges = computeBadges(merged, true);
    assert.equal(badges.find((b) => b.id === 'first-step')?.unlocked, true);
    assert.equal(badges.find((b) => b.id === 'deep-focus')?.unlocked, true);
    assert.equal(badges.find((b) => b.id === 'study-circle')?.unlocked, true);

    const queue = getSpacedReviewQueue(merged);
    assert.ok(queue.some((item) => item.chapterId === 'T17-C04' && item.reason === 'failed'));

    // Invite codes & /group routes
    const code = generateInviteCode();
    assert.match(code, /^ATLAS-[A-Z0-9]{6}$/);
    assert.deepEqual(parseRoute('/group', ''), { tab: 'group' });
    assert.deepEqual(parseRoute('/group/atlas-7k4m2p', ''), {
      tab: 'group',
      inviteCode: 'ATLAS-7K4M2P',
    });
  });
});
