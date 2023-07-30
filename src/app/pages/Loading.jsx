import React from 'react'; 
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Full page loading screen UI component, with loading bar element of variable length
 */

function Loading() {     


    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();

    function test(){

        navigate("/menu")
    }
    
    return (         

        <div className='pageFocus'>

            <div className="loadingWindow nohighlight" style={{ "--progressbarLength": searchParams.get("progress") }}>

                <div>
                    <img id="loadIcon"/>
                </div>

                <div>
                    <h1>LOADING</h1>
                    <p>{searchParams.get("loadingText")}</p>
                </div>
            
            
            </div>
        
        </div>
    ); 
} 
    
export default Loading;