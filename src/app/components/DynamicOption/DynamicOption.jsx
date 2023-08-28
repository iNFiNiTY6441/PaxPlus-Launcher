import React from 'react';
import { BrowserRouter, Route, Link } from "react-router-dom";
import { useEffect, useState } from 'react';


const DynamicOption = ( { optionsSection, optionsKey, optionsData }) => {

    //console.log(optionsData);

    const [ optionValue, setOptionValue ] = useState("");

    async function getSetttingValue() {
        let val = await LauncherCoreAPI.GetGameSetting( optionsSection, optionsKey );

        if ( !val ) val = "ERROR";
        setOptionValue( val );
    }

    async function inputUpdate( event ) {

        let value = null;

        switch ( optionsData.type ) {

            default: 
                value = event.target.value;
                break;

            case 'toggle':
                value = event.target.checked ? 'True' : 'False';
                break;
        }
        await LauncherCoreAPI.SetGameSetting( optionsKey, value );
        setOptionValue( value );
    }


    useEffect( () => {

        getSetttingValue();
        
    }, [])



    if ( optionsData.type == "slider" ) return (

        <tr>
            <td style={{width: "310px"}}>{optionsData.name}</td>
            <td colSpan="2" style={{ textAlign: "left"}}>

                <div className="sliderLabel" id="{optionsData.name}_label" htmlFor="gfx_fpsCap" style={{ left: "4px"}} >{optionValue}</div>
                <input type="range" min={optionsData.min} max={optionsData.max} value={ optionValue } step={optionsData.step} className="slider" onChange={ inputUpdate } id="gfx_fpsCap" style={{ left: "128px"}}/>
            
            </td>
        </tr>

    );

    if ( optionsData.type == "list" ) return (

        <tr>
            <td style={{width: "230px"}}>{optionsData.name}</td>
            <td style={{width: "160px"}}>
            <div className="edgeDots" style={{fontSize: "14.4px"}}></div>
            
                <select value={ optionValue } onChange={ inputUpdate }>
                    { optionsData.listOptions.map( listOption =>  

                        <option key={listOption.name} value={listOption.value}>{listOption.name}</option>
                        )
                    }
                </select>

            </td>
            <td className="blockerLines" style={{width: "140px"}}></td>
        </tr>
    );

    if ( optionsData.type == "toggle" ) return (

        <tr>
            <td className="edgeDots" style={{width: "277px"}}>{optionsData.name}</td>
            <td className="edgeDots" style={{width: "150px"}}>
            <label className="container">
                <input type="checkbox" checked={ optionValue.toString().toLowerCase() === "true" } onChange={ inputUpdate } />
                <span className="checkmark"></span>
            </label>
            </td>
            <td className="blockerLines" style={{width: "170px"}}></td>
        </tr>

    );

    if ( optionsData.type == "color" ) return (

        <tr>
            <td className="edgeDots" style={{width: "277px"}}>{optionsData.name}</td>
            <td className="edgeDots" style={{width: "150px"}}>
                <input type="color" id="favcolor" name="favcolor" value={""+optionValue+""} onChange={ inputUpdate } style={{position:"absolute", top:"3px",left:"3px", width:"198px"}} />
            </td>
            <td className="blockerLines" style={{width: "170px"}}></td>
        </tr>

    );

    if ( optionsData.type == "text" ) return (

        <tr>
            <td className="edgeDots" style={{width: "277px"}}>{optionsData.name}</td>
            <td className="edgeDots" style={{width: "150px"}}>
                <input type="text" id="favcolor" name="favcolor" value={""+optionValue+""} onChange={ inputUpdate } style={{position:"absolute", top:"3px",left:"3px",width:"186px"}} />
            </td>
            <td className="blockerLines" style={{width: "170px"}}></td>
        </tr>

    );

    return ( 

        <tr>
            <td style={{width: "240px"}}>ERROR: {optionsData.name}</td>
        </tr>
    );
    
};

export default DynamicOption;