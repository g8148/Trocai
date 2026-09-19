import withSerwistInit from "@serwist/next"
import { randomUUID } from "node:crypto"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const projectRoot = fileURLToPath(new URL(".", import.meta.url))
const gitRevision = spawnSync("git", ["rev-parse", "HEAD"], {
  cwd: projectRoot,
  encoding: "utf8",
}).stdout?.trim()
const buildRevision = process.env.GIT_COMMIT_SHA || gitRevision || randomUUID()

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/offline", revision: buildRevision }],
  disable: process.env.NODE_ENV !== "production",
  register: true,
  scope: "/",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: projectRoot,
}

export default withSerwist(nextConfig)
