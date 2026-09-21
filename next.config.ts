import type { NextConfig } from "next";

/**
 * GitHub Pages serves static files from a project subpath
 * (yuka11232.github.io/LoomLock-Project), so the deployed build needs a
 * basePath. Local `next dev` and `next build` must not have one, or every
 * link breaks on localhost — the Pages workflow sets GITHUB_PAGES=true and
 * nothing else does.
 */
const isPages = process.env.GITHUB_PAGES === "true";
const repo = "/LoomLock-Project";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Static HTML export. There is no server in this app — every page is a
   * client component reading the demo workspace out of localStorage — so
   * exporting costs nothing. It does mean every dynamic route must enumerate
   * its params at build time; see the generateStaticParams in the learn and
   * store routes, and the query-param detail pages under products/ and
   * orders/ whose ids are only known at runtime.
   */
  output: "export",

  /** Pages serves /products/ as a directory, so emit products/index.html. */
  trailingSlash: true,

  /** No Image Optimization server exists in an export. */
  images: { unoptimized: true },

  ...(isPages ? { basePath: repo, assetPrefix: repo } : {}),
};

export default nextConfig;
