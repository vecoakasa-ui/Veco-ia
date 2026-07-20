import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', 
        '/syndic/', 
        '/locataire/', 
        '/admin/', 
        '/system-admin/', 
        '/explorer/'
      ],
    },
    sitemap: 'https://veco-ia.vercel.app/sitemap.xml',
  }
}
