export const myColors = {
    red: "#ff8080",
    green: "#98ff80",
    orange: "#ffcb0f",
    blue: "#5dbcff",
    sendMessageColor: "#b00066",
    receiveMessageColor: "#096900"
};

export const type = {
    ROOM_CREATE: {
        RESPONSE_FAILURE: "CHECK_ROOM_RESPONSE_FAILURE",
        RESPONSE_SUCCESS: "CHECK_ROOM_RESPONSE_SUCCESS", 
    },
    ROOM_DESTROY: {
        RESPONSE_FAILURE: "DESTROY_ROOM_RESPONSE_FAILURE",
        RESPONSE_SUCCESS: "DESTORY_ROOM_RESPONSE_SUCCESS", 
    },
    ROOM_JOIN: {
        RESPONSE_FAILURE: "JOIN_ROOM_RESPONSE_FAILURE",
        RESPONSE_SUCCESS: "JOIN_ROOM_RESPONSE_SUCCESS",
        REQUEST: "JOIN_ROOM_REQUEST",
        NOTIFY: "JOIN_ROOM_NOTIFY" 
    },
    ROOM_EXIT: {
        REQUEST: "EXIT_ROOM_REQUEST",
        NOTIFY: "EXIT_ROOM_NOTIFY" 
    },
    ROOM_DISONNECTION: {
        NOTIFY: "DISCONNECT_ROOM_NOTIFICATION"
    },
    WEB_RTC: {
        OFFER: "OFFER",
        ANSWER: "ANSWER",
        ICE_CANDIDATES: "ICE_CANDIDATES"
    }
};

export const labels = {
    NORMAL_SERVER_PROCESS: "NORMAL_SERVER_PROCESS",
    WEBRTC_PROCESS: "WEBRTC_PROCESS"
};