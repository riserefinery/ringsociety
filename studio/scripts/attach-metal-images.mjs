/**
 * Uploads the supplied per-metal images and attaches each one to its answer choice.
 *
 * Idempotent: assets are matched by their namespaced filename, so re-running reuses what is already
 * there rather than piling up duplicates. Only the `imageByMetal` field of each choice is written —
 * every other field, including anything edited in the Studio, is left exactly as it is.
 *
 * Usage: node scripts/attach-metal-images.mjs [--dry-run]
 */
import { createReadStream } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { getCliClient } from 'sanity/cli'

const SOURCE_ROOT =
  '/Users/warren/Desktop/Rise Refinery/ShopFine/Ring Society/Funnel Images'

const DRY_RUN = process.argv.includes('--dry-run')

const METALS = [
  { folder: 'White Gold', value: 'platinum_or_white_gold', label: 'platinum or white gold' },
  { folder: 'Yellow Gold', value: 'yellow_gold', label: 'yellow gold' },
  { folder: 'Rose Gold', value: 'rose_gold', label: 'rose gold' },
]

/**
 * Each question's choices, with the filename fragments that identify them.
 *
 * The supplied files were named by hand, so the spelling varies between folders ("3_stone" in two
 * folders, "3 Stone" in another). Matching is therefore done on a normalised form of the name, with
 * the aliases listed explicitly rather than guessed, so a file can never land on the wrong choice.
 */
const TARGETS = [
  {
    routeKey: 'find-your-ring',
    stepId: 'q4',
    folder: 'Style Options',
    subject: (label) => label.toLowerCase(),
    options: [
      { value: 'classic_timeless', aliases: ['classic and timeless'] },
      { value: 'romantic_vintage', aliases: ['romantic vintage'] },
      { value: 'modern_minimal', aliases: ['modern and minimal'] },
      { value: 'bold_statement', aliases: ['bold statement'] },
    ],
  },
  {
    routeKey: 'design-your-ring',
    stepId: 'q1-setting',
    folder: 'Setting Images',
    subject: (label) => label.toLowerCase(),
    options: [
      { value: 'solitaire', aliases: ['solitaire'] },
      { value: 'cathedral', aliases: ['cathedral'] },
      { value: 'classic_halo', aliases: ['classic halo'] },
      { value: 'hidden_halo', aliases: ['hidden halo'] },
      { value: 'three_stone', aliases: ['3 stone', 'three stone'] },
      { value: 'pave_band', aliases: ['pave band'] },
      { value: 'bezel', aliases: ['bezel'] },
      { value: 'toi_et_moi', aliases: ['vintage'] },
    ],
  },
]

/** Lowercase, strip accents and punctuation, collapse spaces. */
const normalise = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_&]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

const client = getCliClient({ apiVersion: '2025-01-01' })

const fetchQuiz = (routeKey) =>
  client.fetch(
    `*[_type == "quiz" && routeKey == $routeKey][0]{ _id, steps[]{ _key, stepId, options[]{ _key, value, label } } }`,
    { routeKey }
  )

const uploadImage = async (path, filename) => {
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{ _id, url }`,
    { filename }
  )
  if (existing) return { assetId: existing._id, url: existing.url, reused: true }

  const asset = await client.assets.upload('image', createReadStream(path), { filename })
  return { assetId: asset._id, url: asset.url, reused: false }
}

const main = async () => {
  let uploaded = 0
  let reused = 0
  const problems = []

  for (const target of TARGETS) {
    const quiz = await fetchQuiz(target.routeKey)
    if (!quiz) {
      problems.push(`${target.routeKey}: quiz document not found`)
      continue
    }
    const step = (quiz.steps ?? []).find((entry) => entry.stepId === target.stepId)
    if (!step) {
      problems.push(`${target.routeKey}: step ${target.stepId} not found`)
      continue
    }

    console.log(`\n${target.routeKey} — ${target.stepId}`)

    for (const option of target.options) {
      const live = (step.options ?? []).find((entry) => entry.value === option.value)
      if (!live) {
        problems.push(`${target.routeKey}/${target.stepId}: choice ${option.value} not found`)
        continue
      }

      const imageByMetal = []

      for (const metal of METALS) {
        const dir = join(SOURCE_ROOT, target.folder, metal.folder)
        let entries = []
        try {
          entries = await readdir(dir)
        } catch {
          problems.push(`missing folder: ${dir}`)
          continue
        }

        const match = entries.find((entry) => {
          if (!entry.toLowerCase().endsWith('.png')) return false
          const name = normalise(entry)
          if (!name.startsWith(target.folder === 'Style Options' ? 'style' : 'setting')) return false
          // The metal appears twice in one file ("hidden halo-yellowgold-yellowgold"); strip any
          // trailing metal words before matching the subject so it still resolves.
          const withoutMetal = name
            .replace(/\b(white|yellow|rose)\s*gold\b/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          return option.aliases.some((alias) => withoutMetal.includes(normalise(alias)))
        })

        if (!match) {
          problems.push(`no image for ${option.value} in ${metal.folder}`)
          continue
        }

        const path = join(dir, match)
        const { size } = await stat(path)
        if (size === 0) {
          problems.push(`empty file: ${match}`)
          continue
        }

        const filename = `funnel-metal-${target.stepId}-${option.value}-${metal.value}.png`
        if (DRY_RUN) {
          console.log(`  would attach  ${option.value.padEnd(18)} ${metal.label.padEnd(22)} <- ${match}`)
          continue
        }

        const { assetId, url, reused: wasReused } = await uploadImage(path, filename)
        if (wasReused) reused += 1
        else uploaded += 1

        imageByMetal.push({
          _type: 'metalImage',
          _key: `${metal.value}`,
          metal: metal.value,
          image: { _type: 'image', asset: { _type: 'reference', _ref: assetId } },
          alt: `${live.label} engagement ring in ${metal.label}`,
        })

        console.log(
          `  ${wasReused ? 'reused ' : 'upload '} ${option.value.padEnd(18)} ${metal.label.padEnd(22)} ${url.split('/').pop()}`
        )
      }

      if (DRY_RUN || imageByMetal.length === 0) continue

      // Writes only this field, addressed by key, so nothing else in the document is touched.
      await client
        .patch(quiz._id)
        .set({
          [`steps[_key=="${step._key}"].options[_key=="${live._key}"].imageByMetal`]: imageByMetal,
        })
        .commit()
      console.log(`  attached ${imageByMetal.length} variant(s) to ${option.value}`)
    }
  }

  console.log(
    `\n${DRY_RUN ? 'Dry run. ' : ''}${uploaded} uploaded, ${reused} reused, ${problems.length} problem(s).`
  )
  if (problems.length) {
    console.log('\nProblems:')
    for (const problem of problems) console.log(`  - ${problem}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})