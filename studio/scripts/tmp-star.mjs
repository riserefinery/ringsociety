import { getCliClient } from 'sanity/cli';
const client = getCliClient({ apiVersion: '2025-01-01' });
const docId = 'quiz-find-a-jeweler';
const doc = await client.getDocument(docId);
const step = (doc.steps ?? []).find((s) => (s.subtitle ?? '').includes('text you a Diamond Card'));
if (!step) { console.log('  no matching step found'); process.exit(0); }
const current = step.subtitle;
const next = current.endsWith('*') ? current : `${current.replace(/\*+$/, '')}*`;
await client.patch(docId).set({ [`steps[_key=="${step._key}"].subtitle`]: next }).commit();
console.log('  before:', current);
console.log('  after :', next);
