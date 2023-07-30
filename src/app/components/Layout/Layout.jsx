import React from 'react';
import {Outlet} from "react-router-dom";
import Sidemenu from '../Sidemenu/Sidemenu.jsx';
import Topbar from '../Topbar/Topbar.jsx';

const Layout =({children}) =>{
    return(
        <>
			<div id="tech2"></div>
            <div id="background"></div>

            <Topbar></Topbar>
            <Sidemenu></Sidemenu>
            <Outlet/>
            <main>{children}</main>
        </>
    )
}

export default Layout;