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

function openMenuPage( evt, page ){
  
  var i, tabcontent, tablinks;
  let pages = document.getElementsByClassName("dialogWindow");
  for (i = 0; i < pages.length; i++) {
    pages[i].style.display = "none";
  }

  document.getElementById('page_'+page).style.display = "block";
}

document.getElementById("btn_proceed_1").onclick = function(){

  openMenuPage(null,"2")
};

document.getElementById("btn_proceed_2").onclick = function(){

  openMenuPage(null,"3")
};


document.getElementById("btn_proceed_3").onclick = function(){

  let setupData = {}

  
  



  PAXPLUS.finishFirstTimeSetup( setupData );
};