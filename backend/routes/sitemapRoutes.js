import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// Not under /api — sitemaps are conventionally expected at the domain
// root (https://yourdomain.com/sitemap.xml). If your production setup
// proxies the frontend and backend behind the same domain, route
// /sitemap.xml to this backend endpoint instead of the static file in
// frontend/public/sitemap.xml for full, always-current product coverage.
router.get("/sitemap.xml", async (req, res) => {
  const siteUrl = process.env.SITE_URL || "https://www.soolect.com";
  const products = await Product.find({}).select("slug updatedAt");

  const staticUrls = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/products", priority: "0.9", changefreq: "daily" },
    { loc: "/about", priority: "0.5", changefreq: "monthly" },
    { loc: "/return-exchange", priority: "0.3", changefreq: "monthly" },
    { loc: "/affiliate", priority: "0.4", changefreq: "monthly" },
  ];

  const productUrls = products.map((p) => ({
    loc: `/products/${p.slug}`,
    priority: "0.8",
    changefreq: "weekly",
    lastmod: p.updatedAt?.toISOString().split("T")[0],
  }));

  const all = [...staticUrls, ...productUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) => `  <url>
    <loc>${siteUrl}${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.type("application/xml").send(xml);
});

export default router;
