import React, { useRef } from 'react'; 
import { useEffect, useState, useContext } from 'react';
import DynamicOption from '../components/DynamicOption/DynamicOption.jsx';

import { LauncherContext } from "../LauncherContext.js";

function Configure() {     

    const LauncherState = useContext( LauncherContext );

    //const [settingsData, setSettingsData] = useState({});

    const [gamePath, setGamePath] = useState(null);
    const [documentsPath, setDocumentsPath] = useState(null);

    const gamePath_InputRef = useRef(null);
    const documentsPath_InputRef = useRef(null);

    const launchArgs = useRef("");

    async function fetchSettings() {

        //let settings = await LauncherCoreAPI.GetGameSettingsBase();
        let gamePath = await LauncherCoreAPI.getUserConfigValue( "launcher","gamePath");
        let documentsPath = await LauncherCoreAPI.getUserConfigValue( "launcher","documentsPath");
        let args = await LauncherCoreAPI.getUserConfigValue( "launcher","gameStartupArgs");

        //if ( settings ) setSettingsData( settings );
        if ( gamePath ) setGamePath( gamePath );
        if ( documentsPath ) setDocumentsPath( documentsPath );
        if ( args ) launchArgs.current = args;
    }

    async function updateGamePath(event) {

        let result = await LauncherCoreAPI.OpenFileDialog();

        if ( result && !result.cancelled && result.filePaths.length > 0 ) {

            console.log(result.filePaths[0]);

            await LauncherCoreAPI.setUserConfigValue( "launcher","gamePath", result.filePaths[0] );
            await auncherCoreAPI.setUserConfigValue( "launcher", "clearmechsetups", true );
    
            setGamePath( result.filePaths[0] );
        }

    }

    async function updateDocumentsPath(event) {

        let result = await LauncherCoreAPI.OpenFileDialog();

        if ( result && !result.cancelled && result.filePaths.length > 0 ) {

            await LauncherCoreAPI.setUserConfigValue( "launcher","documentsPath", result.filePaths[0] );
            setDocumentsPath( result.filePaths[0] );
        }

    }

    useEffect( () => {

        fetchSettings();
        
        return () => {
            LauncherCoreAPI.setUserConfigValue( "launcher", "gameStartupArgs", launchArgs.current );
            LauncherCoreAPI.SaveGameSettings();
        }

    }, [])


    return (         
    
        <div className="UIPage nohighlight" id="page_goptions" style={{display: "block"}}>


            <div className="pagewindow">

                <h1 className="edgeDots">LAUNCHER</h1>

                <div className="pagewindow">
                    <h2 className="dailogWindow blockerLines" style={{fontSize: "16px", backgroundColor: "#1A2223", height:"10px"}}>&nbsp;</h2>
                </div>

                <table id="table_graphicsOptions">

                    <tbody>

                            <tr>
                                <td style={{width: "40px", fontSize:"13px" }}>DOCUMENTS</td>
                                <td style={{ width: "240px", textAlign: "left", paddingLeft: "20px", fontSize:"14px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}} id="gamepath_dir">{documentsPath ? documentsPath : "Use Default"}</td>
                                <td className="edgeDots" style={{ width: "30px", fontSize: "15px"}}>
                                <button tabIndex="-1" type="file" id="gamepath_button" onClick={ updateDocumentsPath }>Change</button>
                                <input type="file" id="gamepath_input" ref={documentsPath_InputRef} onChange={ updateDocumentsPath } hidden/>
                                </td>
                            </tr>

                            <tr>
                                <td style={{width: "40px", fontSize:"13px"}}>GAME EXE</td>
                                <td style={{ width: "240px", textAlign: "left", paddingLeft: "20px", fontSize:"14px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}} id="gamepath_dir">{gamePath}</td>
                                <td className="edgeDots" style={{ width: "30px", fontSize: "15px"}}>
                                <button tabIndex="-1" type="file" id="gamepath_button" onClick={ updateGamePath }>Select</button>
                                <input type="file" id="gamepath_input" ref={gamePath_InputRef} onChange={updateGamePath} hidden/>
                                </td>
                            </tr>


                            <tr>
                                <td className="edgeDots" style={{width: "277px", fontSize:"13px", height: "33px", textAlign: "center", padding:"0"}}>LAUNCH ARGS</td>
                                <td colSpan="2" className="edgeDots" style={{width: "150px"}}>
                                    <input type="text" id="favcolor" name="favcolor" spellCheck="false" defaultValue={launchArgs.current} onInput={ ()=> {launchArgs.current = event.target.value} } style={{position:"absolute", color:"#81c0c4", paddingLeft:"15px", top:"3px",left:"3px",width:"95.6%"}} />
                                </td>
                            </tr>
                            
                    </tbody>

                </table>

                <div className="pagewindow">
                    <h2 className="dailogWindow blockerLines" style={{fontSize: "16px", backgroundColor: "#1A2223", height:"10px"}}>&nbsp;</h2>
                </div>

            </div>


           

            { Object.keys(LauncherState.settings_layout).map( (section ) => 
                
                <div className="pagewindow" key={section}>

                    <h1 className="edgeDots">{ section }</h1>

                    <table id="table_graphicsOptions">
                   
                        <tbody>

                            { Object.keys(LauncherState.settings_layout[section]).map( ( option ) => 

                                <DynamicOption optionsSection={section} optionsKey={option} optionsData={LauncherState.settings_layout[section][option]} key={option}></DynamicOption>
                                )
                            }

                        </tbody>
        
                    </table>

                </div>
                )
            }
         
        </div>
    ); 
} 
    
export default Configure;