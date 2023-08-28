const axios = require('axios');
const fs = require('fs');
/**
 * Manages a remote data endpoint 
 */

class RemoteDataManager {

    /**
     * Creates a new data manager for a remote data endpoint
     * @param {*} url Remote data endpoint
     * @param {Object} options Data manager configuration options
     * @param {String} options.localPath Path to locally save the remote data to
     * @param {Function} options.onChange Callback for when the data changes
     */

    constructor( url, options = {} ) {

        // Local copy of remote data
        this.data = null;

        // Source of the last data version
        this.dataSource = null;

        // Path to locally store the data at
        this.localPath = null;

        // Where to get the remote data from
        this.remoteUrl = url;

        // Callback for when the data changes
        this.onChangedCallback = options.onChange || null;

        // Get filename from remote url
        let urlSegments = new URL(url).pathname.split('/');
        this.filename = "remote_"+urlSegments[urlSegments.length-1];

        if ( options.localPath ) this.localPath = options.localPath+"\\"+this.filename;
    }

    /**
     * Loads the resource data from the specified location
     * 
     * @param {'local'|'remote'} location Whether to load the resource locally or from the remote endpoint
     * @param { Boolean } fallback Whether to fallback on the opposite retrieval location ( local for remote and vice versa )
     * @async
     */

    async loadFrom( location, fallback ) {

        let fallbackLocation = null;

        try {

            switch ( location ) {

                case 'local':
                    fallbackLocation = 'remote';
                    await this.loadLocal();
                    break;
    
                case 'remote':
                    if ( this.localPath ) fallbackLocation = 'local';
                    await this.loadRemote();
                    break;
            }

        } catch( initError ) {

            if ( fallback === true && fallbackLocation != null ) {

                await this.loadFrom( fallbackLocation, false );

            } else {
                throw new Error("Failed to obtain file & no fallback exists!");
            }
        }

    }

    /**
     * Load the resource data from local storage, if available
     * @async
     */
    async loadLocal(){

        if ( !this.localPath ) throw new ReferenceError("No local path specified!");

        if ( !fs.existsSync( this.localPath ) ) throw new Error("No local copy of remote file!");
        
        let rawData = fs.readFileSync( this.localPath );
        this.data = JSON.parse( rawData );
        this.dataSource = 'local';
    }

    /**
     * Load the resource data from the remote endpoint, if available
     * @async
     */
    async loadRemote() {

        const response = await axios.get( this.remoteUrl, {
            timeout: 4000,
            signal: AbortSignal.timeout(4000),
        }).catch( abortError => {

        });
        
        if ( this.data === response.data ) return;

        // Call update handler if available
        if ( this.onChangedCallback ) this.onChangedCallback( response.data );

        // Write to local file, if requested
        if ( this.localPath ) fs.writeFileSync( this.localPath + "\\", JSON.stringify( response.data , null, 2 ) );

        // Update in memory copy
        this.data = response.data;
        this.dataSource = 'remote';
    }
}

module.exports = RemoteDataManager;