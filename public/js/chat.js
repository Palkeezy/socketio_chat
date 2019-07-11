const socket = io();

const messageBtn = document.getElementById('message-btn');
const messagesDiv = document.getElementById('messages');


messageBtn.onclick = function () {
    const messageInput = document.getElementById('message-input');
    const inputValue = messageInput.value;

    messageInput.innerText = '';

    socket.emit('message', {text: inputValue})
};


socket.on('message', function (message) {
    showMessage(message);
});

socket.on('loadChat', function (messages) {
    for (const message of messages) {
        showMessage(message);
    }
});

function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerText = `${message.date} ${message.author}: ${message.text}`;
    messagesDiv.appendChild(messageDiv);
}
