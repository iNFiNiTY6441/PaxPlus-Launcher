import React from 'react'; 

import { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";

import { LauncherContext } from "../../LauncherContext.js";



function ServerList({canLaunch, launchGame }) {


    const defaultServerData = { meta: { players:0, capacity:0}, servers: {}}

    // Launcher global state context
    const { network_mode, game_running } = useContext( LauncherContext );

    const [serverData, setServerData] = useState(defaultServerData);

    const [serverLoading, setServerLoading] = useState(false);
    const [serverError, setServerError] = useState(null);

    const navigate = useNavigate();

    async function fetchServers() {

       // setServerLoading( true );
        
        
        try {
            let servers = await LauncherCoreAPI.GetServers();
            setServerData(servers);
        } catch ( serverFetchError ) {

            setServerError( serverFetchError.message );
        }

        //setServerLoading(false);

        // setTimeout(() => {
        //     setCanLaunch(false)
        // }, (4000));
    }

    async function copyIP( btn, ip ) {

        let originalContent = btn.innerHTML;

        btn.innerHTML = "COPIED.";
        btn.classList.add("triggered");

        await navigator.clipboard.writeText(ip);

        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.remove("triggered");
        }, 1000);
    }

    async function initialize(){

        fetchServers();
    }

    function manualRefresh() {

        //setServerLoading(true);
        setServerData(defaultServerData)
        fetchServers();
    }

    useEffect(() => {
            
        //fetchServers();
        // console.log(game_running)
        initialize();
    }, []);
    
    return (         

        <>
            <div className="pagewindow blockerLines"/>

            <div id="serverlist_wrapper">

                <table id="serverlist">

                    <thead id="serverlist_head">
                        <tr>
                            <th>Name</th>
                            <th>Players</th>
                            <th>In-Game</th>
                            <th>Start</th>
                        </tr>
                    </thead>

                    <tbody id="serverlist_body">

                        { serverLoading == false && Object.keys(serverData.servers).map( ( serverIP ) => 
                
                            <tr key={serverIP}>
                                
                                <td> {serverData.servers[serverIP].name} </td>

                                <td> {serverData.servers[serverIP].players} / {serverData.servers[serverIP].maxPlayers} </td>

                                <td> <button tabIndex="-1" onClick={(event) => {copyIP(event.target,"Open "+serverIP)}}>COPY CMD</button> </td>
                    
                                <td> <button tabIndex="-1" disabled={ game_running == true } onClick={ () => { launchGame(serverIP)} }> { game_running == false ? "JOIN" : "RUNNING"}</button> </td>
                            </tr>
                        )}
                        
                    </tbody>
                    
                </table>

            </div>

            <div className="pagewindow blockerLines"/>

            <table id="globalStats">
                <tbody>
                    <tr>
                        <td className="edgeDots">PLAYERS: &nbsp;<strong> { serverData.meta.players } </strong></td>
                        <td className="blockerLines"></td>
                        <td className="edgeDots">SERVERS: &nbsp;<strong> {Object.keys( serverData.servers ).length} </strong></td>
                        <td className="blockerLines"></td>
                        <td className="edgeDots" >{ serverData.meta.capacity }% CAPACITY</td>
                        <td className="blockerLines"></td>
                        <td className="edgeDots"> <button tabIndex="-1" id="multiplayer_refreshButton" onClick={ () => { manualRefresh()} }>REFRESH </button> </td>
                    </tr>
                </tbody>
            </table>

            <div className="pagewindow blockerLines"/>
        </>
    
    ); 
} 
    
export default ServerList;