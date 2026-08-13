export type LeadPayload = {
  firstName: string
  lastName: string
  email: string
  source: string
  website?: string
}

export async function submitLead(payload: LeadPayload) {
  const response = await fetch('/api/lead-capture', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.error || 'We could not deliver your message. Please try again.')
  }
}
