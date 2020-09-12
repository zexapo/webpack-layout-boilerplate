const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'build'),
  assets: 'assets/',
};

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    },
  };

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin(),
    ];
  }

  return config;
};

module.exports = {
  entry: {
    index: [`${PATHS.src}/index.js`, `${PATHS.src}/index.scss`],
    blog: [`${PATHS.src}/pages/page2.js`, `${PATHS.src}/pages/page2.scss`],
  },
  output: {
    path: PATHS.build,
    filename: 'js/[name].[hash].js',
  },
  devServer: {
    port: 4200,
    hot: isDev,
  },
  devtool: isDev ? 'source-map' : '',
  optimization: optimization(),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true,
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader'],
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true,
        },
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true,
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: `${PATHS.assets}css/[name].[hash].css`,
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['index'],
      template: './src/index.pug',
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'pages/page2.html',
      chunks: ['blog'],
      template: './src/pages/page2.pug',
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: path.resolve(__dirname, 'build/assets'),
        },
      ],
    }),
  ],

  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
};
