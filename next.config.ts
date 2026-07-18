import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Lets the dev server accept HMR/asset requests when the site is opened
     from a phone or other device on the same LAN via this machine's IP. */
  allowedDevOrigins: ["192.168.1.106"],
};

export default nextConfig;
