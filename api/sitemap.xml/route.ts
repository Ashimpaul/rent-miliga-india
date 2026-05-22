import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const SITE_URL = 'https://rentmilega.in';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET() {
  try {
    const staticPages = [
      { loc: SITE_URL, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 1.0 },
      { loc: `${SITE_URL}/rentals`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.9 },
      { loc: `${SITE_URL}/post`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: 0.8 },
      { loc: `${SITE_URL}/blogs`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'daily', priority: 0.9 },
      { loc: `${SITE_URL}/about`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.8 },
      { loc: `${SITE_URL}/contact`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.8 },
      { loc: `${SITE_URL}/help`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.5 },
      { loc: `${SITE_URL}/terms`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.3 },
      { loc: `${SITE_URL}/privacy`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'monthly', priority: 0.3 },
    ];

    const popularLocations = [
      'Silchar', 'Guwahati', 'Dibrugarh', 'Jorhat', 'Tezpur', 'Karimganj', 'Hailakandi'
    ];

    const locationPages = popularLocations.map(loc => ({
      loc: `${SITE_URL}/rentals?q=${encodeURIComponent(loc)}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    }));

    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
    }

    const listingPages = (listings || []).map(listing => ({
      loc: `${SITE_URL}/listing/${listing.id}`,
      lastmod: new Date(listing.created_at).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    }));

    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select('slug, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (blogsError) {
      console.error('Error fetching blogs:', blogsError);
    }

    const blogPages = (blogs || []).map(blog => ({
      loc: `${SITE_URL}/blog/${blog.slug}`,
      lastmod: new Date(blog.created_at).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    }));

    const allPages = [
      ...staticPages,
      ...locationPages,
      ...listingPages,
      ...blogPages
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
