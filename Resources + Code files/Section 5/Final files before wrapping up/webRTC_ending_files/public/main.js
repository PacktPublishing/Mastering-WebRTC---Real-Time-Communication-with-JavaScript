import { initializeUi, DOM, logToCustomConsole, exitRoom, addOutgoingMessageToUi } from "./modules/uiUtils.js";
import * as ws from "./modules/ws.js";
import * as ajax from "./modules/ajax.js";
import * as state from "./modules/state.js";
import * as webRTCHandler from "./modules/webRTCHandler.js";

// Generate unique user code for every user that visits the page
const userId = Math.round(Math.random() * 1000000);

// initialize the DOM
initializeUi(userId);

// establish a ws connection
const wsClientConnection = new WebSocket(`/?userId=${userId}`);

// pass all of our websocket logic to another module
ws.registerSocketEvents(wsClientConnection);

// create room
DOM.createRoomButton.addEventListener("click", () => {
   const roomName = DOM.inputRoomNameElement.value;
   if(!roomName) {
    return alert("Your room needs a name");
   };
   logToCustomConsole(`WS server is checking whether room ${roomName} is available ... pls wait`);
   ajax.createRoom(roomName, userId);
});

// destroying a room (before peer2 has entered/joined the room)
DOM.destroyRoomButton.addEventListener("click", () => {
   const roomName = state.getState().roomName;
   ajax.destroyRoom(roomName);
})

// joining a room (peer2)
DOM.joinRoomButton.addEventListener("click", () => {
   const roomName = DOM.inputRoomNameElement.value; 
   if(!roomName) {
      return alert("You have to join a room with a valid name");
   }
   ws.joinRoom(roomName, userId, wsClientConnection);
});

// exit a room (either peer)
DOM.exitButton.addEventListener("click", () => {
   const roomName = state.getState().roomName;
   exitRoom();
   ws.exitRoom(roomName, userId);
   logToCustomConsole(`You have left room ${roomName}`);
   // close the peer connection and the data channel (if they exist)
   webRTCHandler.closePeerConnection();
});

DOM.sendMessageButton.addEventListener("click", () => {
   const message = DOM.messageInputField.value.trim();
   if(message) {
      // step 1: add the message to the user's UI
      addOutgoingMessageToUi(message);
      // step 2: sending the message to the other peer
      webRTCHandler.sendMessageUsingDataChannel(message);
   };
});