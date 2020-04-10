const net = require('net');
const readline = require('readline');
const commands = require('../Common/commandTypes');
const responseStatus = require('../Common/responseStatus');
const clientCommands = require('./clientCommands');

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
        if (this.DEBUG) console.log(`${data.toString()}`);
        const response = data.toString().split('/');
        const command = parseInt(response[0]);
        const responseNonce = parseInt(response[1]);

        if (command == commands.REGISTER && response.length >= 3) {
            for (let i = 0; i < this.callbackRegArray.length; i++) {
                if (this.callbackRegArray[i].nonce == responseNonce) {
                    this.callbackRegArray[i].callback(data);
                    this.callbackRegArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.LOGIN && response.length >= 3) {
            for (let i = 0; i < this.callbackLoginArray.length; i++) {
                if (this.callbackLoginArray[i].nonce == responseNonce) {
                    this.callbackLoginArray[i].callback(data);
                    this.callbackLoginArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.LOGOUT && response.length >= 3) {
            for (let i = 0; i < this.callbackLogoutArray.length; i++) {
                if (this.callbackLogoutArray[i].nonce == responseNonce) {
                    this.callbackLogoutArray[i].callback(data);
                    this.callbackLogoutArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.WHISPER && response.length >= 3) {
            for (let i = 0; i < this.callbackWhispArray.length; i++) {
                if (this.callbackWhispArray[i].nonce == responseNonce) {
                    this.callbackWhispArray[i].callback(data);
                    this.callbackWhispArray.splice(i, 1);
                    break;
                }
            }

            if (response.length == 5) {
                console.log(`-whisp\n${response[3]}: ${response[4]}`);
            }
        }
        else if (command == commands.SUBSCRIBE && response.length >= 3) {
            for (let i = 0; i < this.callbackSubArray.length; i++) {
                if (this.callbackSubArray[i].nonce == responseNonce) {
                    this.callbackSubArray[i].callback(data);
                    this.callbackSubArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.UNSUBSCRIBE && response.length >= 3) {
            for (let i = 0; i < this.callbackUnsubArray.length; i++) {
                if (this.callbackUnsubArray[i].nonce == responseNonce) {
                    this.callbackUnsubArray[i].callback(data);
                    this.callbackUnsubArray.splice(i, 1);
                    break;
                }
            }
        }
        else if (command == commands.GROUPCHAT && response.length >= 3) {
            for (let i = 0; i < this.callbackGroupchatArray.length; i++) {
                if (this.callbackGroupchatArray[i].nonce == responseNonce) {
                    this.callbackGroupchatArray[i].callback(data);
                    this.callbackGroupchatArray.splice(i, 1);
                    break;
                }
            }

            if (response.length == 6) {
                console.log(`-groupchat\n${response[3]}>${response[4]}: ${response[5]}`);
            }
        }
    };

    RegisterUser = (params) => {
        if (params.length == 3) {
            let username = params[1];
            let password = params[2];

            this.socket.write(`${commands.REGISTER} /${this.nonceReg}/${username}/${password}`);
            this.callbackRegArray.push({
                nonce: this.nonceReg++,
                callback: this.RegisterCallback
            });
        }
    };

    RegisterCallback = (data) => {
        let result = data.toString().split('/');
        const command = parseInt(result[0]);
        const failureMessage = result[3];
        result = parseInt(result[2]);

        if (command == commands.REGISTER) {
            let displayResult = "Registration ";
            if (result == responseStatus.SUCCESS) {
                displayResult += "SUCCESSFUL!";
            }
            else {
                displayResult += `FAILED: ${failureMessage}`;
            }
            console.log(displayResult);
        }
    };

    LoginUser = (params) => {
        if (params.length == 3) {
            let username = params[1];
            let password = params[2];

            this.socket.write(`${commands.LOGIN}/${this.nonceLogin}/${username}/${password}`);
            this.callbackLoginArray.push({
                nonce: this.nonceLogin++,
                callback: this.LoginCallback
            });
        }
    };

    LoginCallback = (data) => {
        let result = data.toString().split('/');
        const command = parseInt(result[0]);
        const failureMessage = result[3];
        result = parseInt(result[2]);

        if (command == commands.LOGIN) {
            let displayResult = "Login ";
            if (result == responseStatus.SUCCESS) {
                displayResult += "SUCCESSFUL!";
            }
            else {
                displayResult += `FAILED: ${failureMessage}`;
            }
            console.log(displayResult);
        }
    };

    LogoutUser = (params) => {
        if (params.length == 1) {
            this.socket.write(`${commands.LOGOUT}/${this.nonceLogout}`);
            this.callbackLogoutArray.push({
                nonce: this.nonceLogout++,
                callback: this.LogoutCallback
            });
        }
    };

    LogoutCallback = (data) => {
        let result = data.toString().split('/');
        const command = parseInt(result[0]);
        const failureMessage = result[3];
        result = parseInt(result[2]);

        if (command == commands.LOGOUT) {
            let displayResult = "Logout ";
            if (result == responseStatus.SUCCESS) {
                displayResult += "SUCCESFFUL";
            }
            else {
                displayResult += `FAILED: ${failureMessage}`;
            }
            console.log(displayResult);
        }
    };

    WhisperToAnotherUser = (params) => {
        if (params.length == 3) {
            let reciever = params[1];
            let message = params[2];

            this.socket.write(`${commands.WHISPER}/${this.nonceWhisp}/${reciever}/${message}`);
            this.callbackWhispArray.push({
                nonce: this.nonceWhisp++,
                callback: this.WhisperCallback
            });
        }
    };

    WhisperCallback = (data) => {
        let result = data.toString().split('/');
        const command = parseInt(result[0]);
        const failureMessage = result[3];
        result = parseInt(result[2]);

        if (command == commands.WHISPER) {
            let displayResult = "Message Sent ";
            if (result == responseStatus.SUCCESS) {
                displayResult += "SUCCESSFULLY";
            }
            else {
                displayResult += `FAILED: ${failureMessage}`;
            }
            console.log(displayResult);
        }
    };

    SubscribeToGroupchat = (params) => {
        if (params.length == 2) {
            const groupchat = params[1];

            this.socket.write(`${commands.SUBSCRIBE}/${this.nonceSub}/${groupchat}`);
            this.callbackSubArray.push({
                nonce: this.nonceSub++,
                callback: this.SubscribeCallback
            });
        }
    };

    SubscribeCallback = (data) => {
        let result = data.toString().split('/');
        const command = parseInt(result[0]);
        const failureMessage = result[3];
        result = parseInt(result[2]);

        if (command == commands.SUBSCRIBE) {
            let displayResult = "SUBSCRIPTION ";
            if (result == responseStatus.SUCCESS) {
                displayResult += "SUCCESSFUL";
            }
            else {
                displayResult += `FAILED: ${failureMessage}`;
            }
            console.log(displayResult);
        }
    };

    UnsubscribeToGroupchat = (params) => {
        if (params.length == 2) {
            const groupchat = params[1];

            this.socket.write(`${commands.UNSUBSCRIBE}/${this.nonceUnsub}/${groupchat}`);
            this.callbackUnsubArray.push({
                nonce: this.nonceUnsub++,
                callback: this.UnsubscribeCallback
            });
        }
    };

    UnsubscribeCallback = (data) => {
        let result = data.toString().split('/');
        const command = parseInt(result[0]);
        const failureMessage = result[3];
        result = parseInt(result[2]);

        if (command == commands.UNSUBSCRIBE) {
            let displayResult = "Unsubscription ";
            if (result == responseStatus.SUCCESS) {
                displayResult += "SUCCESSFUL";
            }
            else {
                displayResult += `FAILED: ${failureMessage}`;
            }
            console.log(displayResult);
        }
    };

    ChatToGroup = (params) => {
        if (params.length == 3) {
            const group = params[1];
            const message = params[2];

            this.socket.write(`${commands.GROUPCHAT}/${this.nonceGroup}/${group}/${message}`);
            this.callbackGroupchatArray.push({
                nonce: this.nonceGroup++,
                callback: this.ChatToGroupCallback
            });
        }
    };

    ChatToGroupCallback = (data) => {
        let result = data.toString().split('/');
        const command = parseInt(result[0]);
        const failureMessage = result[3];
        result = parseInt(result[2]);

        if (command == commands.GROUPCHAT) {
            let displayResult = "MESSAGE TO GROUP ";
            if (result == responseStatus.SUCCESS) {
                displayResult += "SUCCESSFULLY DELIVERED";
            }
            else {
                displayResult += `FAILED: ${failureMessage}`;
            }
            console.log(displayResult);
        }
    };
}

(new Program()).Main();