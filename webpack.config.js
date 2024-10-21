const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin'); // 引入 TerserPlugin

module.exports = {
  mode: 'development', // 或 'production'
  target: 'node', // 目标为 Node.js
  entry: './src/main.ts', // 入口文件
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // 每次构建前清理输出目录
  },
  resolve: {
    extensions: ['.ts', '.js'], // 支持的文件扩展名
    alias: {
      '@': path.resolve(__dirname, 'src'), // 设置路径别名
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader', // 使用 ts-loader 编译 TypeScript
        exclude: /node_modules/,
      },
    ],
  },
  externals: [nodeExternals()], // 排除 Node.js 内置模块
  plugins: [
    new NodePolyfillPlugin(), // 使用 Node.js Polyfills
  ],
  devtool: 'source-map', // 生成源映射文件，方便调试

  // 添加 optimization 部分
  optimization: {
    minimize: true, // 启用压缩
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 删除 console.log 语句
          },
        },
      }),
    ],
  },
};
