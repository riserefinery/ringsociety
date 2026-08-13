import { createBrowserRouter } from 'react-router'
import Root from './Root'
import Home from '../pages/Home'
import TopGuides from '../pages/TopGuides'
import Resources from '../pages/Resources'
import OurMission from '../pages/OurMission'
import Article from '../pages/Article'
import Contact from '../pages/Contact'
import LegalPlaceholder from '../pages/LegalPlaceholder'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'top-guides', Component: TopGuides },
      { path: 'all-resources', Component: Resources },
      { path: 'our-mission', Component: OurMission },
      { path: 'guides/:slug', Component: Article },
      { path: 'contact', Component: Contact },
      { path: 'privacy-policy', Component: () => <LegalPlaceholder title="Privacy Policy" /> },
      { path: 'terms-and-conditions', Component: () => <LegalPlaceholder title="Terms & Conditions" /> },
      { path: 'accessibility', Component: () => <LegalPlaceholder title="Accessibility" /> },
      { path: 'do-not-sell', Component: () => <LegalPlaceholder title="Do Not Sell My Personal Information" /> },
    ],
  },
])
