import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
   allowedDevOrigins: [
    "http://172.21.144.1:3000",
    "http://localhost:3000",
    'local-origin.dev', '*.local-origin.dev'
  ],
   serverExternalPackages: [
    "sequelize",
    "sequelize-typescript",
    "mysql2",
    "pg",
    "pg-hstore"
  ],
};

export default nextConfig;
