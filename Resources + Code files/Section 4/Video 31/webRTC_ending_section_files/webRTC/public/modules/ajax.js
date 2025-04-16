import * as uiUtils from "./uiUtils.js";
import * as constants from "./constants.js";
import * as state from "./state.js";

// create a new room using the Fetch API
export function createRoom(roomName, userId) {
    fetch('/create-room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({roomName, userId})
    })
    .then( response => response.json() )
    .then(resObj => {   
        if(resObj.data.type === constants.type.ROOM_CREATE.RESPONSE_SUCCESS) {
            state.setRoomName(roomName);
            uiUtils.logToCustomConsole("Room created", constants.myColors.green);
            uiUtils.logToCustomConsole("Waiting for other peer");
            uiUtils.creatorToProceedToRoom();
        }
        if(resObj.data.type === constants.type.ROOM_CREATE.RESPONSE_FAILURE) {
            uiUtils.logToCustomConsole(resObj.data.message, constants.myColors.red);
        }
        
    })
    .catch(err => {
        console.log("an error ocurred trying to create a room: ", err);
        uiUtils.logToCustomConsole("Some sort of error happened trying to create a room. Sorry", constants.myColors.red);
    })
};

// destroying a room before peer2 has entered
export function destroyRoom(roomName) {
    fetch('/destroy-room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({roomName})
    })
    .then( response => response.json() )
    .then(resObj => {   
        if(resObj.data.type === constants.type.ROOM_DESTROY.RESPONSE_SUCCESS) {
            uiUtils.exitRoom();
            uiUtils.logToCustomConsole(resObj.data.message);
        }
        if(resObj.data.type === constants.type.ROOM_DESTROY.RESPONSE_FAILURE) {
            uiUtils.logToCustomConsole(resObj.data.message, constants.myColors.red);
        }
        
    })
    .catch(err => {
        console.log("an error ocurred trying to destroy a room: ", err);
        uiUtils.logToCustomConsole("Some sort of error happened trying to destroy a room. Sorry", constants.myColors.red);
    })
};