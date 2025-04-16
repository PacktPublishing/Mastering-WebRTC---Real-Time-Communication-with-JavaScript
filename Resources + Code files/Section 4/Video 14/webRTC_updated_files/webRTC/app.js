// import modules
import http from "http"; // native module
import express from "express";
import { WebSocketServer } from "ws";
import * as constants from "./constants.js";

// define global variables
const connections = [
    // will contain objects containing {ws_connection, userId}
];

// define state for our rooms
const rooms = [
    // will contain objects containing {roomName, peer1, peer2}
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

// room creation via a POST request
app.post('/create-room', (req, res) => {
    // parse the body of the incoming request
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    })
    req.on("end", () => {
        // extract variables from our body
        const { roomName, userId } = JSON.parse(body);
        // check if room already exists
        const existingRoom = rooms.find(room => {
            return room.roomName === roomName;
        });
        if(existingRoom) {
            // a room of this name exists, and we need to send a failure message back to the client
            const failureMessage = {
                data: {
                    type: constants.type.ROOM_CHECK.RESPONSE_FAILURE,
                    message: "That room has already been created. Try another name, or join."
                }
            };
            res.status(400).json(failureMessage);
        } else {
            // the room does not already exist, so we have to add it to the rooms array
            rooms.push({
                roomName, 
                peer1: userId,
                peer2: null
            });
            console.log("Room created. Updated rooms array: ", rooms);
            // send a success message back to the client
            const successMessage = {
                data: {
                    type: constants.type.ROOM_CHECK.RESPONSE_SUCCESS
                }
            };
            res.status(200).json(successMessage);
        }
    });

}); // end CREATE ROOM

// destrying a room via a POST request
app.post('/destroy-room', (req, res) => {
    // parse the body of the incoming request
    let body = "";
    req.on("data", chunk => {
        body += chunk.toString();
    })
    req.on("end", () => {
        // extract variables from our body
        const { roomName } = JSON.parse(body);
        // check if room already exists
        const existingRoomIndex = rooms.findIndex(room => {
            return room.roomName === roomName;
        });
        if(existingRoomIndex !== -1) {
            // a room of this name exists, and we can remove it
            rooms.splice(existingRoomIndex, 1);
            console.log('Peer1 (in this case also the creator) has left the room before anyone else has joined, and room has been removed from db.');
            const successMessage = {
                data: {
                    type: constants.type.ROOM_DESTROY.RESPONSE_SUCCESS,
                    message: "Room has been removed from the server."
                }
            };
            return res.status(200).json(successMessage);
        } else {
            const failureMessage = {
                data: {
                    type: constants.type.ROOM_DESTROY.RESPONSE_FAILURE,
                    message: "Server failed to find the room in the rooms array."
                }
            };
            return res.status(400).json(failureMessage);
        }
    });

}); // end DESTROYING ROOM

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

    // removing rooms
    rooms.forEach(room => {
        // remove the user from the room
        if(room.peer1 === userId) {
            room.peer1 = null;
        } 
        if(room.peer2 === userId) {
            room.peer2 = null;
        }
        // clean up empty rooms
        if(room.peer1 === null && room.peer2 === null) {
            const roomIndex = rooms.findIndex(roomInArray => {
                return roomInArray.roomName === room.roomName;
            });

            if(roomIndex !== -1) {
                rooms.splice(roomIndex, 1);
                console.log(`Room ${room.roomName} has been removed as its empty`);
            }
        }
    });
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
