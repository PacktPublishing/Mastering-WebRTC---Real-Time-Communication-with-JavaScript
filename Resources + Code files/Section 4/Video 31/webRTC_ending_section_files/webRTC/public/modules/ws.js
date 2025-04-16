import * as state from "./state.js";
import * as uiUtils from "./uiUtils.js";
import * as constants from "./constants.js";

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

// ############## OUTGOING MESSAGES

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

// ############## INCOMING MESSAGES

function handleMessage(incomingMessageEventObject) {
    const message = JSON.parse(incomingMessageEventObject.data);
    // process an incoming message depending on its label
    switch(message.label) {
        // NORMAL SERVER STUFF
        case constants.labels.NORMAL_SERVER_PROCESS:
            normalServerProcessing(message.data);
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

// user successfully joins a room
function joinSuccessHandler(data) {
    state.setOtherUserId(data.creatorId); // set the ID of the other person waiting in the room (originally the creator but it may change later - for example if the creator exits the room and a third peer decides to join the room)
    state.setRoomName(data.roomName);
    uiUtils.joineeToProceedToRoom();
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
};