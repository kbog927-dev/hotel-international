// Génère le site statique dans dist/ à partir de src/ et assets/.
// Usage : node build.mjs   (aucune dépendance à installer)
import { mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { site, rooms } from './src/content.mjs';
import { pages } from './src/pages.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, 'assets'), join(dist, 'assets'), { recursive: true });

for (const [file, render] of Object.entries(pages)) {
  await writeFile(join(dist, file), render(), 'utf8');
}

// Configuration publique lue par le navigateur (aucun secret ici).
const config = {
  demoMode: site.demoMode,
  hotelName: site.hotel.name,
  phone: site.hotel.phone,
  whatsapp: site.hotel.whatsapp,
  responseTime: site.hotel.responseTime,
  reservation: site.reservation,
  analytics: site.analytics,
  rooms: rooms.map((r) => ({ id: r.id, label: r.name || (site.demoMode ? r.placeholderName : `Comme la photo « ${r.photoLabel} »`) })),
};
await writeFile(join(dist, 'assets/js/config.js'), `window.HOTEL_CONFIG = ${JSON.stringify(config, null, 2)};\n`, 'utf8');

// Publication : indexation autorisée ; sitemap seulement si l'adresse du site est connue.
await writeFile(
  join(dist, 'robots.txt'),
  site.demoMode ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n${site.url ? `Sitemap: ${site.url}/sitemap.xml\n` : ''}`,
  'utf8',
);
if (!site.demoMode && site.url) {
  const urls = Object.keys(pages)
    .map((p) => `  <url><loc>${site.url}/${p === 'index.html' ? '' : p}</loc></url>`)
    .join('\n');
  await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
}

console.log(`Site généré dans dist/ (${Object.keys(pages).length} pages, mode ${site.demoMode ? 'DÉMONSTRATION' : 'publication'}, envoi : ${site.reservation.mode}).`);
