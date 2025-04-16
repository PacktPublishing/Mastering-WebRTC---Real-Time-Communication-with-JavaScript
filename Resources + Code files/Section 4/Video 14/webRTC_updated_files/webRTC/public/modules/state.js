// this is a file to keep all states related to our user
let state = {
    userId: null,
    userWebSocketConnection: null,
    roomName: null
};

// generic setter function for our state object
const setState = (newState) => {
    state = {
        ...state,
        ...newState
    }
};

// set the userId
export const setUserId = (userId) => {
    setState({userId});
};

// set the ws object state for the user
export const setWsConnection = (wsConnection) => {
    setState({userWebSocketConnection: wsConnection});
};

// set the roomName 
export const setRoomName = (roomName) => {
    setState({roomName});
}

// reset the state object
export const resetState = () => {
    setState({
        roomName: null
    })
};

// getter for our state object
export const getState = () => {
    return state;
};
