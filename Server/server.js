const net = require('net');
const commands = require('../Common/commandTypes');
const responseStatus = require('../Common/responseStatus');
const UserService = require('../Server/userService');
const helpers = require('../Common/helpers');

class Program {
    port = 1337;
    address = "127.0.0.1";
    server;
    userService = new UserService();

    Main = () => {
        this.server = net.createServer().listen(this.port, this.address);
        this.server.on('connection', this.OnClientConnection);
    };

    OnClientConnection = (socket) => {
        console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
        socket.on('data', (data) => this.OnDataReceived(socket, data));
        socket.on('close', () => this.userService.LogoutAccount(socket));
    };

    OnDataReceived = (socket, data) => {
        console.log(`Request from Client: ${socket.remoteAddress}:${socket.remotePort}: `, data);
        let { command, nonce, payload } = helpers.DecodeMessage(data);

        switch (command) {
            case commands.REGISTER:
                this.RegisterAccount(socket, nonce, payload);
                break;
            case commands.LOGIN:
                this.LoginAccount(socket, nonce, payload);
                break;
            case commands.LOGOUT:
                this.LogoutAccount(socket, nonce);
                break;
            case commands.WHISPER:
                this.WhisperToAnotherUser(socket, nonce, payload);
                break;
            case commands.SUBSCRIBE:
                this.SubscribeToGroupchat(socket, nonce, payload);
                break;
            case commands.UNSUBSCRIBE:
                this.UnsubscribeToGroupchat(socket, nonce, payload);
                break;
            case commands.GROUPCHAT:
                this.ChatToGroup(socket, nonce, payload);
                break;
            default:
                break;
        }
    };

    RegisterAccount = (socket, nonce, payload) => {
        let request = payload.split('/');
        if (request.length == 2) {
            let result = this.userService.RegisterAccount(request[0], request[1]);
            if (result == true)
                socket.write(helpers.EncodeMessage(commands.REGISTER, nonce, '', responseStatus.SUCCESS));
            else socket.write(helpers.EncodeMessage(commands.REGISTER, nonce, result, responseStatus.FAILED));
        }
    };

    LoginAccount = (socket, nonce, payload) => {
        let request = payload.split('/');
        if (request.length == 2) {
            let result = this.userService.LoginAccount(socket, request[0], request[1]);
            if (result == true)
                socket.write(helpers.EncodeMessage(commands.LOGIN, nonce, '', responseStatus.SUCCESS));
            else socket.write(helpers.EncodeMessage(commands.LOGIN, nonce, result, responseStatus.FAILED));
        }
    };

    LogoutAccount = (socket, nonce) => {
        let result = this.userService.LogoutAccount(socket);
        if (result == true)
            socket.write(helpers.EncodeMessage(commands.LOGOUT, nonce, '', responseStatus.SUCCESS));
        else socket.write(helpers.EncodeMessage(commands.LOGOUT, nonce, result, responseStatus.FAILED));
    };

    WhisperToAnotherUser = (socket, nonce, payload) => {
        let request = payload.split('/');
        if (request.length == 2) {
            let result = this.userService.WhisperToAnotherUser(socket, nonce, request);
            if (result == true)
                socket.write(helpers.EncodeMessage(commands.WHISPER, nonce, '', responseStatus.SUCCESS));
            else socket.write(helpers.EncodeMessage(commands.WHISPER, nonce, result, responseStatus.FAILED));
        }
    };

    SubscribeToGroupchat = (socket, nonce, payload) => {
        let result = this.userService.SubscribeToGroupchat(socket, payload);
        if (result == true)
            socket.write(helpers.EncodeMessage(commands.SUBSCRIBE, nonce, '', responseStatus.SUCCESS));
        else socket.write(helpers.EncodeMessage(commands.SUBSCRIBE, nonce, result, responseStatus.FAILED));
    };

    UnsubscribeToGroupchat = (socket, nonce, payload) => {
        let result = this.userService.UnsubscribeToGroupchat(socket, payload);
        if (result == true)
            socket.write(helpers.EncodeMessage(commands.UNSUBSCRIBE, nonce, '', responseStatus.SUCCESS));
        else socket.write(helpers.EncodeMessage(commands.UNSUBSCRIBE, nonce, result, responseStatus.FAILED));
    };

    ChatToGroup = (socket, nonce, payload) => {
        let request = payload.split('/');
        if (request.length == 2) {
            let result = this.userService.ChatToGroup(socket, nonce, request);
            if (result == true)
                socket.write(helpers.EncodeMessage(commands.GROUPCHAT, nonce, '', responseStatus.SUCCESS));
            else socket.write(helpers.EncodeMessage(commands.GROUPCHAT, nonce, result, responseStatus.FAILED));
        }
    };
}

(new Program()).Main();