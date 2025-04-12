'use strict';

var roomPage = document.querySelector('#room-page');
var chatPage = document.querySelector('#chat-page');
var roomForm = document.querySelector('#roomForm');
var joinRoomButton = document.querySelector('#joinRoom');
var createRoomButton = document.querySelector('#createRoom');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var errorMessage = document.querySelector('#errorMessage');

var stompClient = null;
var roomId = null;
var username = null;
function connectToRoom(event) {
    username = document.querySelector('#username').value.trim();
    roomId = document.querySelector("#roomId").value.trim();

    if (username) {
        roomPage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            // Fetch old messages first
            fetchOldMessages().then(() => {
                // After fetching old messages, connect to WebSocket
                onConnected();
            });
        }, onError);
    }
    event.preventDefault();
}

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe(`/topic/room/${roomId}`, onMessageReceived);

    // Tell your username to the server
    stompClient.send(`/app/chat/addUserRoom/${roomId}`,
        {},
        JSON.stringify({
            sender: username,
            content: null,
            messageTime: null,
            type: 'JOIN'
        })
    )

    connectingElement.classList.add('hidden');
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function joinRoom() {
    roomId = document.querySelector('#roomId').value.trim();
    if (!roomId) {
        errorMessage.textContent = 'Room ID cannot be empty!';
        errorMessage.classList.remove('hidden');
        return;
    }

    fetch(`/rooms/${roomId}`)
        .then(response => {
            if (response.ok) {
                connectToRoom(roomId);
            } else {
                errorMessage.textContent = 'Room not found!';
                errorMessage.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again!';
            errorMessage.classList.remove('hidden');
        });
}

function createRoom() {
    roomId = document.querySelector('#roomId').value.trim();
    if (!roomId) {
        errorMessage.textContent = 'Room ID cannot be empty!';
        errorMessage.classList.remove('hidden');
        return;
    }

    fetch(`/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: roomId
    })
        .then(response => {
            if (response.ok) {
                connectToRoom(roomId);
            } else {
                errorMessage.textContent = 'Room already exists!';
                errorMessage.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again!';
            errorMessage.classList.remove('hidden');
        });
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };
        stompClient.send(`/app/chat/sendMessage/${roomId}`, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function fetchOldMessages() {
    return fetch(`/rooms/${roomId}/messages?page=0&size=20`)
        .then(response => response.json())
        .then(messages => {
            console.log("Fetched messages: ", messages)
            messages.forEach(message => {
                var messageElement = document.createElement('li');
                messageElement.classList.add('chat-message');

                var usernameElement = document.createElement('span');
                var usernameText = document.createTextNode(message.sender);
                usernameElement.appendChild(usernameText);
                messageElement.appendChild(usernameElement);

                var textElement = document.createElement('p');
                var messageText = document.createTextNode(message.content);
                textElement.appendChild(messageText);

                var timeElement = document.createElement('span');
                var timeText = document.createTextNode(new Date(message.timeStamp).toLocaleString());
                timeElement.classList.add('message-time');
                timeElement.appendChild(timeText);

                messageElement.appendChild(textElement);
                messageElement.appendChild(timeElement);
                messageArea.appendChild(messageElement);
            });
            messageArea.scrollTop = messageArea.scrollHeight;
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
        });
}

function onMessageReceived(payload) {
    console.log("Received payload:", payload.body); // Log để kiểm tra dữ liệu
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if (message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined the room!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left the room!';
    } else {
        messageElement.classList.add('chat-message');

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

joinRoomButton.addEventListener('click', joinRoom);
createRoomButton.addEventListener('click', createRoom);
messageForm.addEventListener('submit', sendMessage);