import React from 'react';
import { useEffect, useState, useContext } from 'react';
import ReactMarkdown from 'react-markdown'

/**
 * Top status & logo bar UI component
 */
const Topbar = () => {

    const [counter, setCounter] = useState(60);

    const [isOffline, setIsOffline] = useState(true);

    const [launcherNews, setLauncherNews ] = useState([]);

    const [patchVersion, setPatchVersion ] = useState("");


    useEffect(() => {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
      }, [counter]);


    async function initialize(){

        setIsOffline( await LauncherCoreAPI.isEOL() );
        setLauncherNews( await LauncherCoreAPI.getNews() );
        setPatchVersion( await LauncherCoreAPI.getPatchVersion());
    }

    useEffect(() => {
       
        initialize();
    }, []);
      
    return (
        <div className="menu_topBar">

            
            <div id="mainlogocontainer">

                <h1>PAX-PLUS</h1>
                <p>Launcher // v0.1.0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{patchVersion}</p>

            </div>


            <div className='statusBarContainer'>
                
                { /* WARNING BANNER: LAUNCHER IS EOL */ 
                
                isOffline == true && 

                    <div className='topbar_statusItem critical'>

                        <div className='icon'></div>

                        <h1>⚠ OFFLINE MODE</h1>
                        <p>Launcher version is no longer supported. Please <a href='https://github.com/iNFiNiTY6441/PaxPlus-Launcher'>update.</a></p>

                    </div>
                }

                { /* LAUNCHER NEWS FEED */ 
                
                !isOffline && launcherNews.map( newsItem => 
                    
                    <div key={newsItem.title} className='topbar_statusItem'>

                        <div className='icon'></div>

                        <h1>{newsItem.title}</h1>

                        <ReactMarkdown>{newsItem.message}</ReactMarkdown>

                    </div>
                )}

            </div>


        </div>
    );
};

export default Topbar;