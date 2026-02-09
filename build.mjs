import * as esbuild from 'esbuild'

const entryPoints = [
  'src/index.html',
  'src/viewer.html',
  'src/viewer.js',

  'src/diplomatic/index.html',
  'src/diplomatic/index.ts',
  'src/diplomatic/diplomatic.css',
  'src/diplomatic/menu.css',
  'src/diplomatic/react/index.html',
  'src/diplomatic/react/index.tsx',

  'src/highlight/index.html',
  'src/highlight/index.ts',
  'src/highlight/highlight.css',

  'src/normalized/index.html',
  'src/normalized/index.ts',
  'src/normalized/normalized.css',
]

const sharedConfig = {
  entryPoints,
  bundle: true,
  outdir: './static/',
  outbase: 'src',
  loader: {'.html': 'copy', '.tsx': 'tsx'},
  jsx: 'automatic',
}

const isDev = process.argv.includes('--dev')

if (isDev) {
  const ctx = await esbuild.context({
    ...sharedConfig,
    define: {DEV: 'true'},
    sourcemap: true
  })
  await ctx.watch()
  await ctx.serve({servedir: './static'})
} else {
  await esbuild.build({
    ...sharedConfig,
    define: {DEV: 'false'}
  })
}