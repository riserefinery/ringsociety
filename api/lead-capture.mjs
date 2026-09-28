const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CONTACT_TOPICS = new Set([
  'General question about engagement rings',
  'Jeweler partnership inquiry',
  'Press or media inquiry',
  'Feedback or suggestion',
  'Other',
])
const ALLOWED_ORIGIN_HOSTS = new Set(['ringsociety.com', 'www.ringsociety.com', 'ringsociety-web.vercel.app'])
const MIN_COMPLETION_MS = 1_500
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000
const RATE_LIMIT_MAX_SUBMISSIONS = 3
const submissionAttempts = new Map()

export function resetLeadRateLimits() {
  submissionAttempts.clear()
}

export function isAllowedOrigin(origin) {
  if (!origin) return false

  try {
    const { hostname, protocol } = new URL(origin)
    if (protocol !== 'https:' && hostname !== 'localhost') return false
    return ALLOWED_ORIGIN_HOSTS.has(hostname) || (hostname.startsWith('ringsociety') && hostname.endsWith('.vercel.app')) || hostname === 'localhost'
  } catch {
    return false
  }
}

export function getClientIp(headers = {}) {
  const forwarded = headers['x-vercel-forwarded-for'] ?? headers['x-forwarded-for'] ?? headers['x-real-ip']
  return String(forwarded ?? 'unknown').split(',')[0].trim() || 'unknown'
}

export function hasHumanCompletionTime(formStartedAt, now = Date.now()) {
  const startedAt = Number(formStartedAt)
  return Number.isFinite(startedAt) && startedAt <= now && now - startedAt >= MIN_COMPLETION_MS
}

export function isRateLimited(key, now = Date.now()) {
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const attempts = (submissionAttempts.get(key) ?? []).filter((attempt) => attempt > windowStart)
  attempts.push(now)
  submissionAttempts.set(key, attempts)

  if (submissionAttempts.size > 1_000) {
    for (const [entryKey, entryAttempts] of submissionAttempts) {
      if (!entryAttempts.some((attempt) => attempt > windowStart)) submissionAttempts.delete(entryKey)
    }
  }

  return attempts.length > RATE_LIMIT_MAX_SUBMISSIONS
}

export function parseLead(body = {}) {
  const firstName = String(body.firstName ?? '').trim()
  const lastName = String(body.lastName ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const source = String(body.source ?? 'Ring Society Website').trim().slice(0, 120)
  const topic = String(body.topic ?? '').trim().slice(0, 160)
  const message = String(body.message ?? '').trim().slice(0, 4000)

  if (!firstName || !lastName || !EMAIL_PATTERN.test(email)) return null
  if (String(body.website ?? body.companyWebsite ?? '').trim()) return { blocked: true }
  if (source === 'contact' && !CONTACT_TOPICS.has(topic)) return null

  return {
    firstName,
    lastName,
    email,
    source,
    ...(topic ? { topic } : {}),
    ...(message ? { message } : {}),
  }
}

export default async function leadCapture(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!isAllowedOrigin(req.headers?.origin)) return res.status(403).json({ error: 'We could not verify this submission. Please try again.' })
  if (!hasHumanCompletionTime(req.body?.formStartedAt)) return res.status(422).json({ error: 'Please take a moment to complete the form and try again.' })

  const lead = parseLead(req.body)
  if (!lead) return res.status(400).json({ error: 'Please provide a first name, last name, and valid email address.' })
  if (lead.blocked) return res.status(422).json({ error: 'We could not verify this submission. Please try again.' })
  if (isRateLimited(`${getClientIp(req.headers)}:${lead.source}`)) {
    return res.status(429).json({ error: 'Too many submissions from this connection. Please wait a few minutes and try again.' })
  }

  const workflowUrl = process.env.N8N_LEAD_WEBHOOK_URL
  if (!workflowUrl) return res.status(503).json({ error: 'Lead capture is not configured yet.' })

  try {
    const upstream = await fetch(workflowUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        source: lead.source,
        ...(lead.topic ? { topic: lead.topic } : {}),
        ...(lead.message ? { message: lead.message } : {}),
      }),
    })

    if (!upstream.ok) {
      console.error('[lead-capture] n8n lead workflow returned', upstream.status)
      return res.status(502).json({ error: 'We could not deliver your message. Please try again.' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[lead-capture] n8n lead workflow handoff failed', error)
    return res.status(502).json({ error: 'We could not deliver your message. Please try again.' })
  }
}
