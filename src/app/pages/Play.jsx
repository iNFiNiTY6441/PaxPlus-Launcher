import React, { useContext } from 'react'; 

import ServerList from '../components/ServerList/ServerList.jsx';

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";

import { LauncherContext } from "../LauncherContext.js";



function Play() {

    const navigate = useNavigate();

    // Launcher global state context
    const { network_mode, game_running } = useContext( LauncherContext );

    // Play menu tab counter
    const [ tab, setTab ] = useState(0);

    // Refs for both tab buttons
    const pagetab_singleplayer = useRef(null);
    const pagetab_servers = useRef(null);

    
    function setTab_singleplayer(){
        pagetab_singleplayer.current.classList.remove("inactive");
        pagetab_servers.current.classList.add("inactive");
        setTab(1);
    }

    function setTab_servers(){
        pagetab_servers.current.classList.remove("inactive");
        pagetab_singleplayer.current.classList.add("inactive");
        setTab(0); 
    }

    async function launchgame(serverIP = "" ) {

        let exitCode = await LauncherCoreAPI.LaunchGame( serverIP, ()=>{} );
    }

    useEffect(() => {

        if ( network_mode === 0 ) {
            setTab_servers();
        } else {
            pagetab_servers.current.classList.add("disabled"); 
            setTab_singleplayer();
        }

    }, [] );
    
    return (         

        <div className="UIPage" id="page_play" tabIndex="-1">

            <div className="pagewindow">

                <div id="play_categories">

                    <h2 className="pageCategory edgeDots" ref={pagetab_singleplayer} onClick={()=>setTab_singleplayer()}>
                        Standalone
                    </h2>

                    <h2 className="pageCategory edgeDots inactive" ref={pagetab_servers} onClick={()=>setTab_servers()}>
                        Server list
                    </h2>
                    
                </div>  

                { network_mode === 0 && tab == 0 && 
                
                    <ServerList launchGame={launchgame}></ServerList>
                }

                { tab == 1 && 

                    <>
                        <div className="pagewindow blockerLines"/>

                        <div id="section_singleplayer">
                            <br/>
                            
                            <h3>/// Launching standalone</h3>
                            <p> Launches the game without directly joining a server.<br/><br/> </p>

                            <h3>/// Opening the in-game console</h3>
                            <p> You can open the in-game console using the <span className='keyboardHint'>&nbsp;`&nbsp;</span> key.<br/><br/> </p>

                            <h3>/// Joining a server in-game</h3>
                            <p> You are still able to connect to servers by using the following console command: </p>
                            <p> &gt; <span className='commandHint'>&nbsp;Open &nbsp; SERVER_IP_HERE&nbsp;</span> &nbsp;&nbsp;<span className='textColor_yellow'>You can copy this command from the serverbrowser</span> </p>
                        
                        </div>

                        <div className="pagewindow blockerLines"/>

                        <table id="globalStats">
                            <tbody>
                                <tr>                        
                                    <td className="edgeDots">
                                        <button tabIndex="-1" id="singleplayer_launchButton" disabled={game_running} onClick={ () => launchgame("") }>{ game_running == false ? "LAUNCH GAME" : "GAME RUNNING"}</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="pagewindow blockerLines"/>
                    </>
                }

            </div>

        </div>
    ); 
} 
    
export default Play;