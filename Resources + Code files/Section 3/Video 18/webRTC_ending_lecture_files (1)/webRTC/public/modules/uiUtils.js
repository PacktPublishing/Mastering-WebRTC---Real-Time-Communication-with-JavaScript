import * as state from "./state.js";

// selecting DOM elements
const user_session_id_element = document.getElementById("session_id_display");
const infoModalButton = document.getElementById('info_modal_button');
const infoModalContainer = document.getElementById('info_modal_content_container');
const closeModalButton = document.getElementById('close');
const consoleDisplay = document.getElementById('console_display');
const inputRoomNameElement = document.getElementById('input_room_channel_name');
const joinRoomButton = document.getElementById('join_button');
const createRoomButton = document.getElementById('create_room_button');
const roomNameHeadingTag = document.getElementById('room_name_heading_tag');
const landingPage = document.getElementById('landing_page_container');
const roomInterface = document.getElementById('room_interface');
const messagesContainer = document.getElementById('messages');
const messageInputField = document.getElementById('message_input_field');
const messageInputContainer = document.getElementById('message_input');
const sendMessageButton = document.getElementById('send_message_button');
const destroyRoomButton = document.getElementById('destroy_button');
const exitButton = document.getElementById('exit_button');

// learning purposes
const offerorButtonsContainer = document.getElementById("offeror_process_buttons");
const offerorCreatePcButton = document.getElementById("create_pc");
const offerorAddDataTypeButton = document.getElementById("add_data_type");
const offerorCreateOfferButton = document.getElementById("create_offer");
const offerorUpdateLocalDescriptionButton = document.getElementById("update_local_description");
const offerorSendOfferButton = document.getElementById("send_offer");
const offerorSetRemoteDescriptionButton = document.getElementById("set_remote_description");
const offerorIceButton = document.getElementById("ice_offeror");

const offereeButtonsContainer = document.getElementById("offeree_process_buttons");
const offereeCreatePcButton = document.getElementById("offeree_create_pc");
const offereeAddDataTypeButton = document.getElementById("offeree_add_data_type");
const offereeUpdateRemoteDescriptionButton = document.getElementById("offeree_update_remote_description");
const offereeCreateAnswerButton = document.getElementById("offeree_create_answer");
const offereeUpdateLocalDescriptionButton = document.getElementById("offeree_update_local_description");
const offereeSendAnswerButton = document.getElementById("offeree_send_answer");
const offereeIceButton = document.getElementById("ice_offeree");

// initialize UI events as soon as user enters page
export function initializeUi(userId) {
    user_session_id_element.innerHTML = `Your session id is: ${userId}`;
    state.setUserId(userId);
    // set up modal functionality
    setupModalEvents();
};

function setupModalEvents() {
    infoModalButton.onclick = openModal;
    closeModalButton.onclick = closeModal;

    // close the modal if the user clicks outside of the modal content
    window.onclick = function(event) {
        if(event.target === infoModalContainer) {
            closeModal();
        }
    }
};

// logic for opening a modal
function openModal() {
    infoModalContainer.classList.add("show");
    infoModalContainer.classList.remove("hide");
};

// logic for closing a modal
function closeModal() {
    infoModalContainer.classList.add("hide");
    infoModalContainer.classList.remove("show");
};

// custom logger
export function logToCustomConsole(message, color = "#FFFFFF", highlight = false, highlightColor = "#ffff83") {
    const messageElement = document.createElement("div");
    messageElement.classList.add("console-message");
    messageElement.textContent = message; 
    messageElement.style.color = color;

    if(highlight) {
        messageElement.style.backgroundColor = highlightColor;
        messageElement.style.fontWeight = "bold";
        messageElement.style.padding = '5px'; // Add some padding for better visibility
        messageElement.style.borderRadius = '3px'; // Optional: rounded corners
        messageElement.style.transition = 'background-color 0.5s ease'; // Smooth transition
    };

    // append our newly created div message, to the DOM
    consoleDisplay.appendChild(messageElement);
    consoleDisplay.scrollTop = consoleDisplay.scrollHeight; // scroll to the bottom, automatically
};