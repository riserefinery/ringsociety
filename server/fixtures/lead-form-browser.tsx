import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import LeadForm from '../../src/components/LeadForm'

const root = document.getElementById('root')!
const variant = root.dataset.variant === 'contact' ? 'contact' : 'compact'
const form = (
  <React.StrictMode>
    <LeadForm
      variant={variant}
      source={variant === 'contact' ? 'contact' : 'lead-magnet'}
      submitLabel="Send test"
      successMessage="Fixture success"
    />
  </React.StrictMode>
)

// The production entry currently uses createRoot; hydration is also tested for
// compatibility if the prerendered page is later hydrated instead.
if (root.dataset.mount === 'hydrate') hydrateRoot(root, form)
else createRoot(root).render(form)
