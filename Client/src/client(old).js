const net = require('net');
const readline = require('readline');
const commands = require('../../Common/commandTypes');
const responseStatus = require('../../Common/responseStatus');
const clientCommands = require('./clientCommands(old)');
const helpers = require('../../Common/helpers');

class Program {
    DEBUG = false;
    port = 1337;
    address = "127.0.0.1";
    socket;
    nonceReg = 1;
    nonceLogin = 1;
    nonceLogout = 1;
    nonceWhisp = 1;
    nonceSub = 1;
    nonceUnsub = 1;
    nonceGroup = 1;
    isConnected = false;
    callbackRegArray = [];
    callbackLoginArray = [];
    callbackLogoutArray = [];
    callbackWhispArray = [];
    callbackSubArray = [];
    callbackUnsubArray = [];
    callbackGroupchatArray = [];
    interface;

    Main = () => {
        this.socket = new net.Socket();
        this.socket.connect(this.port, this.address, this.OnServerConnection);
        this.socket.on('data', this.OnDataRecieved);
    };

    OnServerConnection = () => {
        console.log("Connected to Server.");
        this.isConnected = true;

        this.interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.interface.on('line', (line) => {
            if (this.DEBUG) console.log(line);
            let params = line.split('/');
            switch (params[0]) {
                case clientCommands.REGISTER:
                    this.RegisterUser(params);
                    break;
                case clientCommands.LOGIN:
                    this.LoginUser(params);
                    break;
                case clientCommands.LOGOUT:
                    this.LogoutUser(params);
                    break;
                case clientCommands.WHISPER:
                    this.WhisperToAnotherUser(params);
                    break;
                case clientCommands.SUBSCRIBE:
                    this.SubscribeToGroupchat(params);
                    break;
                case clientCommands.UNSUBSCRIBE:
                    this.UnsubscribeToGroupchat(params);
                    break;
                case clientCommands.GROUPCHAT:
                    this.ChatToGroup(params);
                    break;
                default:
                    break;
            }
        });
    };

