import React from 'react'; 
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Fullscreen error UI overlay, providing some general information about the encountered problem, along with a button to proceed to a new page
 */
function Critical() {     


    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    return (         

        <div className='pageFocus'>

            <div className="loadingWindow nohighlight" style={{ "--progressbarLength": "1.0" }}>


                <div style={{ marginLeft: "56px"}}>
                    <h1 style={{color: "#EE3E0E"}}>ERROR</h1>
                    <p style={{ fontSize: "18px", letterSpacing:"0.2px", marginBottom:0}}>{searchParams.get("errorHeading")}</p>
                    <p style={{ fontSize: "16px", opacity: 0.6, width:"400px"}}>{searchParams.get("errorMessage")}</p>

                </div>

                <button className='darkButton edgeDots' style={{width:"120px", height: "34px", top: "180px", left:"340px", display: ()=> searchParams.get("actionName") != undefined ? "block" : "none"}} onClick={()=> {navigate( searchParams.get("actionURL") )}}> {searchParams.get("actionName")}</button>

            </div>

        </div>

    ); 
} 
    
export default Critical;