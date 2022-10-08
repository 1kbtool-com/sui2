import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import handlebars from 'vite-plugin-handlebars'
import { VitePWA } from 'vite-plugin-pwa'
import { getIconSVG } from './icons'

let dataFilename = process.env.DATA_FILENAME || './data.json'

var data
try {
  data = JSON.parse(readFileSync(dataFilename))
} catch (e) {
  if (e.code === 'ENOENT' && !process.env.DATA_FILENAME) {
    console.log('data.json missing, fall back to data.example.json')
    data = await import('./data.example.json')
  } else {
    throw e;
  }
}


export default defineConfig({
  // use relative path for assets
  base: "",
  build: {
    // put assets in the same folder as index.html
    assetsDir: ".",
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  plugins: [
    VitePWA({
      injectRegister: 'auto',
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        "name": "SUI2",
        "short_name": "sui2",
        "description": "A startpage",
        "icons": [
          {
            "src": "icon-512.png",
            "type": "image/png",
            "sizes": "512x512"
          }
        ],
        "start_url": "/",
        "display": "standalone"
      }
    }),
    handlebars({
      context: data,
      helpers: {
        iconify: (name) => {
          const svg = getIconSVG(name)
          if (!svg) return `no icon ${name}`
          return svg
        },
        domain: (url) => {
          var o = new URL(url);
          if (o.port) {
            return `${o.hostname}:${o.port}`
          }
          return o.hostname
        }
      }
    }),
  ],
})
