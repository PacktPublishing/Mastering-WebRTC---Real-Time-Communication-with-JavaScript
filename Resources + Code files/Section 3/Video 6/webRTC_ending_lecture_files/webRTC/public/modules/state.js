// this is a file to keep all states related to our user
let state = {
    userId: null
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