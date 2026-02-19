import * as esbuild from 'esbuild'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import path from 'path'

const entryPoints = [
  'src/index.html',
  'src/viewer.html',
  'src/viewer.js',

  'src/diplomatic/index.html',
  'src/diplomatic/index.ts',
  'src/diplomatic/menu.css',
  'src/diplomatic/highlight.css',
  'src/diplomatic/react/index.html',
  'src/diplomatic/react/index.tsx',

  'src/normalized/index.html',
  'src/normalized/index.ts',
  'src/normalized/normalized.css',

  'src/facsimile/index.html',
  'src/facsimile/index.tsx',
]

const isDev = process.argv.includes('--dev')
const DEV = `${isDev}`

const sharedConfig = {
  entryPoints,
  bundle: true,
  outdir: './static/',
  outbase: 'src',
  loader: {'.html': 'copy', '.tsx': 'tsx'},
  jsx: 'automatic',
  define: {DEV},
  alias: {
    'react': require.resolve('react'),
    'react-dom': path.dirname(require.resolve('react-dom/package.json')),
    'react/jsx-runtime': require.resolve('react/jsx-runtime'),
  },
}

if (isDev) {
  const context = await esbuild.context({
    ...sharedConfig,
    sourcemap: true,
  })
  await context.watch()
  const host = '127.0.0.1';
  const { port } = await context.serve({host, servedir: './static'})
  console.log(`Running at: http://${host}:${port} `)
} else {
  await esbuild.build(sharedConfig)
}