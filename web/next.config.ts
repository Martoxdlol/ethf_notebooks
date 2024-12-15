import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
    rewrites: async () => {
        return [
            {
                source: '/app',
                destination: '/app/index.html',
            },
        ]
    },
}

export default nextConfig
