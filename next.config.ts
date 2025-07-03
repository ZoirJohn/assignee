import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
        images: {
                remotePatterns: [
                        {
                                protocol: 'https',
                                hostname: 'fvoqunlzvbitrwikipbd.supabase.co',
                                pathname: '/storage/v1/object/public/**',
                        },
                ],
        },
}

export default nextConfig
