const commands = require('../Common/commandTypes');
const responseStatus = require('../Common/responseStatus');


class userService {
    accounts = [];
    loggedInAccounts = [];

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
            return hasSent;
        }
        else {
            return 'Invalid Sender';
        }
    };
}

module.exports = userService;