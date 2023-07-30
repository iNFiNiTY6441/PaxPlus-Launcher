import React from 'react'; 

function About() {     
    return (         
        <div className="UIPage nohighlight" id="page_legal" style={{display: "block"}}>
        
            <div className="pagewindow" style={{ backgroundColor: "#121719", backgroundColor: "#1217194d", border:"none", marginTop:"0px",marginBottom:"0px"}}>
                <h1 className="edgeDots" style={{color: "#e3e635"}}>DISCLAIMER</h1>

                <p style={{ color: "#bacecf", fontSize: "16.5px", lineHeight:"25px", marginTop: "14px"}}>
                PAX+ is a <span style={{color: "#9df2f5"}}>non-profit</span> community project.
                <br/>
                It is <span style={{color: "#9df2f5"}}>not affiliated with or authorized</span> by 505 Games or any related entities.
                <br/>
                It is purely for educational and <span style={{color: "#9df2f5"}}>non-commercial</span> purposes.
                <br/><br/>
                This application <span style={{color: "#9df2f5"}}>does not and will not contain any HAWKEN assets</span> produced by 
                <br/>
                Adhesive Games / Meteor Entertainment / 505 Games or any related entities.
                <br/><br/>
                Please refer to the E-Mail address provided below for any legal and official communications.
                </p>
            </div>  

            <div className="pagewindow" style={{ backgroundColor: "#121719", backgroundColor: "#1217194d", border:"none", marginTop:"0px",marginBottom:"0px"}}>
            <h1 className="edgeDots">CONTACT</h1>

            <div style={{display: "flex"}}>

              <div style={{ margin: "10px", marginLeft: "20px", fontSize: "16px", color: "#b4d0d1" }}>
                Legal
                <br/>
                <a href="mailto:paxplus@protonmail.com" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>paxplus@protonmail.com</a>
              </div>

              <div style={{ margin: "10px", marginLeft: "100px", fontSize: "16px", color: "#b4d0d1" }}>
                Support & Chat
                <br/>
                <a href="https://example.com" style={{ fontStyle: "Play Bold", fontSize: "18px", textDecoration: "none"}}>discord.gg/TO_BE_ADDED</a>
              </div>

            </div>

        </div>

        <div className="pagewindow" style={{ backgroundColor: "#121719", backgroundColor: "#1217194d", border:"none", marginTop:"0px",marginBottom:"0px"}}>
            <h1 className="edgeDots">CREDITS</h1>

            <div style={{display: "flex", marginTop: "10px", flexDirection: "column", flexWrap:"wrap", maxHeight: "150px", maxWidth:"650px"}}>

              <div style={{ margin: "10px", marginLeft: "18px", fontSize: "16px", color: "#b4d0d1"}}>
                Research & Patches
                <br/>
                <a href="https://discord.com/users/285990538644160512" style={{ fontStyle: "Play Bold", fontSize: "20px", textDecoration: "none"}}>Sigil</a>
              </div>

              
              <div style={{ margin: "10px", marginLeft: "18px", fontSize: "16px", color: "#b4d0d1"}}>
                Testing
                <br/>
                <a href="https://discord.com/users/88382040772218880" style={{ fontStyle: "Play Bold", fontSize: "20px", textDecoration: "none"}}>Tom Neverwinter</a>
              </div>
              
              <div style={{ margin: "10px", marginLeft: "18px", fontSize: "16px", color: "#b4d0d1"}}>
                Launcher Core, Design
                <br/>
                <a href="https://discord.com/users/513926154571350016" style={{ fontStyle: "Play Bold", fontSize: "20px", textDecoration: "none"}}>!NFiN!TY</a>
              </div>

              <div style={{ margin: "10px", marginLeft: "18px", fontSize: "16px", color: "#b4d0d1"}}>
                Launcher Utilities
                <br/>
                <a href="https://discord.com/users/120124072595030016" style={{ fontStyle: "Play Bold", fontSize: "20px", textDecoration: "none"}}>TimeMaster</a>
              </div>

              <div style={{ margin: "10px", marginLeft: "18px", fontSize: "16px", color: "#b4d0d1"}}>
                UPK Decompressor
                <br/>
                <a href="https://www.gildor.org" style={{ fontStyle: "Play Bold", fontSize: "20px", textDecoration: "none"}}>www.gildor.org</a>
              </div>

              <div style={{ margin: "10px", marginLeft: "18px", fontSize: "16px", color: "#b4d0d1"}}>
                Icon Graphics
                <br/>
                <a href="https://flaticon.com" style={{ fontStyle: "Play Bold", fontSize: "20px", textDecoration: "none"}}>www.flaticon.com</a>
              </div>


            </div>


        </div>
        </div>
    ); 
} 
    
export default About;