import React from 'react';
import { Link } from "react-router-dom";

/**
 * Main menu UI sidebar, containing all the launcher options
 */
const Sidemenu = () => {

    return (

        <div className="mainmenu nohighlight">
				
            <div className="menu_sideBar_seperator"></div>

            <div className="option" id="mainmenu_launch">
                <div className="icon"></div>
                <Link to="/menu/play" className="normalButton launchButton edgeDots" style={{ textDecoration: 'none' }} tabIndex="-1">PLAY</Link>
            </div>

            <div className="option" id="mainmenu_GameSettings">
                <div className="icon"></div>
                <Link to="/menu/config" className="normalButton edgeDots" style={{ textDecoration: 'none' }} tabIndex="-1">SETTINGS</Link>
            </div>

            <div className="option" id="mainmenu_Guide">
                <div className="icon"></div>
                <Link to="/menu/guide" className="normalButton edgeDots" style={{ textDecoration: 'none' }} tabIndex="-1">FAQ</Link>
            </div>

            <div className="option" id="mainmenu_Legal">
                <div className="icon"></div>
                <Link to="/menu/about" className="normalButton edgeDots" style={{ textDecoration: 'none' }} tabIndex="-1">Legal</Link>
            </div>

            <div className="option" id="mainmenu_Exit">
                <div className="icon"></div>
                <div className="normalButton edgeDots" onClick={ function(){window.close()}} tabIndex="-1">Exit</div>
            </div>

        </div>
    );
};

export default Sidemenu;