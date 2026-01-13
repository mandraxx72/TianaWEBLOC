/**
 * Sitemap Generator for Casa Tiana
 * 
 * This script generates a sitemap.xml file containing all pages and room anchors
 * to improve search engine indexing.
 * 
 * Run: npm run generate-sitemap
 */

import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://casatiana.com';

// Room IDs that match the ones in src/components/rooms/roomsData.ts
const ROOM_IDS = ['dunas', 'baia-tranquila', 'terraco-sol', 'morabeza'];

interface SitemapEntry {
    loc: string;
    lastmod: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
}

function generateSitemap(): void {
    const today = new Date().toISOString().split('T')[0];

    // Define all pages with their SEO metadata
    const pages: SitemapEntry[] = [
        // Main pages
        {
            loc: `${BASE_URL}/`,
            lastmod: today,
            changefreq: 'weekly',
            priority: 1.0,
        },
        {
            loc: `${BASE_URL}/auth`,
            lastmod: today,
            changefreq: 'yearly',
            priority: 0.3,
        },
        {
            loc: `${BASE_URL}/minhas-reservas`,
            lastmod: today,
            changefreq: 'yearly',
            priority: 0.3,
        },
        {
            loc: `${BASE_URL}/blog/trilhas-mindelo`,
            lastmod: today,
            changefreq: 'monthly',
            priority: 0.7,
        },
    ];

    // Add room anchor URLs (rooms section on homepage)
    ROOM_IDS.forEach((roomId) => {
        pages.push({
            loc: `${BASE_URL}/#quarto-${roomId}`,
            lastmod: today,
            changefreq: 'monthly',
            priority: 0.8,
        });
    });

    // Generate XML content
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
            .map(
                (page) => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`
            )
            .join('\n')}
</urlset>
`;

    // Write to public folder
    const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xmlContent, 'utf-8');

    console.log(`✅ Sitemap generated successfully at: ${outputPath}`);
    console.log(`   Total URLs: ${pages.length}`);
    console.log(`   - Main pages: ${pages.length - ROOM_IDS.length}`);
    console.log(`   - Room anchors: ${ROOM_IDS.length}`);
}

generateSitemap();
