const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');

const codespaceHost = process.env.CODESPACE_NAME
  ? `${process.env.CODESPACE_NAME}-8080.app.github.dev`
  : 'localhost';

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all',
    hot: false,               // 临时禁用 HMR，排查重复刷新问题
    liveReload: false,        // 临时禁用 live reload
    client: {
      reconnect: 3,           // 限制重连次数
      webSocketURL: {
        protocol: 'wss',
        hostname: codespaceHost,
        port: 443,
        pathname: '/ws'
      },
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      })
    ]
  }
})
