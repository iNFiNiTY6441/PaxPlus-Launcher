const path = require('path');
const fs = require('fs');

module.exports = {
  packagerConfig: {

     icon: './src/resources/img/paxlauncher.ico'

      // extraResource: [
      //   "./dist/decompress.exe",
      //   "./dist/decompress.exe_LICENSE.txt",
      //   "./dist/PatchUPK.exe",
      //   "./dist/PatchUPK.exe_LICENSE.txt",
      //   "./dist/UPKUtils-SRC.zip"
      //  ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
        //icon: './src/resources/img/paxlauncher.ico',
        // The ICO file to use as the icon for the generated Setup.exe
        setupIcon: './src/resources/img/paxlauncher.ico',
      },
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

  hooks: {
    packageAfterCopy: async (config, buildPath, electronVersion, platform, arch) => {
      var src = path.join(__dirname, './dist');
      var dst = buildPath;
      fs.cpSync(src, dst, {recursive: true});
    }
  },

  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        devServer: { "liveReload": false },
        devContentSecurityPolicy: `default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;`,
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              
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
