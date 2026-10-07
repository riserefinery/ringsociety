import { createReadStream } from 'node:fs';
import path from 'node:path';

import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2025-01-01' });
const APP = path.resolve(process.cwd(), '../../shopfine/public/images');

const HEADING = 'One Last Thing Before We Reveal Your Jeweler';
const DOC_ID = 'quiz-find-a-jeweler';

const upload = (file, label) =>
  client.assets
    .upload('image', createReadStream(path.join(APP, file)), { filename: `funnel-${file}` })
    .then((asset) => {
      console.log(`  uploaded ${label}: ${asset._id}`);
      return { _type: 'funnelImage', image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } };
    });

const [mobile, desktop] = await Promise.all([
  upload('hero-bg-mobile.png', 'mobile marble'),
  upload('hero-main-quiz-bg.png', 'desktop marble'),
]);

await client.patch(DOC_ID).set({ 'phonePrompt.heading': HEADING, 'phonePrompt.mobile': mobile, 'phonePrompt.desktop': desktop }).commit();
console.log(`  patched ${DOC_ID}.phonePrompt`);
console.log('  heading:', HEADING);
