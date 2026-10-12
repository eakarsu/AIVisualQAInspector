import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('..', import.meta.url)), '')
  const demoPair = ['DEMO', 'SEED_ADMIN', 'ADMIN', 'DEFAULT']
    .map(prefix => [env[`${prefix}_EMAIL`], env[`${prefix}_PASSWORD`]])
    .find(([email, password]) => email && password)
  const allowLocalDemoFill = command === 'serve' && env.ENABLE_DEMO_CREDENTIAL_AUTOFILL === 'true'
  const [demoEmail, demoPassword] = allowLocalDemoFill && demoPair ? demoPair : ['', '']

  return {
  plugins: [react()],
  define: {
    'import.meta.env.VITE_DEMO_EMAIL': JSON.stringify(demoEmail),
    'import.meta.env.VITE_DEMO_PASSWORD': JSON.stringify(demoPassword)
  },
  server: {
    port: parseInt(process.env.FRONTEND_PORT || '3000', 10),
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || `http://127.0.0.1:${process.env.BACKEND_PORT || '3001'}`,
        changeOrigin: true
      }
    }
  }
  }
})
