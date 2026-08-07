import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // standalone: o Dockerfile copia .next/standalone e roda `node server.js`,
  // sem precisar do node_modules inteiro na imagem final.
  output: 'standalone',
}

export default nextConfig
