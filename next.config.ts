import type { NextConfig } from "next"; 

const nextConfig: NextConfig = { 
  typescript: { 
    ignoreBuildErrors: true 
  },
  async redirects() {
    if (process.env.IS_ADMIN_APP === 'true') {
      return [
        {
          source: '/',
          destination: '/admin/login',
          permanent: false,
        },
      ]
    }
    return []
  }
}; 

export default nextConfig;
