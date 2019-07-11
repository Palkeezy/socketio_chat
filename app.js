const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const http = require('http');
const path = require('path');

const ChatModel = require('./models/Chat');
const MessageModel = require('./models/Message');

mongoose.connect('mongodb://localhost:27017/socketchat', {useNewUrlParser: true});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const sessionMiddleware = session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

app.get('/', (req, res, next) => {
    res.render('index');
});

app.get('/chats', async (req, res, next) => {
    const chats = await ChatModel.find();
    res.render('chats', {
        chats: chats,
        user: req.session.user
    });

});

app.get('/conversations/:id', async (req, res, next) => {
    const id = req.params.id;
    const chat = await ChatModel.findById(id);
    req.session.chat = chat;
    res.render('conversations', {
        chat: chat
    });
});

app.post('/login', (req, res, next) => {
    req.session.user = req.body;
    res.redirect('/chats');
});

app.post('/create-chat', async (req, res, next) => {
    await ChatModel.create(req.body);
    res.redirect('/chats');
});


const server = http.createServer(app);

const io = require('socket.io')(server);

io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connect', async function (socket) {
    console.log(socket.id, 'connected');

    const user = socket.request.session.user;
    const chat = socket.request.session.chat;

    socket.join(chat._id);

    io.to(socket.id).emit('loadChat', await MessageModel.find({chat: chat._id}));

    socket.on('message', async function (data) {
        const text = data.text;
        const date = new Date();

        const message = await MessageModel.create({
            text: text,
            date: date.toLocaleString(),
            author: user.name,
            chat: chat._id
        });

        io.to(chat._id).emit('message', message);

    });

    socket.on('disconnect', function () {
        console.log(socket.id, 'disconnected');
    })
});


server.listen(3000, () => {
    console.log('listening on port 3000');
});
