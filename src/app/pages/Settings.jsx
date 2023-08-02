import React, { useRef } from 'react'; 
import { useEffect, useState } from 'react';
import DynamicOption from '../components/DynamicOption/DynamicOption.jsx';

function Configure() {     

    const [settingsData, setSettingsData] = useState({});

    const [gamePath, setGamePath] = useState(null);

    const gamePath_InputRef = useRef(null);

    async function fetchSettings() {

        let settings = await LauncherCoreAPI.GetGameSettingsBase();
        let gamePath = await LauncherCoreAPI.getUserConfigValue( "launcher","gamePath");

        setSettingsData( settings );
        setGamePath( gamePath );

        console.log(settings);
        console.log(gamePath)
    }

    async function updateGamePath(event) {

        let result = await LauncherCoreAPI.OpenFileDialog();

        if ( result && !result.cancelled && result.filePaths.length > 0 ) {

            console.log(result.filePaths[0]);

            await LauncherCoreAPI.setUserConfigValue( "launcher","gamePath", result.filePaths[0] );
    
            setGamePath( result.filePaths[0] );
        }

    }

    useEffect( () => {

        fetchSettings();
        
        return () => {
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
                                <td style={{width: "40px"}}>GAME EXE</td>
                                <td style={{ width: "240px", textAlign: "left", paddingLeft: "20px", fontSize:"14px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}} id="gamepath_dir">{gamePath}</td>
                                <td className="edgeDots" style={{ width: "30px", fontSize: "15px"}}>
                                <button type="file" id="gamepath_button" onClick={ updateGamePath }>Select</button>
                                <input type="file" id="gamepath_input" ref={gamePath_InputRef} onChange={updateGamePath} hidden/>
                                </td>
                            </tr>
                            
                    </tbody>

                </table>

                <div className="pagewindow">
                    <h2 className="dailogWindow blockerLines" style={{fontSize: "16px", backgroundColor: "#1A2223", height:"10px"}}>&nbsp;</h2>
                </div>

            </div>


           

            { Object.keys(settingsData).map( (section ) => 
                
                <div className="pagewindow" key={section}>

                    <h1 className="edgeDots">{ section }</h1>

                    <table id="table_graphicsOptions">
                   
                        <tbody>

                            { Object.keys(settingsData[section]).map( ( option ) => 

                                <DynamicOption optionsSection={section} optionsKey={option} optionsData={settingsData[section][option]} key={option}></DynamicOption>
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