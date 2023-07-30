
##   Disclaimer

###  This project is still in development and is not yet meant for general use. 
#### Expect unintended side effects.

##   Setup
```
git clone https://github.com/iNFiNiTY6441/PaxPlus-Launcher.git
cd PaxPlus-Launcher
npm install
```
##   Usage
####  🚀 Run
```
npm start
```
####  📦 Build
```
npm run make
```
##  Launcher paths
####  UserConfig & local copies of remote data
✅ Will be auto-created by launcher if missing  
>`/Documents/PAX_LAUNCHER_TEST/`

####  Expected game .ini location
❌ Will not be auto-created, make sure folder exists and contains the base game ini files  
>`/Documents/My Games/Hawken-PaxLauncherTest/`

##  IMPORTANT

####  `decompress.exe` needs to be manually placed into the launcher base directory for patching to work

**Place exe next to**  
>`forge.config.js`  *When running the project*  
  **or**  
`paxplus.exe` *For built releases*

###  Patching is currently mapped to the serverbrowser's `Refresh` button.