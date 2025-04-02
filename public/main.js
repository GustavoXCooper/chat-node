const socket = io();
let username = '';
let userList = [];
let serverUsers = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');
let warning = document.querySelector('.warning');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

const addMessage = (type, user, msg) => {
    let ul = document.querySelector('.chatList');

    switch (type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${msg}</li>`;
            break;
        case 'msg':
            if (username == user) {
                ul.innerHTML += `<li class="m-txt"><span class="me">${user}</span>${msg}</li>`;
            } else {
                ul.innerHTML += `<li class="m-txt"><span>${user}</span>${msg}</li>`;
            }
            break;
    }

    ul.scrollTop = ul.scrollHeight;
}

const renderUserList = () => {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';

    userList.forEach(user => {
        ul.innerHTML += `<li>${user}</li>`;
    });
}

loginInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let name = loginInput.value.trim();
        if (validateUsername(name)) {
            username = name;
            document.title = 'Chat (' + username + ')';
            socket.emit('join-request', username);
        } else {
            warning.style.display = 'flex';
            warning.innerHTML = 'Nome de usuáro inválido.';
        }
    }
});

textInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        let txt = textInput.value.trim();
        textInput.value = '';

        if (txt != '') {
            addMessage('msg', username, txt);
            socket.emit('send-msg', txt);
        }
    }
});

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conetado!');

    userList = list;
    renderUserList();
});

socket.on('list-update', (data) => {
    if (data.joined) {
        addMessage('status', null, data.joined + ' entrou no chat');
    }

    if (data.left) {
        addMessage('status', null, data.left + ' saiu do chat');
    }
    console.log('userList: ', userList);
    userList = data.list;
    renderUserList();
});

socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado');
    userList = [];
    renderUserList();
});

socket.on('connect_error', () => {
    addMessage('status', null, 'Tentando reconectar');
});

socket.on('connect', () => {
    socket.emit('server-user-list');
    if (validateUsername(username)) {
        socket.emit('join-request', username);
    };
});

socket.on('update-client-list', async (connectedUsers) => {
    serverUsers = connectedUsers;
})

const validateUsername = (username) => {
    const users = serverUsers;
    if (users.includes(username) || username == '') {
        return false;
    }
    return true;
}