import React from 'react';
import { Outlet } from 'react-router-dom';

const Dialog = ({children, dialogTitle, rightButtonName, rightButtonFunction, rightButtonEnabled } ) => {

    return (
        

        <div style={{textAlign:"center" , height:"100%"}}>
            
            <div className="dialogWindow nohighlight">

                <h1 className="edgeDots"> { dialogTitle } </h1>

                <p>
                    <main>{children}</main>
                </p>

                <div className="buttonContainer" style={{display:  rightButtonName ? "block" : "none" }}>

                    <button onClick={rightButtonFunction} disabled={rightButtonEnabled}> {rightButtonName}</button>

                </div>

            </div>

        </div>
    );
};

export default Dialog;