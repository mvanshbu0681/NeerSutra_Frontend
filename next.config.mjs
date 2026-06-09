import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // A stray package-lock.json exists in the parent folder, which made Next
  // infer the wrong workspace root. Pin tracing to THIS app's directory.
  outputFileTracingRoot: __dirname,
  // Don't advertise the framework in response headers.
  poweredByHeader: false,
  // Strip console.log/debug/info from production bundles (keep error & warn).
  // Removes dev noise without editing every call site.
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },
};

export default nextConfig;
