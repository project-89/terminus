/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com",
              "script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com",
              "worker-src 'self' blob: https://unpkg.com",
              "connect-src 'self' https://unpkg.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 