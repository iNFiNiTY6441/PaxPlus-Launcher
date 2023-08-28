import React from 'react'; 

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";

function ServerList() {

    const [serverData, setServerData] = useState({ meta: { players:0, capacity:0}, servers: {}});

    const [serverLoading, setServerLoading] = useState(true);
    const [serverError, setServerError] = useState(null);

    const [canLaunch, setCanLaunch] = useState(false);

    const navigate = useNavigate();

    async function fetchServers() {

        setServerLoading( true );
        setCanLaunch( !await LauncherCoreAPI.isGameRunning() );
        
        try {
            let servers = await LauncherCoreAPI.GetServers();
            setServerData(servers);
        } catch ( serverFetchError ) {

            setServerError( serverFetchError.message );
        }

        setServerLoading(false);
    }

    function manualRefresh() {

        setServerLoading(true);
        fetchServers();
    }

    useEffect(() => {
            
        fetchServers();
    }, []);
    
    return (         

        <>
        <div className="pagewindow blockerLines" style={{height:"10px"}}/>


            <div style={{ width: "800px", height: "390px"}}>

                <table id="serverlist" style={{width: "775px", marginLeft: "1px", marginTop: "2px"}}>

                    <thead>
                        <tr>
                            <th style={{width: "310px" }}>Name</th>
                            <th style={{width: "180px"}}>Players</th>
                            <th style={{width: "68px"}} >In-Game</th>
                            <th style={{width: "70px"}}>Start</th>
                        </tr>
                    </thead>

                    <tbody id="serverListBody">

                        {
                            serverLoading == true && 

                            <tr>
                                <td>
                                <div className='loadingMessage'>
                                    <h1>Loading</h1>
                                    <img/>
                                </div>
                                </td>
                            </tr>
                        }

                        {
                            serverError != null &&

                            <p>
                                {serverError}
                            </p>

                            // <div className='topbar_statusItem critical' style={{width: "754px", height: "352px", justifyContent: "center", textAlign: "center", animation: "none", opacity: 0.78}}>

                            // <p style={{marginTop:"120px"}}>Launcher version is no longer supported. Please <a href='https://github.com/iNFiNiTY6441/PaxPlus-Launcher'>update.</a></p>

                            // </div>

                        }


                        { serverLoading == false && Object.keys(serverData.servers).map( ( serverIP ) => 
                
                            <tr key={serverIP}>
                                <td> {serverData.servers[serverIP].name} </td>
                                <td>{serverData.servers[serverIP].players} / {serverData.servers[serverIP].maxPlayers}</td>
                                <td style={{fontSize: "16px"}}>
                                    <button style={{ width:"90px"}}>COPY CMD</button>
                                </td>
                    
                                <td style={{width: "100px", fontSize: "15.5px"}}>
                                <button style={{ width:"90px"}} disabled={!canLaunch} onClick={ () => {LauncherCoreAPI.LaunchGame( serverIP )} }> { canLaunch == true ? "JOIN" : "RUNNING"}</button>
                                </td>
                            </tr>
                            )
                        }
                    </tbody>
                    
                </table>

            </div>

            <div className="pagewindow blockerLines" style={{height:"10px"}}/>

            <table id="globalStats">
                <tbody>
                    <tr>
                        <td className="edgeDots">PLAYERS: &nbsp;<span style={{color: "#3EC1A2"}}> { serverData.meta.players } </span></td>
                        <td className="blockerLines"></td>
                        <td className="edgeDots">SERVERS: &nbsp;<span style={{color: "#3EC1A2"}}> { Object.keys( serverData.servers ).length } </span></td>
                        <td className="blockerLines"></td>
                        <td className="edgeDots" >{ serverData.meta.capacity }% CAPACITY</td>
                        <td className="blockerLines"></td>
                        <td className="edgeDots"><button id="refreshButton" onClick={ () => { manualRefresh()} }>REFRESH</button></td>
                    </tr>
                </tbody>
            </table>

            <div className="pagewindow blockerLines" style={{height:"10px"}}/>
        </>
    
    ); 
} 
    
export default ServerList;