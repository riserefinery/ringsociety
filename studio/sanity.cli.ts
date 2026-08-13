import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? 'p1o8iwkt',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  deployment: {
    appId: 'l0nta56hdzqt5fc8g0hklz6g',
  },
})