    OnDataRecieved = (data) => {
        let { command, nonce: responseNonce, statusCode, payload } = helpers.DecodeMessage(data, true);
        if (this.DEBUG) console.log(`${data.toString()}`);

        if (command == commands.REGISTER) {
            for (let i = 0; i < this.callbackRegArray.length; i++) {
                if (this.callbackRegArray[i].nonce == responseNonce) {
                    this.callbackRegArray[i].callback(statusCode, payload);
                    this.callbackRegArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.LOGIN) {
            for (let i = 0; i < this.callbackLoginArray.length; i++) {
                if (this.callbackLoginArray[i].nonce == responseNonce) {
                    this.callbackLoginArray[i].callback(statusCode, payload);
                    this.callbackLoginArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.LOGOUT) {
            for (let i = 0; i < this.callbackLogoutArray.length; i++) {
                if (this.callbackLogoutArray[i].nonce == responseNonce) {
                    this.callbackLogoutArray[i].callback(statusCode, payload);
                    this.callbackLogoutArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.WHISPER) {
            for (let i = 0; i < this.callbackWhispArray.length; i++) {
                if (this.callbackWhispArray[i].nonce == responseNonce) {
                    this.callbackWhispArray[i].callback(statusCode, payload);
                    this.callbackWhispArray.splice(i, 1);
                    break;
                }
            }

            if (statusCode == responseStatus.MESSAGETOUSER) {
                payload = payload.split('/');
                const sender = payload[0];
                const message = payload[1];

                console.log(`(whisp)${sender}: ${message}`);
            }
        }
        else if (command == commands.SUBSCRIBE) {
            for (let i = 0; i < this.callbackSubArray.length; i++) {
                if (this.callbackSubArray[i].nonce == responseNonce) {
                    this.callbackSubArray[i].callback(statusCode, payload);
                    this.callbackSubArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.UNSUBSCRIBE) {
            for (let i = 0; i < this.callbackUnsubArray.length; i++) {
                if (this.callbackUnsubArray[i].nonce == responseNonce) {
                    this.callbackUnsubArray[i].callback(statusCode, payload);
                    this.callbackUnsubArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.GROUPCHAT) {
            for (let i = 0; i < this.callbackGroupchatArray.length; i++) {
                if (this.callbackGroupchatArray[i].nonce == responseNonce) {
                    this.callbackGroupchatArray[i].callback(statusCode, payload);
                    this.callbackGroupchatArray.splice(i, 1);
                    break;
                }
            }
            if (statusCode == responseStatus.MESSAGETOGROUP) {
                payload = payload.split('/');
                const sender = payload[0];
                const group = payload[1];
                const message = payload[2];

                console.log(`[${group}]${sender}: ${message}`);
            }
        }
    };

    RegisterUser = (params) => {
        if (params.length == 3) {
            let username = params[1];
            let password = params[2];

            this.socket.write(helpers.EncodeMessage(commands.REGISTER, this.nonceReg, `${username}/${password}`));
            this.callbackRegArray.push({
                nonce: this.nonceReg++,
                callback: this.RegisterCallback
            });
            if (this.nonceReg > 255) this.nonceReg = 1;
        }
    };

    RegisterCallback = (statusCode, payload) => {
        let displayResult = "Registration ";
        if (statusCode == responseStatus.SUCCESS) {
            displayResult += "SUCCESSFUL!";
        }
        else {
            displayResult += `FAILED: ${payload}`;
        }
        console.log(displayResult);
    };

    LoginUser = (params) => {
        if (params.length == 3) {
            let username = params[1];
            let password = params[2];

            this.socket.write(helpers.EncodeMessage(commands.LOGIN, this.nonceLogin, `${username}/${password}`));
            this.callbackLoginArray.push({
                nonce: this.nonceLogin++,
                callback: this.LoginCallback
            });
        }
    };

    LoginCallback = (statusCode, payload) => {
        let displayResult = "Login ";
        if (statusCode == responseStatus.SUCCESS) {
            displayResult += "SUCCESSFUL!";
        }
        else {
            displayResult += `FAILED: ${payload}`;
        }
        console.log(displayResult);
    };

    LogoutUser = (params) => {
        if (params.length == 1) {

            this.socket.write(helpers.EncodeMessage(commands.LOGOUT, this.nonceLogout, ''));
            this.callbackLogoutArray.push({
                nonce: this.nonceLogout++,
                callback: this.LogoutCallback
            });
        }
    };

    LogoutCallback = (statusCode, payload) => {
        let displayResult = "Logout ";
        if (statusCode == responseStatus.SUCCESS) {
            displayResult += "SUCCESFFUL";
        }
        else {
            displayResult += `FAILED: ${payload}`;
        }
        console.log(displayResult);
    };

    WhisperToAnotherUser = (params) => {
        if (params.length == 3) {
            let reciever = params[1];
            let message = params[2];

            this.socket.write(helpers.EncodeMessage(commands.WHISPER, this.nonceWhisp, `${reciever}/${message}`));
            this.callbackWhispArray.push({
                nonce: this.nonceWhisp++,
                callback: this.WhisperCallback
            });
        }
    };

    WhisperCallback = (statusCode, payload) => {
        let displayResult = "Message Sent ";
        if (statusCode == responseStatus.SUCCESS) {
            displayResult += "SUCCESSFULLY";
        }
        else {
            displayResult += `FAILED: ${payload}`;
        }
        console.log(displayResult);
    };

    SubscribeToGroupchat = (params) => {
        if (params.length == 2) {
            const groupchat = params[1];

            this.socket.write(helpers.EncodeMessage(commands.SUBSCRIBE, this.nonceSub, `${groupchat}`));
            this.callbackSubArray.push({
                nonce: this.nonceSub++,
                callback: this.SubscribeCallback
            });
        }
    };

    SubscribeCallback = (statusCode, payload) => {
        let displayResult = "SUBSCRIPTION ";
        if (statusCode == responseStatus.SUCCESS) {
            displayResult += "SUCCESSFUL";
        }
        else {
            displayResult += `FAILED: ${payload}`;
        }
        console.log(displayResult);
    };

    UnsubscribeToGroupchat = (params) => {
        if (params.length == 2) {
            const groupchat = params[1];

            this.socket.write(helpers.EncodeMessage(commands.UNSUBSCRIBE, this.nonceUnsub, `${groupchat}`));
            this.callbackUnsubArray.push({
                nonce: this.nonceUnsub++,
                callback: this.UnsubscribeCallback
            });
        }
    };

    UnsubscribeCallback = (statusCode, payload) => {
        let displayResult = "Unsubscription ";
        if (statusCode == responseStatus.SUCCESS) {
            displayResult += "SUCCESSFUL";
        }
        else {
            displayResult += `FAILED: ${payload}`;
        }
        console.log(displayResult);
    };

    ChatToGroup = (params) => {
        if (params.length == 3) {
            const group = params[1];
            const message = params[2];

            this.socket.write(helpers.EncodeMessage(commands.GROUPCHAT, this.nonceGroup, `${group}/${message}`));
            this.callbackGroupchatArray.push({
                nonce: this.nonceGroup++,
                callback: this.ChatToGroupCallback
            });
        }
    };

    ChatToGroupCallback = (statusCode, payload) => {
        let displayResult = "MESSAGE TO GROUP ";
        if (statusCode == responseStatus.SUCCESS) {
            displayResult += "SUCCESSFULLY DELIVERED";
        }
        else {
            displayResult += `FAILED: ${payload}`;
        }
        console.log(displayResult);
    };
}

(new Program()).Main();