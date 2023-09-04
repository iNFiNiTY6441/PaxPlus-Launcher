import React from 'react';
import { useEffect, useState, useContext } from 'react';
import ReactMarkdown from 'react-markdown'
import { LauncherContext } from "../../LauncherContext.js";

/**
 * Top status & logo bar UI component
 */
const Topbar = () => {

   const LauncherState = useContext( LauncherContext );

    return (

        <div className="menu_topBar nohighlight">

            
            <div id="mainlogocontainer">

                <h1>PAX-PLUS</h1>
                <p>Launcher // v{LauncherState.version_launcher} - {LauncherState.version_patch}</p>

            </div>


            <div className='statusBarContainer'>
                
                { /* WARNING BANNER: LAUNCHER IS EOL */ 
                
                LauncherState.network_mode !== 0 && 

                    <div className='topbar_statusItem critical'>

                        <div className='icon'></div>

                        <h1>⚠ OFFLINE MODE</h1>

                        { LauncherState.support_status === 'offline' && <p>No internet connection. Try restarting the launcher or play offline with the locally saved patch.</p> }

                        { LauncherState.support_status === 'eol' && <p>Launcher version is no longer supported. Please <a tabIndex="-1" href='https://github.com/iNFiNiTY6441/PaxPlus-Launcher/releases'>update.</a></p> }

                    </div>
                }

                {
                    LauncherState.network_mode === 0 && LauncherState.support_status !== 'latest' &&

                    <div tabIndex="-1" key="updatewarning" className='topbar_statusItem'>

                        <div className='icon'></div>

                        <h1 className='textColor_yellow'>Update available</h1>

                        <ReactMarkdown components={{ a: ({node, ...props}) => <a tabIndex="-1" {...props} />}}>A newer version is ready for download. [Update](https://github.com/iNFiNiTY6441/PaxPlus-Launcher/releases)</ReactMarkdown>

                    </div>
                }


                { /* LAUNCHER NEWS FEED */ 
                
                LauncherState.network_mode === 0 && LauncherState.news && LauncherState.news.map( newsItem => 
                    
                    <div tabIndex="-1" key={newsItem.title} className='topbar_statusItem'>

                        <div className='icon'></div>

                        <h1>{newsItem.title}</h1>

                        <ReactMarkdown components={{ a: ({node, ...props}) => <a tabIndex="-1" {...props} />}}>{newsItem.message}</ReactMarkdown>

                    </div>
                )}

            </div>


        </div>

    );
};

export default Topbar;