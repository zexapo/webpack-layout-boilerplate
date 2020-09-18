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
/*
В массив pagesName добавляем названия страниц без типа файла
Для корректной работы необходимо создать соответствующие файлы pug, scss, js в папке pages
Для каждой страницы в pages своя папка
*/
const pagesName = ['index', 'ui-kit'];
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

// Генерация точек входа
const entry = (pages) => {
  const objEntry = {};
  pages.forEach((item) => {
    //  находится в корне src
    const pathEntry = item === 'index' ? `${PATHS.src}` : `${PATHS.src}/pages/${item}`;
    objEntry[item] = [`${pathEntry}/${item}.js`, `${pathEntry}/${item}.scss`];
  });
  return objEntry;
};

// Генерация HTML страниц

const createPages = (pages) => {
  const pagesHTML = [];
  pages.forEach((item, i) => {
    pagesHTML[i] = new HtmlWebpackPlugin({
      filename: item === 'index' ? `${item}.html` : `pages/${item}.html`,
      chunks: [item],
      template:
        item === 'index'
          ? `./src/${item}.pug`
          : `./src/pages/${item}/${item}.pug`,
      minify: {
        collapseWhitespace: isProd,
      },
    });
  });
  return pagesHTML;
};

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
  entry: entry(pagesName),
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
  resolve: {
    alias: {
      '~': PATHS.src, // Example: import Dog from "~/assets/img/dog.jpg"
    },
  },
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
              publicPath: '../../', // обеспечивает правильный относительный путь в css
            },
          },
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/image/[name].[ext]',
        },
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/fonts/[name].[ext]',
        },
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
              publicPath: '../../', // обеспечивает правильный относительный путь в css
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
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets/static'),
          to: path.resolve(__dirname, 'build/assets'),
        },
      ],
    }),
    ...createPages(pagesName),
  ],

  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
};
