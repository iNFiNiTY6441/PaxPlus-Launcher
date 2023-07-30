import React from 'react';
import { useEffect, useState } from 'react';

/**
 * Top status & logo bar UI component
 */
const Topbar = () => {

    const [counter, setCounter] = useState(60);

    useEffect(() => {
        counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
      }, [counter]);

      
    return (
        <div className="menu_topBar">

        <div id="mainlogo"></div>
        <div id="mainlogocontainer"></div>

        {/* Fake status for now */}
        <div id="mainstatus">

            <h1>Up to date {counter}</h1>
            <div className="loadingBar">
            <div><p>READY</p></div>
            </div>

        </div>

    </div>
    );
};

export default Topbar;