const commands = require('../Common/commandTypes');
const responseStatus = require('../Common/responseStatus');


class userService {
    accounts = [];
    loggedInAccounts = [];
    groupchatMembers = [];

    RegisterAccount = (username, password) => {
        if (username && username.length >= 4 && password && password.length >= 4) {
            for (let i = 0; i < this.accounts.length; i++) {
                if (this.accounts[i].username == username) {
                    console.log(this.accounts);
                    return 'Username already exists!';
                }
            }
            this.accounts.push({ username, password });
            console.log(this.accounts);
            return true;
        }
        else {
            return 'Invalid username or password!';
        }
    };

    LoginAccount = (socket, username, password) => {
        let remoteAddress = socket.remoteAddress;
        let remotePort = socket.remotePort;

        if (username && username.length >= 4 && password && password.length >= 4) {
            for (let i = 0; i < this.accounts.length; i++) {
                if (this.accounts[i].username == username && this.accounts[i].password == password) {
                    for (let j = 0; j < this.loggedInAccounts.length; j++) {
                        if (this.loggedInAccounts[j].socket.remotePort == remotePort &&
                            this.loggedInAccounts[j].socket.remoteAddress == remoteAddress) {
                            console.log(this.loggedInAccounts);
                            return 'Account already logged in!';
                        }
                    }
                    this.loggedInAccounts.push({
                        socket,
                        username
                    });
                    console.log(this.loggedInAccounts);
                    return true;
                }
            }
            return 'Incorrect username or password!';
        }
        else {
            return 'Invalid username or password!';
        }
    };

    LogoutAccount = (socket) => {
        for (let i = 0; i < this.loggedInAccounts.length; i++) {
            if (this.loggedInAccounts[i].socket.remoteAddress == socket.remoteAddress &&
                this.loggedInAccounts[i].socket.remotePort == socket.remotePort) {
                this.loggedInAccounts.splice(i, 1);
                return true;
            }
        }
        return 'Not logged in';
    };

    WhisperToAnotherUser = (socket, request) => {
        let senderRemoteAddress = socket.remoteAddress;
        let senderRemotePort = socket.remotePort;
        let sender;

        for (let i = 0; i < this.loggedInAccounts.length; i++) {
            if (this.loggedInAccounts[i].socket.remoteAddress == senderRemoteAddress &&
                this.loggedInAccounts[i].socket.remotePort == senderRemotePort) {
                sender = this.loggedInAccounts[i].username;
                break;
            }
        }

        if (sender) {
            let hasSent = false;
            for (let i = 0; i < this.loggedInAccounts.length; i++) {
                if (this.loggedInAccounts[i].username == request[2]) {
                    this.loggedInAccounts[i].socket.write(`${commands.WHISPER}/${request[1]}/${responseStatus.MESSAGETOUSER}/${sender}/${request[3]}`);
                    hasSent = true;
                }
            }
            if (hasSent) return true;
            return 'Invalid Reciever';
        }
        else {
            return 'Invalid Sender';
        }
    };

    SubscribeToGroupchat = (socket, groupchat) => {
        for (let i = 0; i < this.loggedInAccounts.length; i++) {
            if (this.loggedInAccounts[i].socket.remoteAddress == socket.remoteAddress &&
                this.loggedInAccounts[i].socket.remotePort == socket.remotePort) {
                for (let j = 0; j < this.groupchatMembers.length; j++) {
                    if (this.groupchatMembers[j].groupchat == groupchat &&
                        this.groupchatMembers[j].username == this.loggedInAccounts[i].username) {
                        console.log(this.groupchatMembers);
                        return true;
                    }
                }
                this.groupchatMembers.push({
                    socket: socket,
                    groupchat: groupchat,
                    username: this.loggedInAccounts[i].username
                });
                console.log(this.groupchatMembers);
                return true;
            }
        }
        return 'Not yet logged in';
    };

    UnsubscribeToGroupchat = (socket, groupchat) => {
        for (let i = 0; i < this.loggedInAccounts.length; i++) {
            if (this.loggedInAccounts[i].socket.remoteAddress == socket.remoteAddress &&
                this.loggedInAccounts[i].socket.remotePort == socket.remotePort) {
                for (let j = 0; j < this.groupchatMembers.length; j++) {
                    if (this.groupchatMembers[j].groupchat == groupchat &&
                        this.groupchatMembers[j].username == this.loggedInAccounts[i].username) {
                        this.groupchatMembers.splice(j, 1);
                        console.log(this.groupchatMembers);
                        return true;
                    }
                }
                return 'Groupchat does not exist';
            }
        }
        return 'Not yet logged in';
    };

    ChatToGroup = (socket, request) => {
        let sender;

        for (let i = 0; i < this.loggedInAccounts.length; i++) {
            if (this.loggedInAccounts[i].socket.remoteAddress == socket.remoteAddress &&
                this.loggedInAccounts[i].socket.remotePort == socket.remotePort) {
                sender = this.loggedInAccounts[i].username;
                break;
            }
        }
        if (sender) {
            let hasSent = false;
            for (let i = 0; i < this.groupchatMembers.length; i++) {
                if (this.groupchatMembers[i].groupchat == request[2] &&
                    this.groupchatMembers[i].username != sender) {
                    this.groupchatMembers[i].socket.write(`${commands.GROUPCHAT}/${request[1]}/${responseStatus.MESSAGETOGROUP}/${request[2]}/${sender}/${request[3]}`);
                    hasSent = true;
                }
            }
            if (hasSent) return true;
            else {
                return 'No group online';
            }
        }
        else {
            return 'Not yet logged in';
        }
    };

}

module.exports = userService;