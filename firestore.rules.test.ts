import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');
const rulesText = fs.readFileSync(rulesPath, 'utf8');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

test('firestore.rules enforces rules_version 2 and default-deny catch-all first', () => {
  assert.match(rulesText, /^rules_version\s*=\s*'2';/);
  const defaultDenyIdx = rulesText.indexOf('match /{document=**}');
  const firstCollectionIdx = rulesText.indexOf('match /users/{userId}');
  assert.ok(defaultDenyIdx !== -1, 'Default deny catch-all missing');
  assert.ok(firstCollectionIdx !== -1, '/users/{userId} rule missing');
  assert.ok(
    defaultDenyIdx < firstCollectionIdx,
    'Default deny rule must appear before collection match blocks'
  );
  assert.match(rulesText, /match \/\{document=\*\*\}\s*\{\s*allow read, write:\s*if false;\s*\}/);
});

test('firestore.rules prevents user collection scraping and cross-user reads', () => {
  assert.match(rulesText, /match \/users\/\{userId\}[\s\S]*allow get:\s*if isOwner\(userId\) && isValidId\(userId\);/);
  assert.match(rulesText, /match \/users\/\{userId\}[\s\S]*allow list:\s*if false;/);
});

test('firestore.rules enforces verified email and strict server timestamps on writes', () => {
  assert.match(rulesText, /function isVerified\(\)\s*\{\s*return isSignedIn\(\) && request\.auth\.token\.email_verified == true;\s*\}/);
  assert.ok(rulesText.includes('incoming().createdAt == request.time'));
  assert.ok(rulesText.includes('incoming().updatedAt == request.time'));
});

test('firestore.rules enforces strict ID validation and bounded payloads against Dirty Dozen attacks', () => {
  assert.ok(rulesText.includes("id.matches('^[a-zA-Z0-9_\\\\-]+$')"));
  assert.ok(rulesText.includes('d.memberUids.size() <= 25'));
  assert.ok(rulesText.includes('d.body is string && d.body.size() >= 1 && d.body.size() <= 800'));
  assert.ok(rulesText.includes('d.completedIds is list && d.completedIds.size() <= 120'));
  assert.ok(rulesText.includes('d.notes is map && d.notes.size() <= 120'));
});

test('firestore.rules enforces action-based update guards with affectedKeys().hasOnly(...)', () => {
  const affectedMatches = rulesText.match(/affectedKeys\(\)\.hasOnly\(/g) ?? [];
  assert.ok(
    affectedMatches.length >= 5,
    `Expected at least 5 action-based update guards, found ${affectedMatches.length}`
  );
  assert.ok(
    rulesText.includes('existing().ownerId == request.auth.uid'),
    'Owner guard missing on StudyGroup metadata update'
  );
  assert.ok(
    rulesText.includes('allow update: if false;'),
    'GroupNote updates must remain immutable'
  );
});

test('firestore.rules prevents StudyGroup scraping via memberUids-scoped list rule', () => {
  assert.match(
    rulesText,
    /match \/studyGroups\/\{groupId\}[\s\S]*allow list:\s*if isSignedIn\(\) && request\.auth\.uid in existing\(\)\.memberUids;/
  );
});

test('firestore.rules schema validators cover every required key declared in firebase-blueprint.json', () => {
  const entityToValidator: Record<string, string> = {
    UserProfile: 'isValidUserProfile',
    StudyGroup: 'isValidStudyGroup',
    GroupMember: 'isValidGroupMember',
    GroupNote: 'isValidGroupNote',
  };

  for (const [entityName, validatorName] of Object.entries(entityToValidator)) {
    const entity = blueprint.entities[entityName];
    assert.ok(entity, `Missing entity ${entityName} in blueprint`);
    const fnStart = rulesText.indexOf(`function ${validatorName}(`);
    assert.ok(fnStart !== -1, `Missing validator ${validatorName} in firestore.rules`);
    const fnSlice = rulesText.slice(fnStart, fnStart + 2500);
    for (const reqKey of entity.required as string[]) {
      assert.ok(
        fnSlice.includes(`'${reqKey}'`),
        `Required blueprint field '${reqKey}' missing from ${validatorName}`
      );
    }
  }
});
