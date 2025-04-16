class ChatApp {
    constructor() {
        // DOM elements (như @Autowired)
        this.homePage = document.querySelector('#home-page');
        this.chatPage = document.querySelector('#chat-page');
        this.usernameInput = document.querySelector('#username');
        this.loadConversationsBtn = document.querySelector('#load-conversations');
        this.newChatBtn = document.querySelector('#new-chat');
        this.conversationsList = document.querySelector('#conversations');
        this.errorMessage = document.querySelector('#error-message');
        this.otherUserSpan = document.querySelector('#other-user');
        this.backBtn = document.querySelector('#back');
        this.messageForm = document.querySelector('#message-form');
        this.messageInput = document.querySelector('#message');
        this.fileInput = document.querySelector('#file');
        this.sendMessageBtn = document.querySelector('#send-message');
        this.messages = document.querySelector('#messages');
        this.connecting = document.querySelector('.connecting');

        // State (như private fields)
        this.username = null;
        this.conversationId = null;
        this.otherUser = null;
        this.stompClient = null;

        // Bind events (như @EventListener)
        this.loadConversationsBtn.addEventListener('click', () => this.loadConversations());
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        this.backBtn.addEventListener('click', () => this.back());
        this.messageForm.addEventListener('submit', (e) => this.sendMessage(e));
    }

    // Xử lý lỗi (như @ExceptionHandler)
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }

    // Hiển thị tin nhắn (như toString của Message)
    showMessage(message) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${message.sender}</strong>: ${message.content || ''}`;
        if (message.fileUrl) {
            li.innerHTML += `<br><a href="${message.fileUrl}" target="_blank">Show File</a>`;
        }
        this.messages.appendChild(li);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    // Load conversations (như @GetMapping("/conversation/{userId}"))
    async loadConversations() {
        this.username = this.usernameInput.value.trim();
        if (!this.username) {
            this.showError('Username is required');
            return;
        }

        try {
            const response = await fetch(`/conversation/${this.username}`);
            if (!response.ok) {
                throw new Error('Cannot load conversations');
            }
            const conversations = await response.json();
            this.conversationsList.innerHTML = '';
            conversations.forEach(conv => {
                const otherUser = conv.userId1 === this.username ? conv.userId2 : conv.userId1;
                const li = document.createElement('li');
                li.textContent = `Chat with ${otherUser}`;
                li.addEventListener('click', () => this.openChat(conv.id, otherUser));
                this.conversationsList.appendChild(li);
            });
            document.querySelector('#conversation-list').classList.remove('hidden');
            this.hideError();
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Tạo conversation mới (như @PostMapping("/conversation/{userId1}/{userId2}"))
    async startNewChat() {
        const otherUser = prompt('Enter other user ID:');
        if (!otherUser || !otherUser.trim()) {
            this.showError('Other user ID is required');
            return;
        }

        try {
            const response = await fetch(`/conversation/${this.username}/${otherUser.trim()}`, {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('Cannot start new chat');
            }
            const conv = await response.json();
            this.openChat(conv.id, otherUser.trim());
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Mở chat (như @GetMapping("/chat/{conversationId}"))
    async openChat(conversationId, otherUser) {
        this.conversationId = conversationId;
        this.otherUser = otherUser;

        // Chuyển màn hình (như return "chat.html")
        this.otherUserSpan.textContent = otherUser;
        this.messages.innerHTML = '';

        try {
            // Kết nối STOMP (như @Autowired SimpMessagingTemplate)
            const socket = new SockJS('/ws');
            this.stompClient = Stomp.over(socket);
            await new Promise((resolve, reject) => {
                this.stompClient.connect({}, () => {
                    this.stompClient.subscribe(`/topic/private/${conversationId}`, (payload) => {
                        const message = JSON.parse(payload.body);
                        this.showMessage(message);
                    });
                    this.connecting.classList.add('hidden');
                    resolve();
                }, () => reject(new Error('Cannot connect to chat')));
            });

            // Tải tin nhắn cũ (như repository.findAll())
            const response = await fetch(`/conversation/${conversationId}/messages?page=0&size=10`);
            if (!response.ok) {
                throw new Error('Cannot load messages');
            }
            const messages = await response.json();
            messages.forEach(message => this.showMessage(message));
        } catch (error) {
            this.showError(error.message);
            this.back();
        }
    }

    // Gửi tin nhắn hoặc file (như @MessageMapping + @PostMapping("/file/upload"))
    async sendMessage(event) {
        event.preventDefault();
        const content = this.messageInput.value.trim();
        const file = this.fileInput.files[0];
        if (!content && !file) {
            return;
        }
        if (!this.stompClient) {
            this.showError('Not connected to chat');
            return;
        }

        const message = {
            sender: this.username,
            type: 'CHAT'
        };

        try {
            // Upload file nếu có
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch('/file/upload', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    throw new Error('Cannot upload file');
                }
                const data = await response.json();
                message.fileUrl = data.url;
            }

            // Thêm content nếu có
            if (content) {
                message.content = content;
            }

            // Gửi qua STOMP
            this.stompClient.send(`/app/chat/private/${this.conversationId}`, {}, JSON.stringify(message));
            this.messageInput.value = '';
            this.fileInput.value = '';
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Quay lại (như @DeleteMapping hoặc redirect)
    back() {
        if (this.stompClient) {
            this.stompClient.disconnect();
            this.stompClient = null;
        }
        this.chatPage.classList.add('hidden');
        this.homePage.classList.remove('hidden');
        this.messages.innerHTML = '';
        this.hideError();
    }
}

// Khởi tạo (như @PostConstruct)
new ChatApp();