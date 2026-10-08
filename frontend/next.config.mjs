import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundles a minimal Node server (server.js) for Azure App Service
  output: "standalone",
  // Pin the root to this folder so a stray lockfile higher up can't change the standalone layout
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
