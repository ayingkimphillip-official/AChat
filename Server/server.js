const net = require('net');
const commands = require('../Common/commandTypes');
const responseStatus = require('../Common/responseStatus');
const UserService = require('../Server/userService');

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
    };

    OnDataReceived = (socket, data) => {
        console.log(`Request from Client: ${socket.remoteAddress}:${socket.remotePort} : ${data.toString()}\r\n`);
        data = data.toString();
        const request = data.split('/');
        const command = parseInt(request[0]);

        switch (command) {
            case commands.REGISTER:
                this.RegisterAccount(socket, request);
                break;
            case commands.LOGIN:
                this.LoginAccount(socket, request);
                break;
            case commands.LOGOUT:
                this.LogoutAccount(socket, request);
                break;
            case commands.WHISPER:
                this.WhisperToAnotherUser(socket, request);
                break;
            case commands.SUBSCRIBE:
                this.SubscribeToGroupchat(socket, request);
                break;
            case commands.UNSUBSCRIBE:
                this.UnsubscribeToGroupchat(socket, request);
                break;
            case commands.GROUPCHAT:
                this.ChatToGroup(socket, request);
                break;
            default:
                break;
        }
    };

    RegisterAccount = (socket, request) => {
        if (request.length == 4) {
            let result = this.userService.RegisterAccount(request[2], request[3]);
            if (result == true)
                socket.write(`${commands.REGISTER}/${request[1]}/${responseStatus.SUCCESS}`);
            else socket.write(`${commands.REGISTER}/${request[1]}/${responseStatus.FAILED}/${result}`);
        }
    };

    LoginAccount = (socket, request) => {
        if (request.length == 4) {
            let result = this.userService.LoginAccount(socket, request[2], request[3]);
            if (result == true)
                socket.write(`${commands.LOGIN}/${request[1]}/${responseStatus.SUCCESS}`);
            else socket.write(`${commands.LOGIN}/${request[1]}/${responseStatus.FAILED}/${result}`);
        }
    };

    LogoutAccount = (socket, request) => {
        if (request.length == 2) {
            let result = this.userService.LogoutAccount(socket);
            if (result == true)
                socket.write(`${commands.LOGOUT}/${request[1]}/${responseStatus.SUCCESS}`);
            else socket.write(`${commands.LOGOUT}/${request[1]}/${responseStatus.FAILED}/${result}`);
        }
    };

    WhisperToAnotherUser = (socket, request) => {
        if (request.length == 4) {
            let result = this.userService.WhisperToAnotherUser(socket, request);
            if (result == true)
                socket.write(`${commands.WHISPER}/${request[1]}/${responseStatus.SUCCESS}`);
            else socket.write(`${commands.WHISPER}/${request[1]}/${responseStatus.FAILED}/${result}`);
        }
    };

    SubscribeToGroupchat = (socket, request) => {
        if (request.length == 3) {
            let result = this.userService.SubscribeToGroupchat(socket, request[2]);
            if (result == true)
                socket.write(`${commands.SUBSCRIBE}/${request[1]}/${responseStatus.SUCCESS}`);
            else socket.write(`${commands.SUBSCRIBE}/${request[1]}/${responseStatus.FAILED}/${result}`);
        }
    };

    UnsubscribeToGroupchat = (socket, request) => {
        if (request.length == 3) {
            let result = this.userService.UnsubscribeToGroupchat(socket, request[2]);
            if (result == true)
                socket.write(`${commands.UNSUBSCRIBE}/${request[1]}/${responseStatus.SUCCESS}`);
            else socket.write(`${commands.UNSUBSCRIBE}/${request[1]}/${responseStatus.FAILED}/${result}`);
        }
    };

    ChatToGroup = (socket, request) => {
        if (request.length == 4) {
            let result = this.userService.ChatToGroup(socket, request);
            if (result == true)
                socket.write(`${commands.GROUPCHAT}/${request[1]}/${responseStatus.SUCCESS}`);
            else socket.write(`${commands.GROUPCHAT}/${request[1]}/${responseStatus.FAILED}/${result}`);
        }
    };
}

(new Program()).Main();