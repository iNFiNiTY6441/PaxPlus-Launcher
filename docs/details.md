# Technical Details


## What the launcher patches
### UPKs
The launcher verifies a UPKs patched or vanilla state using file hashes.
- **UPKs already matching the hashes specified in the game patch will be skipped.**  
- The launcher will only patch vanilla, unmodified UPKs, so it will restore those from backup before beginning any patching.

### INI files
- The launcher will patch select ini values match those specified in the game patch.  
- It will reapply custom ini settings applied by the user through the launchers settings menu afterwards for safety.

### Mechsetup file
- Any mechs not present in game patch will be removed to ensure a level playing field.  
- Mechs already present will only have select values patched to keep user customizations while ensuring compatibility
- Mechs that aren't yet present in the mechsetup will be added & have all their values set to a provided default

## In what order the patches are applied

### 1 - UPKs
- **1.1:** Restore from vanilla backup
- **1.2:** Decompress UPK file using `decompressor.exe`
- **1.3:** Apply binary patches / hex edits
- **1.4:** Apply UPKUtils patches using `PatchUPK.exe`

### 2 - INIs
- **2.1:** Apply ini patches from patch config
- **2.2:** Re-apply user ini settings

### 3 - Mechsetup
- **3.1:** Remove non patch-compliant mech presets
- **3.2:** Add new mech presets
- **3.2:** Reset `persist` values of existing mech presets


## Remote data
The launcher refreshes certain data automatically from its server, without requiring a launcher update or user action. All types of remote data are listed below:


## launcherConfig
The launcher configuration data will not be cached locally and is retrieved on startup & once every refresh interval.  
**Failure to retrieve this data will switch the launcher into `offline mode`**  
  
__The launcher config contains:__
- **Launcher version information**  
Contains the latest launcher version number as well as a list of still supported launcher versions.  
Used by the launcher to determine its support status.

  - The launcher will display a `new version available` message if the launcher version does not match the `latest` version
  - The launcher will set itself into `offline/end of life` mode if the launcher version is not latest and is not present in the  list of still supported launcher versions.  <br></br>
  

- **The masterserver url for the serverlist**  
Allows for on the fly migration of the masterserver, as launchers can switch over to a different masterserver endpoint seamlessly

- **Launcher remote data update interval.**  
Interval at which the launchers refresh their remode data. Can be adjusted remotely to manage request load on the launcher server.

## gameSettings
Contains the layout information as well as the default values for the launchers settings page.  
**Cached locally to facilitate offline operations.**  

Can be updated remotely to add new settings or tweak existing ones.  
**Adding a new *type* of option requires a launcher version update**

## gamePatch
Contains all relevant patch operations & their associated data for the launche to patch the game to the desired patch state.  
**Cached locally to ensure offline availability.**  

**Contains patch data for the following operations:**  
- Original & patched state filehashes for all files that require patching
- Binary patch data in byte format
- UPKUtils patch scripts
- INI values to patch relevant game ini files
- Mechsetup data to ensure mechsetup consistency accross all modded game instances.



