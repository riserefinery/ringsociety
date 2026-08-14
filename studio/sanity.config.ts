import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'
import { structure } from './structure'

export default defineConfig({
  name: 'ring-society',
  title: 'Ring Society CMS',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'p1o8iwkt',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [
    structureTool({ structure }),
    visionTool(),
    presentationTool({
      previewUrl: {
        origin: process.env.SANITY_STUDIO_PREVIEW_URL ?? 'https://ringsociety-web.vercel.app',
      },
    }),
  ],
  schema: { types: schemaTypes },
})
