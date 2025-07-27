/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dopaforge.com',
  generateRobotsTxt: false, // We already have a custom robots.txt
  generateIndexSitemap: true,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/api/*',
    '/auth/callback',
    '/focus/*',
    '/setup',
    '/auth',
  ],
  additionalPaths: async (config) => {
    const result = []
    
    // Add landing page with highest priority
    result.push({
      loc: '/',
      changefreq: 'daily',
      priority: 1.0,
      lastmod: new Date().toISOString(),
    })
    
    // Add dashboard
    result.push({
      loc: '/dashboard',
      changefreq: 'daily',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    })
    
    // Add settings
    result.push({
      loc: '/settings',
      changefreq: 'monthly',
      priority: 0.5,
      lastmod: new Date().toISOString(),
    })
    
    return result
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/callback', '/focus/'],
      },
    ],
  },
}