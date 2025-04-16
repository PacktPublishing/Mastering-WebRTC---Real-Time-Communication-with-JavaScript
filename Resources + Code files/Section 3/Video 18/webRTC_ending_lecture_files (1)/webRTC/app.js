// import modules
import http from "http"; // native module
import express from "express";
import { WebSocketServer } from "ws";
import { connect } from "http2";

// define global variables
const connections = [
    // will contain objects containing {ws_connection, userId}
];

// define a port for live and testing environments
const PORT = process.env.PORT || 8080;

// initilize the express application
const app = express();
app.use(express.static("public"));

// create an HTTP server, and pass our express application into our server
const server = http.createServer(app);

// server static html file
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html");
});

// ################################# WEBSOCKET SERVER SETUP
// mount our ws server onto our http server
const wss = new WebSocketServer({server});

// define a function thats called when a new connection is established
wss.on("connection", (ws, req) => handleConnection(ws, req));

function handleConnection(ws, req) {
    const userId = extractUserId(req);
    console.log(`User: ${userId} connected to WS server`);
    // update our connections array
    addConnection(ws, userId);

    // register all 3 event listeners
    ws.on("message", (data) => handleMessage(data));
    ws.on("close", () => handleDisconnection(userId));
    ws.on("error", () => console.log(`A WS error has occurred`));
};

function addConnection(ws, userId) {
    connections.push({
        wsConnection: ws, 
        userId
    });
    console.log("Total connected users: " + connections.length);
};

function extractUserId(req) {
    const queryParam = new URLSearchParams(req.url.split('?')[1]);
    return Number(queryParam.get("userId"));
};

function handleDisconnection(userId) {
    // Find the index of the connection associated with the user ID
    const connectionIndex = connections.findIndex(conn => conn.userId === userId);
    // If the user ID is not found in the connections array, log an error message and exit the function
    if(connectionIndex === -1) {
        console.log(`User: ${userId} not found in connections`);
        return; 
    };
    // Remove the user's connection from the active connections array
    connections.splice(connectionIndex, 1);
    // provide feedback
    console.log(`User: ${userId} removed from connections`);
    console.log(`Total connected users: ${connections.length}`);
};

function handleMessage(data) {
    try {
        // come back to this later
    } catch (error) {
        console.log("Failed to parse message:", error);
        return;
    }
};

// ################################# SPIN UP SERVER

server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
})
