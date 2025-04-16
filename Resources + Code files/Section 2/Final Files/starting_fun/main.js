// grab DOM elements
const myVideoContainer = document.getElementById("myVideoContainer");
const myVideoElement = document.getElementById("myVideo");

let pc = null; // define pc in global scope, so we can access the pc object in the dev console within the browser

// define a click event listener to trigger a GUM (get user media) request
myVideoContainer.addEventListener("click", initiateWebRTC);

// start the WebRTC connection process
const initiateWebRTC = async () => {
    // wrap our promises within try and catch blocks
    try {
        let localStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: {exact: "79d6d9a0cf8ba8eaf60352ad8037ce22d805397cf5433e13be9e28fce37bd74d"}}
        });
        myVideoElement.srcObject = localStream; // display your video inside of our HTML element

        // implementing WebRTC set of protocols
        // step 1: create our peer connection object, and define configurations for ice gathering
        const webRTCConfigurationObject = {
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:23.21.150.121:3478"
                    ]
                },
                {
                    urls: 'turn:my-turn-server.wallyWarthog.com:11203',
                    username: 'optional-username',
                    credential: 'auth-token'
                }
            ]
        };

        // instantiate the RTCPeerConnection object
        pc = new RTCPeerConnection(webRTCConfigurationObject);

        // add an event listener, to indicate when we should start the signaling process
        pc.addEventListener("negotiationneeded", handleNegotiationNeededEvent);

        // step 2: add the type of media / data we wish to send & receive, to our peer connection object
        const tracks = localStream.getTracks(); // grab our tracks from our local stream

        // loop through each track (even though we have only one), and add each track to our pc object
        tracks.forEach(track => {
            pc.addTrack(track);
            console.log('track was added to pc object');
        });

        // For fun: display stats related to our media track added to our pc
        let stats = await pc.getStats();
        stats.forEach(report => {
            console.log(report);
        })

        // listen for ice candidates gathered
        pc.addEventListener("icecandidate", (eventObject) => {
            console.log("ICE RECEIVED:", eventObject.candidate);
            // NOW WE NEED TO SEND THIS ICE CANDIDATE TO OUR SIGNALING SERVER (later in course)
        });
        
    } catch (error) {
        getVideoIDs(); // I did this to grab the ID for my video feeds (you probably won't need to do this)
        console.log(error);
    }
}; // end initiateWebRTC function

// define our negotiation required function
async function handleNegotiationNeededEvent() {
    const offer = await pc.createOffer(); // create our OFFER as specified by the SDP protocol
    console.log('offer created:', offer);
    // add our offer to our pc object
    await pc.setLocalDescription(offer); // add the OFFER to our local session description (this will add the 'm=' flag which will trigger the ice gathering process)
    // ... more logic will go here ... later in course ...
};

// function to get my video ID's to deal with errors (you probably won't have to do this)
function getVideoIDs() {
    navigator.mediaDevices.enumerateDevices()
    .then(devicesArray => {
            devicesArray.forEach(device => {
                console.log(device)
            })
        })
}; // end getVideoIDs function
        