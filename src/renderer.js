import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';

import App from "./app/app.jsx";

const container = document.getElementById('app');

// Create a root.
const root = ReactDOMClient.createRoot(container);

function render() {
	
  	// Initial render: Render an element to the root.
	root.render(<App tab="home" />);
}

render();



console.log('👋 This message is being logged by "renderer.js", included via webpack');

/**
 * HANDLE MESSAGES FROM PRELOAD / MAIN
 */
window.addEventListener("message", (event) => {
  // event.source === window means the message is coming from the preload
  // script, as opposed to from an <iframe> or other source.
  console.log(event.data)
  console.log(event.source)
});

// Add this to the end of the existing file
//import './app.jsx';
import './index.css';
import './app/app.jsx'