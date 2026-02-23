import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@tomos/ui", "@tomos/api"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
