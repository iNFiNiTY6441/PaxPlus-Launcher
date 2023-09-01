import React, { useState, useMemo, useContext, useEffect, createContext } from "react";
import Layout from "./components/Layout/Layout.jsx";
import { HashRouter, Routes, Route } from "react-router-dom";
import Legal from "./pages/Legal.jsx";
import Settings from "./pages/Settings.jsx";
import Play from "./pages/Play.jsx";
import Loading from "./pages/Loading.jsx";
import Critical from "./pages/Critical.jsx";
import Welcome from "./pages/Welcome.jsx";
import Guide from "./pages/Guide.jsx";

import { LauncherContextProvider } from "./LauncherContext.js";

function App() {

return (
    
    <LauncherContextProvider>

        <HashRouter basename={"/"}>
            
            <Routes>

                <Route path="/loading" element={<Loading />}/>
                <Route path="/error" element={<Critical/>}/>
                <Route path="/welcome" element={<Welcome/>}/>

                {/* Menu navigation routes */}
                <Route path="/menu" element={<Layout />}>

                    <Route path="/menu/loading" element={<Loading/>} /> 
                    <Route path="/menu/error" element={<Critical/>} />

                    <Route path="/menu/guide" element={<Guide/>} />
                    <Route path="/menu/play" element={<Play/>} />
                    <Route path="/menu/config" element={<Settings/>} />
                    <Route path="/menu/about" element={<Legal/>} />    
                    
                </Route>

            </Routes>      

        </HashRouter>   

    </LauncherContextProvider>
);
}

export default App