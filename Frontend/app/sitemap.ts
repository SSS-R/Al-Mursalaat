// In file: Frontend/app/sitemap.ts

import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://almursalaatonline.com'

  return [
    {
      url: baseUrl,
      // lastModified is removed
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/#courses`,
      // lastModified is removed
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#about`,
      // lastModified is removed
      changeFrequency: 'monthly',
      priority: 0.5,
    },
     {
      url: `${baseUrl}/#admission`,
      // lastModified is removed
      changeFrequency: 'yearly',
      priority: 0.9,
    },
  ]
}
