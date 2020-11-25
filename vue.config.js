module.exports = {
  publicPath: './',
  configureWebpack: (config) => {
    config.target = 'electron-renderer';
  },
};
