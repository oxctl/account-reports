import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [mkcert({
	keyFileName: './localhost-key.pem',
	certFileName: './localhost.pem'

}), react()],
  server: {
   port: 3000,
   https: true,
    proxy: {
      '/api': 'https://oxeval.instructure.com'
    },
  },
})
