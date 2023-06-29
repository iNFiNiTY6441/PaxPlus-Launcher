module.exports = {
  packagerConfig: {

    // icon: './src/paxplus.ico'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/window_main/index.html',
              js: './src/window_main/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },

            {
              html: './src/setup_window/index.html',
              js: './src/setup_window/renderer.js',
              name: 'setup_window',
              preload: {
                js: './src/preload.js',
              },
            }

          ],
        },
      },
    },
  ],
};
