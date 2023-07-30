import React from 'react'; 
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams} from "react-router-dom";
import Dialog from '../components/Dialog/Dialog.jsx';

function Welcome() {     

    const navigate = useNavigate();

    const [gamePath, setGamePath] = useState("No folder selected.");
    const [errorMessage, setErrorMessage] = useState("");
    const [canProceed, setCanProceed] = useState(false);

    const [page, setPage] = useState(0);


    async function updateGamePath(event) {

        let result = await LauncherCoreAPI.OpenFileDialog();

        if ( result && !result.cancelled && result.filePaths.length > 0 ) {            

            if ( result.filePaths[0].indexOf("Hawken-PC-Shipping") >= 0 ) {

                await LauncherCoreAPI.setUserConfigValue( "launcher","gamePath", result.filePaths[0] );
                await LauncherCoreAPI.SaveGameSettings();
                setGamePath( result.filePaths[0] );
                setCanProceed( true );
                setErrorMessage("");

            } else {

                setErrorMessage("Please select the 'Hawken-PC-Shipping' folder.");
                setCanProceed( false );
            }
            
        }

    }

    function nextPage(){
        setPage( page+1 );
    }

    function previousPage(){
        setPage( page-1 );
    }

    function finishSetup(){

        navigate("/menu");
    }

    return (
        
        <div className='pageFocus'>

            <div id="tech" style={{opacity:0.4}}></div>
            {
                page == 0 && 
                
                <Dialog dialogTitle="Welcome" rightButtonName="BEGIN" rightButtonFunction={nextPage}>

                    Hello there, <span style={{color: "#9df2f5"}}>Pilot</span>.
                    <br/><br/>
                    It looks like it's your first time using the
                    <span style={{color: "#9df2f5"}}> PAX+ Launcher</span>.
                    <br/><br/>
                    Let's get you set up so you can join the fight.

                </Dialog>
            }

            { page == 1 &&
            
                <Dialog dialogTitle="GAME LOCATION" rightButtonName="PROCEED" rightButtonFunction={nextPage} rightButtonEnabled={!canProceed}>

                    In order to patch your game, the launcher needs to know its location. <br/><br/>
                    Select the <span style={{color: "#9df2f5"}}>Hawken-PC-Shipping</span> folder of your installed <span style={{color: "#9df2f5"}}>PAX Client</span>.<br/><br/>
                    It can be changed later at any time in the launcher settings.
                    <br/>
                    <br/>

                    <table style={{ width: "400px"}}>

                        <tbody>
                        <tr>

                            <td style={{width: "435px", textAlign: "left", paddingLeft: "20px", fontSize: "13px"}}> { gamePath } </td>

                            <td class="edgeDots" style={{width: "90px", fontSize: "15px"}}>
                                <button type="file" id="btn_exeFile" onClick={updateGamePath}>Select</button>
                                <input type="file" id="input_exeFile"hidden/>
                            </td>

                        </tr>
                        </tbody>

                    </table>

                    <p style={{color: "#EE3E0E" }}>{errorMessage}</p>

                </Dialog> 
            }

            {
                page == 2 && 
                
                <Dialog dialogTitle="READY" rightButtonName="ACKNOWLEDGE" rightButtonFunction={finishSetup}>

                    <span style={{color: "#9df2f5"}}>Great, you're all set up.</span>
                    <br/><br/>
                    &gt; The game will update automatically as <br/>new patches become available.
                    <br/><br/>
                    &gt; You will be notified once a new version of this launcher <br/>is available for download
                    <br/><br/>
                    <span style={{color: "#dcdf5e"}}>Enjoy & good luck out there, Pilot.</span>
                </Dialog>
            }
        </div>

    ); 
} 
    
export default Welcome;