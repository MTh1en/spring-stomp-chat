'use strict';

var privatePage = document.querySelector('#private-page');
var chatPage = document.querySelector('#chat-page');
var privateForm = document.querySelector('#privateForm');
var loadConversationsButton = document.querySelector('#loadConversations');
var startNewChatButton = document.querySelector('#startNewChat');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var errorMessage = document.querySelector('#errorMessage');
var conversationsList = document.querySelector('#conversations');
var otherUserSpan = document.querySelector('#otherUser');
var backToListButton = document.querySelector('#backToList');

var stompClient = null;
var conversationId = null;
var username = null;
var otherUserId = null;

function loadConversations(event) {
    username = document.querySelector('#username').value.trim();

    if (username) {
        fetch(`/conversation/${username}`)
            .then(response => response.json())
            .then(conversations => {
                conversationsList.innerHTML = '';
                conversations.forEach(conversation => {
                    var li = document.createElement('li');
                    li.textContent = `Chat with ${conversation.userId2}`;
                    li.dataset.conversationId = conversation.id;
                    li.classList.add('conversation-item');
                    li.addEventListener('click', () => connectToExistingConversation(conversation.id, conversation.otherUser));
                    conversationsList.appendChild(li);
                });
                document.querySelector('#conversationList').classList.remove('hidden');
            })
            .catch(error => {
                errorMessage.textContent = 'Failed to load conversations. Please try again!';
                errorMessage.classList.remove('hidden');
            });
    } else {
        errorMessage.textContent = 'Username cannot be empty!';
        errorMessage.classList.remove('hidden');
    }
    event.preventDefault();
}

function connectToExistingConversation(id, otherUser) {
    // Gán ID cuộc hội thoại và thông tin người dùng khác
    conversationId = id;
    otherUserId = otherUser;

    // Chuyển sang màn hình chat
    privatePage.classList.add('hidden');
    chatPage.classList.remove('hidden');
    otherUserSpan.textContent = otherUser || "Unknown";

    // Kết nối WebSocket
    var socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        // Tải lịch sử tin nhắn sau khi kết nối thành công
        fetchOldMessages();
        onConnected();
    }, onError);
}

function startNewChat(event) {
    var otherUserInput = prompt('Enter the User ID to chat with:');
    if (otherUserInput) {
        otherUserId = otherUserInput.trim();
        connectToConversation(event);
    }
}

function connectToConversation(event) {
    if (username && otherUserId) {
        fetch(`/conversation/${username}/${otherUserId}`, { method: 'POST' })
            .then(response => response.json())
            .then(conversation => {
                conversationId = conversation.id;
                privatePage.classList.add('hidden');
                chatPage.classList.remove('hidden');
                otherUserSpan.textContent = otherUserId;

                var socket = new SockJS('/ws');
                stompClient = Stomp.over(socket);

                stompClient.connect({}, () => {
                    fetchOldMessages();
                    onConnected();
                }, onError);
            })
            .catch(error => {
                errorMessage.textContent = 'Failed to start conversation. Please try again!';
                errorMessage.classList.remove('hidden');
            });
    } else {
        errorMessage.textContent = 'Username and Other User ID cannot be empty!';
        errorMessage.classList.remove('hidden');
    }
    event.preventDefault();
}

function onConnected() {
    stompClient.subscribe(`/topic/private/${conversationId}`, onMessageReceived);
    connectingElement.classList.add('hidden');
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };
        stompClient.send(`/app/chat/private/${conversationId}`, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function fetchOldMessages() {
    // Gửi yêu cầu lấy lịch sử tin nhắn
    fetch(`/conversation/${conversationId}/messages?page=0&size=20`)
        .then(response => response.json())
        .then(messages => {
            // Xóa nội dung cũ trong khu vực tin nhắn
            messageArea.innerHTML = '';

            // Hiển thị từng tin nhắn trong lịch sử
            messages.forEach(message => {
                var messageElement = document.createElement('li');
                messageElement.classList.add('chat-message');

                var usernameElement = document.createElement('span');
                usernameElement.textContent = message.sender;
                messageElement.appendChild(usernameElement);

                var textElement = document.createElement('p');
                textElement.textContent = message.content;
                messageElement.appendChild(textElement);

                messageArea.appendChild(messageElement);
            });

            // Cuộn xuống cuối khu vực tin nhắn
            messageArea.scrollTop = messageArea.scrollHeight;
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            errorMessage.textContent = 'Failed to load messages. Please try again!';
            errorMessage.classList.remove('hidden');
        });
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');
    messageElement.classList.add('chat-message');

    var usernameElement = document.createElement('span');
    usernameElement.textContent = message.sender;
    messageElement.appendChild(usernameElement);

    var textElement = document.createElement('p');
    textElement.textContent = message.content;
    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function backToList() {
    if (stompClient) {
        stompClient.disconnect();
    }
    chatPage.classList.add('hidden');
    privatePage.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    messageArea.innerHTML = '';
}

loadConversationsButton.addEventListener('click', loadConversations);
startNewChatButton.addEventListener('click', startNewChat);
messageForm.addEventListener('submit', sendMessage);
backToListButton.addEventListener('click', backToList);