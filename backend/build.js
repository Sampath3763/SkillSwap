import { build } from 'esbuild';

build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: './dist/index.js',
  format: 'esm',
  external: [
    'express',
    'mongodb',
    'passport',
    'passport-local',
    'express-session',
    'connect-mongo',
    'dotenv',
    'zod'
  ],
  minify: true,
  sourcemap: true,
}).catch(() => process.exit(1));
