"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sitemapController = sitemapController;
const PgTrailRepository_1 = require("../../infra/repositories/PgTrailRepository");
const trailRepo = new PgTrailRepository_1.PgTrailRepository();
async function sitemapController(req, res) {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const trails = await trailRepo.findAllPublished();
    const urls = [
        "",
        "/trilhas.html",
        "/contato.html",
        "/admin.html",
        ...trails.map((t) => `/trilha.html?slug=${t.slug}`)
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
        .map((path) => `<url>
  <loc>${baseUrl}${path}</loc>
  <changefreq>weekly</changefreq>
</url>`)
        .join("\n")}
</urlset>`;
    res.header("Content-Type", "application/xml").send(xml);
}
