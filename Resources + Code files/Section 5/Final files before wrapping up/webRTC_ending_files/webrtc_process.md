# WebRTC Connection Setup Task List
*Skill Level:* Intermediate - Advanced

This document outlines the steps required to establish a WebRTC connection between two clients (PEER1 and PEER2) using signaling via a Node.js WebSocket server.

## Stage 1: 🙍‍♂️ PEER1 Sets Up WebRTC and Sends Offer
- **Role**: You can refer to PEER1 as the Initiator/Caller/Offeror. These steps involve the user and their browser preparing to establish a WebRTC connection.

### 1. Configure STUN (or TURN if applicable) Servers
- **Note**: The `RTCPeerConnection` requires STUN servers for NAT traversal in real-world applications. You do this by specifing configuration options for your RTCPeerConnection.
- **Purpose**: ICE candidates will be needed to help PEER2 locate PEER1.
- **Remember 💡**: An `ICE Candidate` is just a fancy word for a "possible route to your browser window".

### 2. Create RTCPeerConnection
- **Action**: PEER1 creates an instance of `RTCPeerConnection` on their browser. This instance is necessary to generate the offer that will be sent to PEER2 via the signaling server. 
- **Details**: Not only do we create an instance of the `RTCPeerConnection' object, but we also need to register event listeners
- **Remember 💡**: The `RTCPeerConnection` manages the entire connection between PEER1 and PEER2.

### 3. Define Data to Send/Receive
- **Action**: PEER1 must determine what data it will allow to be sent and received (e.g., PEER1 will call `getUserMedia()` if PEER1 wants to send/receive video and audio). In our project, we will use our peer connection to create a Data Channel by calling `pc.createDataChannel()`

### 4. Add Data to the RTCPeerConnection
- **Action**: PEER1 adds the data (a data channel in our case, but could also be a video stream and audio track) to its `RTCPeerConnection`.
- **Purpose**: This action associates PEER1's data with their `RTCPeerConnection`.
- **Important ❗**: Your application has not yet started to gather ICE candidates. In our project, by calling `pc.createDataChannel()`, this step has been done automatically

### 5. PEER1 Creates an Offer
- **Action**: PEER1 creates an offer using its `RTCPeerConnection` that has our data channel.
- **Details**:
  - The offer is of type `RTCSessionDescription`, which contains two parts:
    - **SDP**: Contains information about the data to be exchanged (here a simple data channel).
    - **Type**: Designated as "offer" indicating that PEER1 initiated the WebRTC connection.

### 6. Set Local Description
- **Action**: Offer is floating in space. So PEER1 assigns the generated offer to the `RTCPeerConnection` using the `setLocalDescription()` method.

### 7. Collect ICE Candidates 
- **Note**: When `setLocalDescription()` is executed, your browser will start to gather ICE candidates and will return them to PEER1, asynchronously.

### 8. PEER1 Sends "Offer" to Signaling Server
- **Action**: PEER1 sends the offer to our ws signaling server. 
- **Details**:
  - Our signaling server will forward the offer to PEER2.
  - The offer must be associated with PEER1.

### 9. PEER1 Sends ICE Candidates to Signaling Server
- **Action**: Once ICE candidates become available, PEER1 sends them to signaling server.
- **Details**:
  - The signaling server will relay these ICE candidates (routes) to PEER2.
  - Each ICE candidate will be associated with PEER1.
  - **Important ❗**: For learning purposes, I've created buttons and we will only send ice candidates at the end, after PEER1 has recevied an answer from PEER2. However, in the real world they will be sent on a "trickle" basis.

## Stage 2: 📶📶📶 Signaling Server
Our WebSocket signaling server is now used to facilitate communication between both peers.
### 10. Signaling Server sends Offer to PEER2

## Stage 3: 👨‍🦰 PEER2 sets up WebRTC and Sends Answer
- **Role**: You can refer to PEER2 as the Calleee/Offeree.

### 11. PEER2 Loads Webpage
- **Action**: PEER2 loads the webpage and establishes a WebSocket connection with our signaling server, triggering a "connection" event. 
- **Purpose**: To establish a connection with our WebSocket signaling server.

### 12. PEER2 Receives Offer
- **Action**: PEER2 receives the RTCSessionDescription (offer) pushed to it by our signaling server.

### 13. Configure STUN Servers
- **Note**: PEER2's `RTCPeerConnection` requires STUN servers for NAT traversal in real-world applications.
- **Purpose**: ICE candidates are needed to help PEER1 locate PEER2.

### 14. Create RTCPeerConnection
- **Action**: PEER2 creates their own instance of the `RTCPeerConnection`. This instance is necessary for generating an `answer` that our signaling server can send back to PEER1.

### 15. Decides on the Data for Sending and Receiving
- **Action**: PEER2 must also decide what data it wishes to send and receive. 
  - **Important ❗**: In a WebRTC connection, each peer can independently decide what types of data to send and receive.

### 16. Add data types to RTCPeerConnection
- **Action**: PEER2 registers a listener for the data channel (or adds media tracks if you're using video/audio calls) to its `RTCPeerConnection`.
- **Purpose**: This action associates PEER2's media data with the `RTCPeerConnection`.

### 17. Set Remote Description
- **Action**: After receiving the offer, PEER2 can set the remote description via the `RTCPeerConnection.setRemoteDescription()` method.
- **Details**:
  - The `setRemoteDescription()` method informs the WebRTC connection (managed by the `RTCPeerConnection` interface) about the configuration proposed by the other peer (in this case, PEER1)
  - Without this information, PEER2 would not know the data type proposed by PEER2

### 18. PEER2 Creates an Answer
- **Action**: PEER2 creates an answer using `createAnswer()`.
- **Details**:
  - The answer is of type `RTCSessionDescription`, which contains two parts:
    - **SDP**: Contains information about the data it will allow to be exchanged.
    - **Type**: Designated as "answer," indicating that this description responds to an offer.

### 19. Set Local Description
- **Action**: PEER2 assigns the generated answer to the `RTCPeerConnection` using the `setLocalDescription()` method, indicating that it is preparing a local answer.

### 20. Collect ICE Candidates
- **Note**: When `setLocalDescription()` is executed by PEER2, ICE candidates will be automatically generated and returned to PEER2 asynchronously. For our project, we are pushing all ice candidates into an array.

### 21. PEER2 Sends "Answer" to signaling Server
- **Action**: PEER2 sends the answer (of type `RTCSessionDescription`) to the signaling server.
- **Details**:
  - Our signaling server must then relay this answer back to PEER1.

### 22. PEER2 Sends ICE Candidates to Signaling Server
- **Action**: Once ICE candidates become available, PEER2 sends them to signaling server.
- **Details**:
  - The signaling server will relay these ICE candidates (routes) to PEER1.
  - Each ICE candidate will be associated with PEER2.
  - **Important ❗**: For learning purposes, I've created buttons and we will only send ice candidates immediately after PEER2 has generated and sent its answer. However, in the real world they will be sent on a trickle basis.

## Stage 4: 📶📶📶 Signaling Server
### 23. Signaling Server sends Answer (and ice candidates) to PEER1

## Stage 5: 🙍‍♂️ PEER1 Receives Answer

### 24. Peer1 receives the answer and ice candidates
- **Action**: PEER1 receives an answer from the signaling server, and pushes ice candidates into a temp buffer.

### 25. Peer1 sends ICE Candidates to signaling server
- **Action**: PEER1 sends all of its ice candidates back to PEER2 via the signaling server. 
- **Details**:
  - The signaling server will relay these candidates (routes) back to PEER2. In real life this will happen asynchronously.

### 26. Peer1 Sets Remote Description
- **Action**: PEER1 has to now register the WebRTC "answer" from PEER2 with its own instance of `RTCPeerConnection` by calling `setRemoteDescription()`.

## Final Comments

### Listening for ICE Candidates
- **Note**:
  - After each peer has successfully exchanged `RTCSessionDescription` control messages, they must wait for the arrival of ICE candidates.
  - Neither peer can send data until they have received relevant ICE candidates from each other
  - For the iceconnectionstatechange to be in the "connected" state, the local and remote session descriptions needs to be fully completed
  - It is possible for PEER1 to fire the "connected" event before PEER2, and visa versa. 
  - However, for PEER1 to send data over a data channel, the 'onopen' event needs to fire first. 
  - BOTTOM LINE: Once both peers have exchanged ICE candidates, they can establish a fully functional connection and begin sending/receiving data in compliance with their `RTCPeerConnection`.

### Conclusion
- **Summary**:
  - At this point, both peers have completed all necessary setup steps, including exchanging offers, answers, and ICE candidates.
  - A successful WebRTC connection has been established, enabling real-time communication between PEER1 and PEER2!
  - CELEBRATE 🥤