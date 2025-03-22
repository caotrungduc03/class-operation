const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      '@co/common': join(__dirname, 'src/common'),
      '@co/constants': join(__dirname, 'src/constants'),
      '@co/entities': join(__dirname, 'src/entities'),
      '@co/dtos': join(__dirname, 'src/dtos'),
      '@co/decorators': join(__dirname, 'src/decorators'),
      '@co/types': join(__dirname, 'src/types'),
      '@co/utils': join(__dirname, 'src/utils'),
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
