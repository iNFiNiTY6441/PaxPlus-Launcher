import React, { useContext } from 'react'; 
import { useEffect, useState, useRef } from 'react';

function Guide() {

    // Play menu tab counter
    const [ tab, setTab ] = useState(0);

    function changeTab( event, targetTab ){

        if ( targetTab != tab ) {
            event.target.classList.add("inactive");
            setTab( targetTab );
        }
    }
    
    return (         

        <div className="UIPage" id="page_guide" tabIndex="-1">

        
        <div className="pagewindow">


            <div className="nohighlight" id="about_categories">

                <h2 className={ tab == 0 ? "pageCategory edgeDots" : "pageCategory edgeDots inactive"} onClick={(event)=>changeTab(event, 0)}>
                    PAX / PAX+
                </h2>

                <h2 className={ tab == 1 ? "pageCategory edgeDots" : "pageCategory edgeDots inactive"} onClick={(event)=>changeTab(event, 1)}>
                    MULTIPLAYER
                </h2>

                <h2 className={ tab == 2 ? "pageCategory edgeDots" : "pageCategory edgeDots inactive"} onClick={(event)=>changeTab(event, 2)}>
                    COMMANDS
                </h2>

            </div>  

                <div className="pagewindow blockerLines"/>

                <div id="section_about1">
                    
                    { tab == 0 && 

                        <>
                        
                            <br/>
                            
                            <h3>About the PAX Client (Game)</h3>
                            <p> 
                                <strong className='textColor_yellow'>PAX</strong> or <strong className='textColor_yellow'>PAX Client</strong> is a <strong>2012 pre-alpha</strong> client of Hawken, originally shown at <strong>PAX East 2012.</strong>
                                <br/> <br/>
                                After finding its way into hands of the community years ago,
                                <br/>it has recently seen a resurgence and increased interest from players and modders alike.
                                <br/>
                            </p>

                            <h3>What is PAX+ / PAXPlus (Launcher) </h3>
                            <p>
                                <strong className='textColor_yellow'>PAX+</strong> or <strong className='textColor_yellow'>'PAX Plus'</strong> Is a <strong>community modding project</strong>, aiming to enhance the original alpha
                                <br/>by <strong>modifying the player movement & weapon stats</strong> to more resemble <strong>Hawken as it was in 2017.</strong>
                            
                            </p>

                            <h3>Why PAX?</h3>
                            <p> 
                                The <strong>PAX-Client</strong> is the only client of Hawken that currently has a <strong>fully working,
                                <br/>self-hostable server built in.</strong>
                                <br/><br/>
                                <strong>Efforts to bring server functionality to later versions of Hawken are still ongoing,<br/>
                                and have seen recent successful progress - but require additional time to be ready.</strong>
                                <br/><br/>

                                <strong className='textColor_yellow'>PAX+ aims to bridge the gap</strong> - Allow players to enjoy the iconic Hawken gameplay & aesthetic
                                <br/>by making the original foundations of PAX more user friendly, modern & accessible.

                            </p>
                        </>
                    }

                    { tab == 1 && 

                        <>
                            <br/>

                            <h3>In-Game server browser</h3>
                            <p> 
                                The <strong>in-game main menu server browser</strong> - while functional - is <strong>unfinished <br/>
                                and will only show servers running on your own network.</strong><br/>
                                For that reason it is generally considered unsuitable for public multiplayer.<br/>
                                <strong>It is recommended to use the launcher server browser at all times.</strong>
                            </p>
                            
                            <h3>How to join servers</h3>
                            <p>
                                <strong>There are two methods of joining a server.</strong> <br/>
                                Both are accesible through the server list.<br/><br/>
                                <strong className='textColor_yellow'>When the game is not yet open</strong><br/>
                                &gt;&nbsp;&nbsp;&nbsp;&nbsp;Press the <strong>'JOIN' Button</strong> to <strong>launch the game and directly connect</strong> to your chosen server.<br/><br/>
                                <strong className='textColor_yellow'>When the game is already open / connected</strong><br/>
                                &gt;&nbsp;&nbsp;&nbsp;&nbsp;Press the <strong>'COPY CMD' Button</strong> and <strong>paste the console command into the in-game console.</strong><br/>
                                <br/> 
                                <strong>You can open the in-game console using the <span className='keyboardHint'>&nbsp;`&nbsp;</span> key.</strong><br/>
                            </p>

                            <h3>Do servers rotate maps / gamemodes?</h3>
                            <p>
                                <strong>PAX Client servers need to be restarted by their operator to change maps / gamemodes.</strong><br/>
                                This can happen occasionally but is usually considered rare.<br/>
                                The server admin will normally notify players through the server text chat, should a server reload be planned.<br/>
                                <strong>It is common practice to switch to a server running the desired map / gamemode instead.</strong>
                            </p>
    
                            <h3>Can I host my own public server?</h3>
                            <p>
                                <strong>Yes! You can even have it listed on the launcher server-list</strong><br/>
                                Check the <a href='https://discord.com/channels/390593866690068480/1117184340800057485'>#server-hosting-tutorial</a> channel on the discord for help & instructions.<br/>
                            </p>

                        </>
                    }

                    { tab == 2 && 
                        
                        <>
                            <br/>
                            
                            <h3>Opening the in-game console</h3>
                            <p><strong>You can open the in-game console using the <span className='keyboardHint'>&nbsp;`&nbsp;</span> key.</strong></p>
                            
                            <h3>Show FPS</h3>
                            <p><span className='commandHint'>&nbsp;Stat FPS&nbsp;</span></p>

                            <h3>Joining a server</h3>
                            <p><span className='commandHint'>&nbsp;Open &nbsp; SERVER_IP_HERE&nbsp;</span></p>

                            <h3>Switching teams</h3>
                            <p><span className='commandHint'>&nbsp;SwitchTeam&nbsp;</span></p>

                            <h3>Respawn</h3>
                            <p><span className='commandHint'>&nbsp;Suicide&nbsp;</span></p>

                        </>
                    }
                
                </div>

                <div className="pagewindow blockerLines"/>

            </div>

        </div>
    ); 
} 
    
export default Guide;