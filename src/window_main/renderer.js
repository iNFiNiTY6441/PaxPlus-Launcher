/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800, 
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */


import '../index.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');






console.log("HEY")
function openMenuPage( evt, page ){
  
    var i, tabcontent, tablinks;
    let pages = document.getElementsByClassName("UIPage");
    for (i = 0; i < pages.length; i++) {
      pages[i].style.display = "none";
    }
  
    document.getElementById('page_'+page).style.display = "block";
}


document.getElementById("mainmenu_launch").onclick = function(){ openMenuPage(this,'servers') };
document.getElementById("mainmenu_GameSettings").onclick= function(){ openMenuPage(this,'goptions')};
// document.getElementById("mainmenu_LauncherSettings").onclick= function(){ openMenuPage(this,'loptions')};
document.getElementById("mainmenu_Legal").onclick= function(){ openMenuPage(this,'legal')};


document.getElementById("mainmenu_Exit").onclick= function(){ window.close() };


/* FPS CAP */
document.getElementById("gfx_fpsCap").addEventListener('input',function(e){

  document.getElementById("gfx_fpsCap_label").innerHTML = e.target.value
})

/* FPS CAP */
document.getElementById("gfx_fov").addEventListener('input',function(e){

  document.getElementById("gfx_fov_label").innerHTML = e.target.value
})

/* COCKPIT LAG */
document.getElementById("gfx_cockpitLag").addEventListener('input',function(e){

  document.getElementById("gfx_cockpitLag_label").innerHTML = e.target.value
})

/* MOUSE SENSITIVITY */
document.getElementById("gfx_mouseSensitivity").addEventListener('input',function(e){

  document.getElementById("gfx_mouseSensitivity_label").innerHTML = e.target.value
})



/* COCKPIT LAG */
document.getElementById("btn_exeFile").addEventListener('click',function(e){

    document.getElementById("input_exeFile").click();
})


/**
 * HANDLE MESSAGES FROM PRELOAD / MAIN
 */
window.addEventListener("message", (event) => {
    // event.source === window means the message is coming from the preload
    // script, as opposed to from an <iframe> or other source.
    if (event.source === window) {
        
        let message = event.data;




    }
  });


PAXPLUS.openDialog();



function userConfiguration_Save() {

  let configuration = {

    GAME: {

        resolution: [ 1920, 1080 ],
        maxFPS: 62,
        vsync: false,

        fx_static: true,
        fx_motionBlur: true,
        fx_dof: true,

        fx_cockpitLag: 0.6,

        input_mouseSensitivity: 0.2
    },

    LAUNCHER: {

        dir_Game: "test",
        dir_Config: "test"

    }

  }



}