// this is a file to keep all states related to our user
let state = {
    userId: null,
    userWebSocketConnection: null,
    roomName: null,
    otherUserId: null,
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

// set the other user's id
export const setOtherUserId = (otherUserId) => {
    setState({otherUserId})
}

// reset the state object
export const resetState = () => {
    setState({
        roomName: null,
        otherUserId: null,
    })
};

// getter for our state object
export const getState = () => {
    return state;
};
