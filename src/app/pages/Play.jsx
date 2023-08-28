import React from 'react'; 

import ServerList from '../components/ServerList/ServerList.jsx';

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";

function Play() {

    const [ tab, setTab ] = useState(0);

    const pagetab_singleplayer = useRef(null);
    const pagetab_servers = useRef(null);

    const [isOffline, setIsOffline] = useState(true);

    const navigate = useNavigate();

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

    async function launchgame(){


    }

    async function initialize() {

        let offline = await LauncherCoreAPI.isEOL()

        setIsOffline(offline)
        
        if ( offline == true ) {

            pagetab_servers.current.classList.add("disabled"); 
            setTab_singleplayer();
            
        } else {
            setTab_servers();
        }
    }

    useEffect(() => {
        
        
        initialize();
    }, []);
    
    return (         

        <div className="UIPage" id="page_goptions" tabIndex="-1" style={{ display: "block", width: "780px", border: "none"}} >
        

        <div className="pagewindow" style={{width: "778px"}}>

            <div style={{ display: "flex", width: "778px", marginBottom: "2px" }}>

                <h2 className="pageCategory edgeDots" ref={pagetab_singleplayer} onClick={()=>setTab_singleplayer()}>
                    Standalone
                </h2>

                <h2 className="pageCategory edgeDots inactive" ref={pagetab_servers} onClick={()=>setTab_servers()}>
                    Server list
                </h2>
                
            </div>  

            { isOffline == false && tab == 0 && 
            
                <ServerList offline={isOffline}></ServerList>
            
             }

            { tab == 1 && 

                <>
                <div className="pagewindow blockerLines" style={{height:"10px"}}/>
                <div style={{border: "solid 1px #555C5E", padding:"2px", margin:"1px", width: "778px", height: "384px", fontSize:"18px"}}>
                <br/>
                    <h3>/// Launching standalone</h3>

                    <p style={{ color: "#bacecf", fontSize: "16.5px", lineHeight:"25px", marginTop: "14px", marginLeft:"20px"}}>
                    Launches the game without directly joining a server.<br/><br/>
                    </p>

                    <h3>/// Opening the in-game console</h3>
                    
                    <p style={{ color: "#bacecf", fontSize: "16.5px", lineHeight:"25px", marginTop: "14px", marginLeft:"20px"}}>
                    You can open the in-game console using the
                    <span style={{color: "#9df2f5",backgroundColor:"#121719", borderRadius:"8px", fontSize:"20px", padding:"5px", margin:"10px", border: "solid 1px #9df2f5", opacity: 0.75}}>&nbsp;`&nbsp;</span>
                    key.<br/><br/>
                    </p>

                    <h3>/// Joining a server in-game</h3>

                    <p style={{ color: "#bacecf", fontSize: "16.5px", lineHeight:"25px", marginTop: "14px", marginLeft:"20px"}}>
                    You are still able to connect to servers by using the following console command:
                    </p>

                    <p><span style={{color: "#9df2f5", backgroundColor:"#121719", padding:"5px", marginLeft:"20px", border: "solid 1px #555C5E", opacity: 0.75}}>&nbsp;Open &nbsp; SERVER_IP_HERE&nbsp;</span>
                    &nbsp;&nbsp;( The correct command can be obtained from the server browser )
                    
                    </p>
                  
                </div>

                <div className="pagewindow blockerLines" style={{height:"10px"}}/>

                <table id="globalStats">
                    <tbody>
                        <tr style={{height:"34px"}}>                        
                            <td className="edgeDots"><button  style={{width:"99%"}} onClick={ () => { LauncherCoreAPI.LaunchGame() } }>LAUNCH GAME</button></td>
                        </tr>
                    </tbody>
                </table>

                <div className="pagewindow blockerLines" style={{height:"10px"}}/>

                </>
            }

        </div>

        </div>
    ); 
} 
    
export default Play;