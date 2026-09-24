import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep `next dev` from writing AGENTS.md and CLAUDE.md into the repo.
  agentRules: false,
};

export default nextConfig;
