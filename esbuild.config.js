const esbuild = require('esbuild');
const nodeExternals = require('esbuild-plugin-node-externals');

esbuild.build({
  entryPoints: ['./src/main.ts'],
  bundle: true,
  platform: 'node',
  outfile: './distDev/main.js',
  sourcemap: true,
  plugins: [nodeExternals()], // 使用插件处理外部依赖
}).catch(() => process.exit(1));
