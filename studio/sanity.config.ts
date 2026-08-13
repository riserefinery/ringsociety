import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'
import { structure } from './structure'

export default defineConfig({
  name: 'ring-society',
  title: 'Ring Society CMS',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'p1o8iwkt',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
})
