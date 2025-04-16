import { initializeUi } from "./modules/uiUtils.js";
import * as ws from "./modules/ws.js";

// Generate unique user code for every user that visits the page
const userId = Math.round(Math.random() * 1000000);

// initialize the DOM
initializeUi(userId);

// establish a ws connection
const wsClientConnection = new WebSocket(`/?userId=${userId}`);

// pass all of our websocket logic to another module
ws.registerSocketEvents(wsClientConnection);