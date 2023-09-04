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

            <div className="pagewindow" id="section_contact">

                <h1 className="edgeDots">CONTACT</h1>

                <div className='grid' id="grid_contact">

                <div>
                    Legal<br/>
                    <a tabIndex="-1" href="mailto:paxplus@protonmail.com">paxplus@protonmail.com</a>
                </div>

                <div>
                    Support & Chat<br/>
                    <a className="highlight"tabIndex="-1" href="https://discord.gg/ezPm8ZS" >discord.gg/ezPm8ZS</a>
                </div>

             </div>

        </div>

        <div className="pagewindow" id="section_credits">

            <h1 className="edgeDots">CREDITS</h1>

            <div className='grid' id="grid_credits" >

            <div className='grid_divider'><p>DEVELOPMENT</p></div>

                <div>
                    Research & Patches<br/>
                    <a tabIndex="-1" href="https://discord.com/users/285990538644160512" title="open link">Sigil</a>
                </div>

                <div>
                    Launcher Core & Design<br/>
                    <a tabIndex="-1" href="https://discord.com/users/513926154571350016" title="open link">!NFiN!TY</a>
                </div>

                <div>
                    Launcher Utilities<br/>
                    <a tabIndex="-1" href="https://discord.com/users/120124072595030016" title="open link">TimeMaster</a>
                </div>
              
                <div className='grid_divider'><p>EXTERNAL TOOLS</p></div>

                <div>
                    UPK Decompressor<br/>
                    <a tabIndex="-1" href="https://www.gildor.org" title="open link">gildor.org</a>
                </div>

                <div>
                    UPK Utils<br/>
                    <a tabIndex="-1" href="https://github.com/wghost/UPKUtils" title="open link">github.com/wghost</a>
                </div>

                <div className='grid_divider'><p>TESTING</p></div>

                <div>
                    <a tabIndex="-1" href="https://discord.com/users/181997064962572288" title="open link">Shug</a>
                </div>

                <div>
                    <a tabIndex="-1" href="https://discord.com/users/248873012676395018" title="open link">DragonStrike406</a>
                </div>

                <div>
                    <a tabIndex="-1" href="https://www.example.com" title="open link">Tester Slot</a>
                </div>

            </div>

        </div>


    </div>

    ); 
} 
    
export default About;