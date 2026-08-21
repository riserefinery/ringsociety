import { createBrowserRouter, Navigate } from 'react-router'
import Root from './Root'
import Home from '../pages/Home'
import TopGuides from '../pages/TopGuides'
import Resources from '../pages/Resources'
import OurMission from '../pages/OurMission'
import Article from '../pages/Article'
import Contact from '../pages/Contact'
import LegalPage from '../pages/LegalPage'
import privacyPolicy from '../content/legal/privacy-policy.md?raw'
import termsAndConditions from '../content/legal/terms-and-conditions.md?raw'
import accessibilityStatement from '../content/legal/accessibility-statement.md?raw'
import privacyChoices from '../content/legal/privacy-choices.md?raw'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'top-guides', Component: TopGuides },
      { path: 'all-resources', Component: Resources },
      { path: 'our-mission', Component: OurMission },
      { path: 'guides/go-big-or-shop-small', element: <Navigate replace to="/guides/big-box-vs-local-vs-online-jewelers" /> },
      { path: 'guides/most-popular-trending-ring-styles-2026', element: <Navigate replace to="/guides/engagement-ring-trends-2026" /> },
      { path: 'guides/:slug', Component: Article },
      { path: 'contact', Component: Contact },
      { path: 'privacy-policy', Component: () => <LegalPage title="Privacy Policy" document={privacyPolicy} /> },
      { path: 'terms-and-conditions', Component: () => <LegalPage title="Terms & Conditions" document={termsAndConditions} /> },
      { path: 'accessibility', Component: () => <LegalPage title="Accessibility Statement" document={accessibilityStatement} /> },
      { path: 'do-not-sell', Component: () => <LegalPage title="Your Privacy Choices" document={privacyChoices} showPrivacyRequestNote /> },
    ],
  },
])
