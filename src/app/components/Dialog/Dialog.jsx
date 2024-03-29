import React from 'react';
import { Outlet } from 'react-router-dom';

const Dialog = ({children, dialogTitle, rightButtonName, rightButtonFunction, rightButtonEnabled } ) => {

    return (
        

        <div style={{textAlign:"center" , height:"100%"}}>
            
            <div className="dialogWindow nohighlight">

                <h1 className="edgeDots"> { dialogTitle } </h1>

                <p>
                    {children}
                </p>

                <div className="buttonContainer" style={{display:  rightButtonName ? "block" : "none" }}>

                    <button tabIndex="-1" onClick={rightButtonFunction} disabled={rightButtonEnabled}> {rightButtonName}</button>

                </div>

            </div>

        </div>
    );
};

export default Dialog;