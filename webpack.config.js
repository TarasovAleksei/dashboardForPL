const path = require('path');
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const filePath = {
    src: {
        script: './src/js/index.js',
        style: './src/scss/style.scss',
        icons: './src/icons/icons.js',
    },
    dist:  './dist/',
};

const  createJSModule = () => ({
    test: /\.js$/,
    exclude: [/node_modules\/(?!(swiper|dom7|litepicker)\/).*/],
    use: {
        loader: 'babel-loader',
        options: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: false,
                        useBuiltIns: 'entry',
                        corejs: 3,
                    },
                ],
            ],
            babelrc: false,
        },
    },
});

const createSCSSModule = isDev => ({
    test: /\.scss$/,
    use: [
        {
            loader: MiniCssExtractPlugin.loader
        },
        {
            loader: 'css-loader',
            options: {
                sourceMap: isDev,
                url: false
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                plugins: [
                    autoprefixer()
                ],
                sourceMap: isDev,
            },
        },
        {
            loader: 'sass-loader',
            options: {
                sourceMap: isDev,
            },
        },
    ],
});

const createSVGIconsModule = () => ({
    resource: {
        test: /\.svg$/,
    },
    issuer: {
        include: /icons\.js$/,
    },
    use: [
        {
            loader: 'svg-sprite-loader',
            options: {
                extract: true,
                spriteFilename: './images/icons/sprite.svg',
                symbolId: filePath => 'icon-' + path.basename(filePath).split('.')[0],
            },
        },
        {
            loader: 'svgo-loader',
        },
    ],
});

module.exports = env => {
    const isDev = env.mode === 'development';
    const isProd = !isDev;

    return {
        node: {
            fs: 'empty'
        },
        mode: isProd ? 'production' : isDev && 'development',
        entry: [
            filePath.src.script,
            filePath.src.style,
            filePath.src.icons,
        ],
        output: {
            filename: './js/index.js',
            path: path.resolve(__dirname, filePath.dist),
        },
        devtool: isDev ? 'eval-source-map' : 'none',
        module: {
            rules: [
                createJSModule(),
                createSCSSModule(isDev),
                createSVGIconsModule(),
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: './css/style.css',
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessor: require('cssnano'),
                cssProcessorOptions: {
                    map: {
                        inline: isDev,
                    },
                },
                cssProcessorPluginOptions: {
                    preset: [
                        'default',
                        {
                            discardComments: {
                                removeAll: true,
                            },
                        },
                    ],
                },
                canPrint: true,
            }),
            new SpriteLoaderPlugin({
                plainSprite: true,
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {from:'src/images', to: 'images'},
                    {from: 'src/fonts', to: 'fonts'},
                ],
            }),
        ],
    };
};
