import React from 'react'; 
import ReactMarkdown from 'react-markdown'


function About() {     

    return (

        <div className="UIPage nohighlight" id="page_legal" style={{display: "block"}}>
        
            <div id="section_legal" className="pagewindow">

                <h1 className="edgeDots textColor_yellow">DISCLAIMER</h1>

                <p>
                    PAX+ is a <strong>non-profit</strong> community project.
                    <br/>
                    It is <strong>not affiliated with or authorized by 505 Games</strong> or any related entities.
                    <br/>
                    It is purely for educational and <strong>non-commercial</strong> purposes.
                    <br/><br/>
                    This application <strong>does not and will not contain any HAWKEN assets</strong> produced by 
                    <br/>
                    Adhesive Games / Meteor Entertainment / 505 Games or any related entities.
                    <br/><br/>
                    Please refer to the E-Mail address provided below for legal and official communications.
                </p>

            </div>  

            <div className="pagewindow" style={{height:"100px"}}>

                <h1 className="edgeDots">CONTACT</h1>

                <div style={{display: "flex", marginTop:"10px"}}>

                <div style={{ margin: "10px", marginLeft: "20px", fontSize: "16px", color: "#b4d0d1" }}>
                    Legal
                    <br/>
                    <a tabIndex="-1" href="mailto:paxplus@protonmail.com" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>paxplus@protonmail.com</a>
                </div>

                <div style={{ margin: "10px", marginLeft: "100px", fontSize: "16px", color: "#b4d0d1" }}>
                    Support & Chat
                    <br/>
                    <a tabIndex="-1" href="https://example.com" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>discord.gg/TO_BE_ADDED</a>
                </div>

             </div>

        </div>

        <div className="pagewindow">

            <h1 className="edgeDots">CREDITS</h1>

            {/* <p style={{marginLeft:"20px",marginRight:"80px", marginTop:"20px", padding:"0", borderBottom:"1px solid #465657"}}>DEVELOPMENT</p> */}

            <div style={{display: "flex", marginTop: "14px", flexDirection: "column", flexWrap:"wrap", maxHeight: "80px", maxWidth:"650px", marginLeft:"0px",marginRight:"20px"}}>

              <div style={{ margin: "10px", marginLeft: "20px", fontSize: "16px", color: "#b4d0d1"}}>
                Research & Patches
                <br/>
                <a tabIndex="-1" href="https://discord.com/users/285990538644160512" title="open link" style={{ fontStyle: "Play Bold", fontSize: "20px", textDecoration: "none"}}>Sigil</a>
              </div>

              <div style={{ margin: "10px", marginLeft: "0px", fontSize: "16px", color: "#b4d0d1"}}>
                Launcher Core & Design
                <br/>
                <a tabIndex="-1" href="https://discord.com/users/513926154571350016" title="open link" style={{ fontStyle: "Play Bold", fontSize: "20px", textDecoration: "none"}}>!NFiN!TY</a>
              </div>

              <div style={{ margin: "10px", marginLeft: "0px", fontSize: "16px", color: "#b4d0d1"}}>
                Launcher Utilities
                <br/>
                <a tabIndex="-1" href="https://discord.com/users/120124072595030016" title="open link" style={{ fontStyle: "Play Bold", fontSize: "20px", textDecoration: "none"}}>TimeMaster</a>
              </div>

            </div>

            {/* <p style={{marginLeft:"20px",marginRight:"80px", marginTop:"20px", padding:"0", borderBottom:"1px solid #465657"}}>EXTERNAL</p> */}

            <div style={{display: "flex", marginTop: "14px", flexDirection: "column", flexWrap:"wrap", maxHeight: "80px", maxWidth:"650px", marginLeft:"00px",marginRight:"20px"}}>

                <div style={{ margin: "10px", marginLeft: "20px", fontSize: "16px", color: "#b4d0d1"}}>
                UPK Decompressor
                <br/>
                <a tabIndex="-1" href="https://www.gildor.org" title="open link" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>gildor.org</a>
                </div>

                <div style={{ margin: "10px", marginLeft: "-14px", fontSize: "16px", color: "#b4d0d1"}}>
                UPK Utils
                <br/>
                <a tabIndex="-1" href="https://github.com/wghost/UPKUtils" title="open link" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>github.com/wghost</a>
                </div>

            </div>

            <p style={{marginLeft:"20px",marginRight:"80px", marginTop:"20px", padding:"0", borderBottom:"1px solid #465657"}}>TESTING</p>

            <div style={{display: "flex", marginTop: "-14px", flexDirection: "column", flexWrap:"wrap", maxHeight: "80px", maxWidth:"650px", marginLeft:"0px",marginRight:"20px"}}>

                <div style={{ margin: "10px", marginLeft: "20px", fontSize: "16px"}}>
                <a tabIndex="-1" href="https://www.example.com" title="open link" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>Tester Slot</a>
                </div>

                <div style={{ margin: "10px", marginLeft: "0px", fontSize: "16px"}}>
                <a tabIndex="-1" href="https://www.example.com" title="open link" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>Tester Slot</a>
                </div>

                <div style={{ margin: "10px", marginLeft: "0px", fontSize: "16px"}}>
                <a tabIndex="-1" href="https://www.example.com" title="open link" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>Tester Slot</a>
                </div>

                <div style={{ margin: "10px", marginLeft: "0px", fontSize: "16px"}}>
                <a tabIndex="-1" href="https://www.example.com" title="open link" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>Tester Slot</a>
                </div>

            </div>



        </div>


    </div>

    ); 
} 
    
export default About;