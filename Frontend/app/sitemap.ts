// In file: Frontend/app/sitemap.ts

import { MetadataRoute } from 'next'

// --- NEW: Explicitly declare the route as static ---
// This tells Next.js to treat this file as purely static, which is
// required for the `output: 'export'` configuration.
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://almursalaatonline.com'

  return [
    {
      url: baseUrl,
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/#courses`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
     {
      url: `${baseUrl}/#admission`,
      changeFrequency: 'yearly',
      priority: 0.9,
    },
  ]
}
