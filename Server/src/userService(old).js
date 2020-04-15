const commands = require('../../Common/commandTypes');
const responseStatus = require('../../Common/responseStatus');
const helpers = require('../../Common/helpers');


class userService {
    accounts = [];
    loggedInAccounts = [];
    groupchatMembers = [];

    RegisterAccount = (username, password) => {
        if (username && username.length >= 4 && password && password.length >= 4) {
            for (let i = 0; i < this.accounts.length; i++) {
                if (this.accounts[i].username == username) {
                    return 'Username already exists!';
                }
            }
            this.accounts.push({ username, password });
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
                            return 'Account already logged in!';
                        }
                    }
                    this.loggedInAccounts.push({
                        socket,
                        username
                    });
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
        let sender = this.GetSocketUser(socket);

        if (!sender) return 'Not logged in';

        for (let i = 0; i < this.loggedInAccounts.length; i++) {
            if (this.loggedInAccounts[i].username == sender) {
                this.loggedInAccounts.splice(i, 1);
                return true;
            }
        }
    };

    WhisperToAnotherUser = (socket, nonce, payload) => {
        let sender = this.GetSocketUser(socket);

        if (!sender) return 'Invalid Sender';

        let hasSent = false;
        for (let i = 0; i < this.loggedInAccounts.length; i++) {
            if (this.loggedInAccounts[i].username == payload[0]) {
                this.loggedInAccounts[i].socket.write(helpers.EncodeMessage(commands.WHISPER, nonce, `${sender}/${payload[1]}`, responseStatus.MESSAGETOUSER));
                hasSent = true;
            }
        }
        if (hasSent) return true;
        return 'Invalid Reciever';
    };

    SubscribeToGroupchat = (socket, groupchat) => {
        let sender = this.GetSocketUser(socket);

        if (!sender) return 'Not yet logged in';

        let isMember = this.GroupHasMember(sender, groupchat);

        if (!isMember) {
            this.groupchatMembers.push({
                socket: socket,
                groupchat: groupchat,
                username: sender
            });
            return true;
        }
        else return 'User already a subscriber to group';

        // for (let i = 0; i < this.groupchatMembers.length; i++) {
        //     if (this.groupchatMembers[i].groupchat == groupchat &&
        //         this.groupchatMembers[i].username == sender) {
        //         return 'User already a subscriber to group';
        //     }
        // }
        // this.groupchatMembers.push({
        //     socket: socket,
        //     groupchat: groupchat,
        //     username: sender
        // });
        // return true;
    };

    UnsubscribeToGroupchat = (socket, groupchat) => {
        let sender = this.GetSocketUser(socket);

        if (!sender) return 'User not logged in';

        let isMember = this.GroupHasMember(sender, groupchat);

        if (!isMember) return 'Groupchat does not exist';

        for (let i = 0; i < this.groupchatMembers.length; i++) {
            if (this.groupchatMembers[i].username == sender) {
                this.groupchatMembers.splice(i, 1);
                return true;
            }
        }
    };

    ChatToGroup = (socket, nonce, request) => {
        let sender = this.GetSocketUser(socket);
        if (!sender) return 'Not yet logged in';

        let isMember = this.GroupHasMember(sender, request[0]);
        if (!isMember) return 'User is not a member.';

        let hasSent = false;
        for (let i = 0; i < this.groupchatMembers.length; i++) {
            if (this.groupchatMembers[i].groupchat == request[0] &&
                this.groupchatMembers[i].username != sender) {
                for (let j = 0; j < this.loggedInAccounts.length; j++) {
                    if (this.loggedInAccounts[j].username == this.groupchatMembers[i].username) {
                        this.groupchatMembers[i].socket.write(helpers.EncodeMessage(commands.GROUPCHAT, nonce, `${sender}/${request[0]}/${request[1]}`, responseStatus.MESSAGETOGROUP));
                        hasSent = true;
                    }
                }
            }
            else {
                hasSent = true;
            }
        }

        if (!hasSent) return 'Group does not exist';
        return true;
    };

    GetSocketUser = (socket) => {
        let sender;

        for (let i = 0; i < this.loggedInAccounts.length; i++) {
            if (this.loggedInAccounts[i].socket.remoteAddress == socket.remoteAddress &&
                this.loggedInAccounts[i].socket.remotePort == socket.remotePort) {
                sender = this.loggedInAccounts[i].username;
                break;
            }
        }
        return sender;
    };

    GroupHasMember = (sender, groupchat) => {
        for (let i = 0; i < this.groupchatMembers.length; i++) {
            if (this.groupchatMembers[i].groupchat == groupchat &&
                this.groupchatMembers[i].username == sender) {
                return true;
            }
        }
        return false;
    };

}

module.exports = userService;