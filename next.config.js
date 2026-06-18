/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,  
    typescript: {
        ignoreBuildErrors: true,
    },
    // experimental: {
    //     turbo: {
    //       root: __dirname,  
    //     },
    // },
};
module.exports = nextConfig;
