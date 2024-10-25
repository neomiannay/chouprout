const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: ['./js/main.js'],
    // mode: 'none', // none development production
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'game.min.[hash:8].js',
    },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.js$/, // Processing JS files with Babel
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-class-properties'], // Using the Babel class properties plugin
                    },
                },
            },
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),

        new CopyWebpackPlugin(
            [
                { from: 'assets/', to: 'assets/' },
                { from: './style.css', to: 'style.css' }, // Add this line to copy the stylesheet
                { from: './intro.css', to: 'intro.css' }, // Add this line to copy the stylesheet
                { from: './background.css', to: 'background.css' }, // Add this line to copy the stylesheet
                { from: './end.css', to: 'end.css' }, // Add this line to copy the stylesheet
            ],
            {
                ignore: [],
                debug: 'debug',
                copyUnmodified: true,
            }
        ),
        new ImageminPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            disable: process.env.NODE_ENV !== 'production',

            // optipng: {
            //   optimizationLevel: 4
            // },

            //seems better on mac this way
            pngquant: {
                verbose: true,
                quality: '80-90',
            },
        }),
        new HtmlPlugin({
            file: path.join(__dirname, 'dist', 'index.html'),
            template: './index.html',
        }),
    ],
};
