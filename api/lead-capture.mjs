const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function parseLead(body = {}) {
  const firstName = String(body.firstName ?? '').trim()
  const lastName = String(body.lastName ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const source = String(body.source ?? 'Ring Society Website').trim().slice(0, 120)

  if (!firstName || !lastName || !EMAIL_PATTERN.test(email)) return null
  if (String(body.website ?? '').trim()) return { blocked: true }

  return { firstName, lastName, email, source }
}

export default async function leadCapture(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const lead = parseLead(req.body)
  if (!lead) return res.status(400).json({ error: 'Please provide a first name, last name, and valid email address.' })
  if (lead.blocked) return res.status(200).json({ ok: true })

  const workflowUrl = process.env.GHL_INBOUND_WEBHOOK_URL
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
      }),
    })

    if (!upstream.ok) {
      console.error('[lead-capture] GoHighLevel workflow returned', upstream.status)
      return res.status(502).json({ error: 'We could not deliver your message. Please try again.' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[lead-capture] GoHighLevel handoff failed', error)
    return res.status(502).json({ error: 'We could not deliver your message. Please try again.' })
  }
}
