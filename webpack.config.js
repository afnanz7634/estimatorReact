const path = require('path');
const outputPath = path.join(__dirname, 'dist');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// used to match the exact case of the actual path on disk.
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { SourceMapDevToolPlugin } = require('webpack');

// used for serving static files
const CopyWebpackPlugin = require('copy-webpack-plugin');

// ant primary color change
const fs = require('fs');
const lessToJs = require('less-vars-to-js');

var themeFile = fs.readFileSync(path.join(__dirname, '/public/ant-theme-vars.module.scss'), 'utf8');
// scss to less vars
themeFile = themeFile.replace(/\$/g, '@');
console.log(themeFile);

const themeVariables = lessToJs(themeFile);

const CSSModuleLoader = {
    loader: 'css-loader',
    options: {
        modules: true,
        sourceMap: true,
    },
};

console.log(themeVariables);

module.exports = {
    output: {
        path: outputPath,
        filename: 'index.bundle.js',
        publicPath: '/',
    },
    mode: process.env.NODE_ENV || 'development',
    devtool: 'source-map',
    resolve: {
        plugins: [new TsconfigPathsPlugin()],
        extensions: ['.tsx', '.ts', '.js'],
    },
    devServer: {
        static: path.join(__dirname, 'dist'),
        compress: true,
        port: 4200,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ['ts-loader'],
            },
            {
                test: /\.(css|scss)$/,
                exclude: /\.module\.scss$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-modules-typescript-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.module\.(css|scss)$/,
                use: [
                    {
                        loader: 'style-loader',
                    },

                    CSSModuleLoader,

                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.less$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                                modifyVars: themeVariables,
                            },
                        },
                    },
                ],
            },
            { test: /\.json$/, loader: 'json' },
            {
                test: /\.(jpg|jpeg|png|gif)$/,
                use: ['file-loader'],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ],
    },
    ignoreWarnings: [/Failed to parse source map/],
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'index.html'),
        }),
        new SourceMapDevToolPlugin({
            filename: '[file].map',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'public/**/*',
                    globOptions: {
                        dot: true,
                        gitignore: true,
                        ignore: ['**/file.*', '**/ignored-directory/**'],
                    },
                },
            ],
        }),
        new CaseSensitivePathsPlugin(),
    ],
};
