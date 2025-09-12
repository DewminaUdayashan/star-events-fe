/** @type {import('next').NextConfig} */
const nextConfig = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@next/next/no-img-element": "off",
  },
};

module.exports = nextConfig;
