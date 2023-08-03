import React from 'react';
import { BrowserRouter, Route, Link } from "react-router-dom";

/**
 * Main menu UI sidebar, containing all the launcher options
 */
const Sidemenu = () => {


    return (

        <div className="mainmenu nohighlight">
				
            <div className="menu_sideBar_seperator"></div>

            <div className="option" id="mainmenu_launch">
                <div className="icon"></div>
                <Link to="/menu/play" className="normalButton launchButton edgeDots" style={{ textDecoration: 'none' }}>PLAY</Link>
            </div>

            <div className="option" id="mainmenu_GameSettings">

                <div className="icon"></div>
                <Link to="/menu/config" className="normalButton edgeDots" style={{ textDecoration: 'none' }}>SETTINGS</Link>
            </div>

            <div className="option" id="mainmenu_GameSettings">

            <div className="icon"></div>
            <Link to="/welcome" className="normalButton edgeDots" style={{ textDecoration: 'none' }}><span style={{color:"#dcdf5e", marginRight:"5px",fontSize:"10px"}}>[DEV]</span> DIALOG TEST</Link>
            </div>

            <div className="option" id="mainmenu_Legal">
                
                <div className="icon"></div>
                <Link to="/menu/about" className="normalButton edgeDots" style={{ textDecoration: 'none' }}>Legal</Link>
            </div>

            <div className="option" id="mainmenu_Exit">
                
                <div className="icon"></div>
                <div className="normalButton edgeDots" onClick={ function(){window.close()}}>Exit</div>
            </div>

        </div>
    );
};

export default Sidemenu;