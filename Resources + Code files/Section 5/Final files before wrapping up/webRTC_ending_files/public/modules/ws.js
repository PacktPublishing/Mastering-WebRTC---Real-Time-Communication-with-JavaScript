import * as state from "./state.js";
import * as uiUtils from "./uiUtils.js";
import * as constants from "./constants.js";
import * as webRTCHandler from "./webRTCHandler.js";

// EVENT LISTENERS THAT THE BROWSER'S WEBSOCKET OBJECT GIVES US
export function registerSocketEvents(wsClientConnection) {
    // update our user state with this wsClientConnection
    state.setWsConnection(wsClientConnection);
    // listen for those 4 events
    wsClientConnection.onopen = () => {
        // tell the user that they have connected with our ws server
        uiUtils.logToCustomConsole("You have connected with our websocket server");

        // register the remaining 3 events
        wsClientConnection.onmessage = handleMessage;
        wsClientConnection.onclose = handleClose;
        wsClientConnection.onerror = handleError;
    };
};

function handleClose() {
    uiUtils.logToCustomConsole("You have been disconnected from our ws server", null, true, constants.myColors.red);
};

function handleError() {
    uiUtils.logToCustomConsole("An error was thrown",constants.myColors.red);
};

// ############## OUTGOING WEBSOCKET MESSAGES

// OUTGOING:JOIN ROOM
export function joinRoom(roomName, userId) {
    const message = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_JOIN.REQUEST,
            roomName,
            userId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
};

// OUTGOING:EXIT ROOM
export function exitRoom(roomName, userId) {
    const message = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_EXIT.REQUEST,
            roomName,
            userId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
};  

// OUTGOING:SENDING AN OFFER TO THE SIGNALING SERVER
export function sendOffer(offer) {
    const message = {
        label: constants.labels.WEBRTC_PROCESS,
        data: {
            type: constants.type.WEB_RTC.OFFER,
            offer, 
            otherUserId: state.getState().otherUserId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
};

// OUTGOING:SENDING AN ANSWER BACK TO THE SIGNALING SERVER
export function sendAnswer(answer) {
    const message = {
        label: constants.labels.WEBRTC_PROCESS, 
        data: {
            type: constants.type.WEB_RTC.ANSWER,
            answer, 
            otherUserId: state.getState().otherUserId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
};

// OUTGOING:SENDING ICE CANDIDATES TO THE OTHER PEER
export function sendIceCandidates(arrayOfIceCandidates) {
    const message = {
        label: constants.labels.WEBRTC_PROCESS,
        data: {
            type: constants.type.WEB_RTC.ICE_CANDIDATES,
            candidatesArray: arrayOfIceCandidates,
            otherUserId: state.getState().otherUserId
        }
    };
    state.getState().userWebSocketConnection.send(JSON.stringify(message));
};

// ############## INCOMING WEBSOCKET MESSAGES

function handleMessage(incomingMessageEventObject) {
    const message = JSON.parse(incomingMessageEventObject.data);
    // process an incoming message depending on its label
    switch(message.label) {
        // NORMAL SERVER STUFF
        case constants.labels.NORMAL_SERVER_PROCESS:
            normalServerProcessing(message.data);
            break;
        // WEBRTC SERVER STUFF
        case constants.labels.WEBRTC_PROCESS:
            webRTCServerProcessing(message.data);
            break;
        default: 
            console.log("unknown server processing label: ", message.label);
    }
};

function normalServerProcessing(data) {
    // process the message depending on its data type
    switch(data.type) {
        // join room - success
        case constants.type.ROOM_JOIN.RESPONSE_SUCCESS: 
            joinSuccessHandler(data);
            break; 
        // join room - failure
        case constants.type.ROOM_JOIN.RESPONSE_FAILURE: 
            uiUtils.logToCustomConsole(data.message, constants.myColors.red);
            break; 
        // join room - notification
        case constants.type.ROOM_JOIN.NOTIFY: 
            joinNotificationHandler(data);
            break; 
        // exit room - notification
        case constants.type.ROOM_EXIT.NOTIFY:
            exitNotificationHandler(data);
            break;
        // disconnection - notification
        case constants.type.ROOM_DISONNECTION.NOTIFY:
            exitNotificationHandler(data);
            break;
        // catch-all
        default: 
            console.log("unknown data type: ", data.type);
    }
};

function webRTCServerProcessing(data) {
    // Process the message based on the type of response
    switch(data.type) {
        // offer received
        // steps 11 and 12 (reference the md file)
        case constants.type.WEB_RTC.OFFER:
            webRTCHandler.handleOffer(data);
            break;
        // answer received
        // steps 24 (reference the md file)
        case constants.type.WEB_RTC.ANSWER:
            webRTCHandler.handleAnswer(data);
            break; 
        // ice candidates received
        // steps 24 (reference the md file)
        case constants.type.WEB_RTC.ICE_CANDIDATES:
            webRTCHandler.handleIceCandidates(data);
            break; 
        default: 
            console.log("Unknown data type: ", data.type);
    }
};

// user successfully joins a room
function joinSuccessHandler(data) {
    state.setOtherUserId(data.creatorId); // set the ID of the other person waiting in the room (originally the creator but it may change later - for example if the creator exits the room and a third peer decides to join the room)
    state.setRoomName(data.roomName);
    uiUtils.joineeToProceedToRoom();
    // at this point in time, we can start the WebRTC process
    webRTCHandler.startWebRTCProces(); 
};

// notify other feer that a second peer has joined room
function joinNotificationHandler(data) {
    alert(`User ${data.joinUserId} has joined your room`);
    state.setOtherUserId(data.joinUserId); // make sure this is set to the ID of the peer joining the room
    uiUtils.logToCustomConsole(data.message, constants.myColors.green);
    uiUtils.updateCreatorsRoom(); 
};

// notify the user still in the room, that the other peer has left the room
function exitNotificationHandler(data) {
    uiUtils.logToCustomConsole(data.message, constants.myColors.red);
    uiUtils.updateUiForRemainingUser();
    webRTCHandler.closePeerConnection();
};