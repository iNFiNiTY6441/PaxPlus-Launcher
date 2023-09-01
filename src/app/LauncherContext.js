import React, { useState, useEffect } from "react";
import { DefaultState } from "./defaultLauncherState.js";

const LauncherContext = React.createContext();

const LauncherContextProvider = props => {

    let [launcherState, setLauncherState] = useState(DefaultState);

    async function initialize(){

        await LauncherCoreAPI.attachLauncherState( (newState) => {
            console.log("RENDER:STATEUPDATE");
            setLauncherState( newState );
        } );

        await LauncherCoreAPI.initialize();
    }

    useEffect( () => {

        initialize();

    }, [] );

    return (
        <LauncherContext.Provider value={launcherState}>
        {props.children}
        </LauncherContext.Provider>
    );
};

export { LauncherContextProvider, LauncherContext };