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
                    type: constants.type.ROOM_CREATE.RESPONSE_FAILURE,
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
                    type: constants.type.ROOM_CREATE.RESPONSE_SUCCESS
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

        // ternary operator to determine the ID of the other user which we'll use to send and notify the other user that this peer has left the room
        const otherUserId = (room.peer1 === userId) ? room.peer2 : room.peer1;
        // next, define the message to send the other user
        const notificationMessage = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                type: constants.type.ROOM_DISONNECTION.NOTIFY,
                message: `User ${userId} has been disconnected`
            }
        };
        // push the message to the other user
        if(otherUserId) {
            sendWebSocketMessageToUser(otherUserId, notificationMessage);
        };

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
        let message = JSON.parse(data);
        // process message depending on its label type
        switch(message.label) {
            case constants.labels.NORMAL_SERVER_PROCESS:
                console.log("==== normal server message ====");
                normalServerProcessing(message.data);
                break;
            default: 
                console.log("Unknown message label: ", message.label);
        }
    } catch (error) {
        console.log("Failed to parse message:", error);
        return;
    }
};

// >>>> NORMAL SERVER
function normalServerProcessing(data) {
    // process the request, depending on its data type
    switch(data.type) {
        case constants.type.ROOM_JOIN.REQUEST:
            joinRoomHandler(data);
            break;
        case constants.type.ROOM_EXIT.REQUEST:
            exitRoomHandler(data);
            break;
        default: 
            console.log("unknown data type: ", data.type);
    }
};  

function joinRoomHandler(data) {
    const { roomName, userId } = data; // Extract roomName and userId from the request
    // step 1: check if room exists
    const existingRoom = rooms.find(room => room.roomName === roomName);
    let otherUserId = null;

    if(!existingRoom) {
        console.log("A user tried to join, but the room does not exist");
        // send failure message
        const failureMessage = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                type: constants.type.ROOM_JOIN.RESPONSE_FAILURE,
                message: "A room of that name does not exist. Either type another name, or create a room."
            }
        };
        // send a failure response back to the user
        sendWebSocketMessageToUser(userId, failureMessage);
        return; 
    };

    // step 2: check whether the room is full. 
    if(existingRoom.peer1 && existingRoom.peer2) {
        console.log("A user tried to join, but the room is full");
        // send failure message
        const failureMessage = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                type: constants.type.ROOM_JOIN.RESPONSE_FAILURE,
                message: "This room already has two participants."
            }
        };
        sendWebSocketMessageToUser(userId, failureMessage);
        return;
    };

    // step 3: allow user to join a room
    // at this point, if our code executes here, the room is both available and exists
    console.log("A user is attempting to join a room");
    if(!existingRoom.peer1) {
        existingRoom.peer1 = userId;
        otherUserId = existingRoom.peer2;
        console.log(`added user ${userId} as peer1`);
    } else {
        existingRoom.peer2 = userId;
        otherUserId = existingRoom.peer1;
        console.log(`added user ${userId} as peer2`);
    };

    // send success message
    const successMessage = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_JOIN.RESPONSE_SUCCESS,
            message: `you have successfully joined room ${existingRoom.roomName}`,
            creatorId: otherUserId,
            roomName: existingRoom.roomName
        }
    };
    sendWebSocketMessageToUser(userId, successMessage);

    // step 4: notify the other user that a peer has joined a room
    const notificationMessage = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_JOIN.NOTIFY,
            message: `User ${userId} has joined your room`,
            joinUserId: userId
        }
    };
    sendWebSocketMessageToUser(otherUserId, notificationMessage);
    return;
}; // end JOINROOMHANDLER function

// logic to process a user exiting a room 
function exitRoomHandler(data) {
    const { roomName, userId } = data;
    const existingRoom = rooms.find(room => room.roomName === roomName);
    const otherUserId = (existingRoom.peer1 === userId) ? existingRoom.peer2 : existingRoom.peer1;

    if(!existingRoom) {
        console.log(`Room ${roomName} does not exist`);
        return;
    }

    // remove user from room
    if(existingRoom.peer1 === userId) {
        existingRoom.peer1 = null;
        console.log("removed peer1 from the rooms object: ", existingRoom);
    } else {
        existingRoom.peer2 = null; 
        console.log("removed peer2 from the rooms object: ", existingRoom);
    }
    
    // clean up and remove empty rooms
    if(existingRoom.peer1 === null && existingRoom.peer2 === null) {
        const roomIndex = rooms.findIndex(room => {
            return room.roomName === roomName;
        });

        if(roomIndex !== -1) {
            rooms.splice(roomIndex, 1);
            console.log(`Room ${roomName} has been removed as its empty`);
        }
        return;
    }
    // notify the other user that a peer has left a room
    const notificationMessage = {
        label: constants.labels.NORMAL_SERVER_PROCESS,
        data: {
            type: constants.type.ROOM_EXIT.NOTIFY,
            message: `User ${userId} has left the room. Another user can now join.`,
        }
    };
    sendWebSocketMessageToUser(otherUserId, notificationMessage);
    return;
};


// >>>> WEBRTC SERVER



// >>>> WEBSOCKET SERVER GENERIC FUNCTIONS
// send a message to a specific user
function sendWebSocketMessageToUser(sendToUserId, message) {
    const userConnection = connections.find(connObj => connObj.userId === sendToUserId);
    if(userConnection && userConnection.wsConnection) {
        userConnection.wsConnection.send(JSON.stringify(message));
        console.log(`Message sent to ${sendToUserId}`);
    } else {
        console.log(`User ${sendToUserId} not found.`);
    };
};

// ################################# SPIN UP SERVER

server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
})
