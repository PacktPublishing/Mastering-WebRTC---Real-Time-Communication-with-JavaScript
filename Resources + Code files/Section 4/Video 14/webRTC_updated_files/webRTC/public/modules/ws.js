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

function handleMessage(message) {
    console.log(message);
    // more later
};

function handleClose() {
    uiUtils.logToCustomConsole("You have been disconnected from our ws server", null, true, constants.myColors.red);
};

function handleError() {
    uiUtils.logToCustomConsole("An error was thrown",constants.myColors.red);
};