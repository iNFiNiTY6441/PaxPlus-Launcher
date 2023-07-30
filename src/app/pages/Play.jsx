import React from 'react'; 

import { useEffect, useState } from 'react';


function Play() {

    const [serverData, setServerData] = useState({});
    const [serverError, setServerError] = useState(null);

    async function fetchServers() {

        try {
            let servers = await LauncherCoreAPI.GetServers();
            setServerData(servers);
        } catch ( serverFetchError ) {

            setServerError( serverFetchError.message );
        }

    }

    useEffect(() => {
        
        fetchServers();

    }, []);
    
    return (         

        <div className="UIPage" id="page_goptions" style={{ display: "block", width: "800px", border: "none"}} >
        
            <div className="pagewindow" style={{width: "797px"}}>

                <div style={{ display: "flex", width: "900px", marginBottom: "2px" }}>
                    {/* <h2 className="pageCategory edgeDots" style={{ width: "793px", height: "40px", marginLeft: "1px", justifyContent: "center"}}>
                       Multiplayer
                    </h2> */}

                    {/* <h2 className="pageCategory edgeDots" style={{ width: "780px", height: "78px", marginLeft: "1px", justifyContent: "center"}}>
                        JOIN <br/> Servers
                    </h2> */}

                    {/* <h2 className="pageCategory edgeDots" style={{ height: "78px", marginLeft: "1px", justifyContent: "center", paddingLeft: "0px"}}>
                        OFFLINE
                    </h2> */}

                    <h2 className="pageCategory edgeDots" style={{ width: "400px", height: "40px", marginLeft: "1px", marginRight:"1px", justifyContent: "center", letterSpacing: "0.5px"}}>
                       Join servers
                    </h2>

                    <h2 className="pageCategory edgeDots" style={{ width: "400px", height: "40px", marginLeft: "1px", marginRight:"1px", justifyContent: "center", letterSpacing: "0.5px", opacity: 0.55}}>
                       Singleplayer
                    </h2>
                    
                </div>  

                {/* <table id="globalStats" style={{marginBottom: "50px", height: "36px"}}>
                    <tbody>
                        <tr>
                        <td className="edgeDots"><button id="refreshButton" style={{width: "179px"}}>DISCORD</button></td>
                            <td className="blockerLines"></td>
                            <td className="edgeDots"><button id="refreshButton" style={{width: "179px"}}>EVENTS</button></td>
                            <td className="blockerLines"></td>
                            <td className="edgeDots"><button id="refreshButton" style={{width: "179px"}}>REFRESH</button></td>
                            <td className="blockerLines"></td>
                            <td className="edgeDots"><button id="refreshButton" style={{width: "179px"}}>HOSTING GUIDE</button></td>
                        </tr>
                    </tbody>
                </table> */}
                
                

    

                <div style={{ width: "800px", height: "408px"}}>

                    <table id="serverlist" style={{width: "795px", marginLeft: "1px", marginTop: "2px"}}>

                        <thead>
                            <tr>
                                <th style={{width: "310px" }}>Name</th>
                                <th style={{width: "200px"}}>Players</th>
                                <th style={{width: "86px"}} >In-Game</th>
                                <th style={{width: "122px"}}>Start</th>
                            </tr>
                        </thead>


                        {
                            serverError != null &&

                            <p>
                                {serverError}
                            </p>
                        }


                        { Object.keys(serverData).map( ( serverIP ) => 
                
                            <tr>
                                <td> {serverData[serverIP].name} </td>
                                <td>{serverData[serverIP].players} / {serverData[serverIP].maxPlayers}</td>
                                <td style={{fontSize: "16px"}}>
                                    <button style={{ width:"90px"}}>COPY IP</button>
                                </td>
                    
                                <td style={{width: "100px", fontSize: "15.5px"}}>
                                <button style={{ width:"90px"}}>LAUNCH</button>
                                </td>
                            </tr>
                            )
                        }



                        <tbody>

                        </tbody>
                        
                    </table>

                </div>

                <div className="pagewindow blockerLines" style={{height:"10px"}}></div>

                <table id="globalStats">
                    <tbody>
                        <tr>
                            <td className="edgeDots">PLAYERS: &nbsp;<span style={{color: "#3EC1A2"}}> 0 </span></td>
                            <td className="blockerLines"></td>
                            <td className="edgeDots">SERVERS: &nbsp;<span style={{color: "#3EC1A2"}}> 0 </span></td>
                            <td className="blockerLines"></td>
                            <td className="edgeDots" >0% CAPACITY</td>
                            <td className="blockerLines"></td>
                            <td className="edgeDots"><button id="refreshButton" onClick={ () => {LauncherCoreAPI.LaunchGame()} }>REFRESH</button></td>
                        </tr>
                    </tbody>
                </table>

                <div className="pagewindow blockerLines" style={{height:"10px"}}></div>

                {/* <div className="pagewindow">
                <h2 className="dailogWindow blockerLines separator">&nbsp;</h2>
                </div> */}


            </div>
    
        </div>
    ); 
} 
    
export default Play;