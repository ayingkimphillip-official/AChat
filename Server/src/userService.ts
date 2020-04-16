import IUserAccount from '../../Common/Interfaces/IUserAccount';
import ILoggedInAccounts from '../../Common/Interfaces/ILoggedInAccounts';
import IGroupchat from '../../Common/Interfaces/IGroupchat';
import * as net from 'net';
import Helpers from '../../Common/helperFunctions';
import Commands from '../../Common/Enums/Commands';
import MessageType from '../../Common/Enums/MessageType';

class UserService {
    private UserAccounts: IUserAccount[];
    private LoggedInAccounts: ILoggedInAccounts[];
    private GroupchatAccounts: IGroupchat[];

    constructor() {
        this.UserAccounts = [];
        this.LoggedInAccounts = [];
        this.GroupchatAccounts = [];
    }

    public RegisterAccount = (username: string, password: string): true | string => {
        let IsSanitized = this.SanitizeAccount(username, password);

        if (!IsSanitized) return 'Invalid Username or Password';

        for (let i = 0; i < this.UserAccounts.length; i++) {
            if (this.UserAccounts[i].Username == username) {
                return 'Username already registered';
            }
        }
        let NewUser: IUserAccount = {
            Username: username,
            Password: password
        }
        this.UserAccounts.push(NewUser);
        return true;
    }

    public LoginAccount = (socket: net.Socket, username: string, password: string): true | string => {
        let IsSanitized = this.SanitizeAccount(username, password);

        if (!IsSanitized) return 'Invalid Username or Password';

        let IsUnique = this.FindUnique(username, password);
        if (!IsUnique) return 'Incorrect Username or Password';

        for (let i = 0; i < this.LoggedInAccounts.length; i++) {
            if (this.LoggedInAccounts[i].Socket == socket &&
                this.LoggedInAccounts[i].Username == username) {
                return 'Account already logged in';
            }
        }
        this.LoggedInAccounts.push({
            Socket: socket,
            Username: username
        })
        return true;
    }

    public LogoutAccount = (socket: net.Socket): true | string => {
        let User = this.GetSocketUser(socket);

        if (!User) return 'User not logged in';

        for (let i = 0; i < this.LoggedInAccounts.length; i++) {
            if (this.LoggedInAccounts[i].Username == User) {
                this.LoggedInAccounts.splice(i, 1);
                return true;
            }
        }
        return '';
    }

    public Whisper = (socket: net.Socket, nonce: number, Reciever: string, Message: string): true | string => {
        let Sender = this.GetSocketUser(socket);

        if (!Sender) return 'User not logged in';

        let hasSent = false;
        for (let i = 0; i < this.LoggedInAccounts.length; i++) {
            if (this.LoggedInAccounts[i].Username == Reciever) {
                this.LoggedInAccounts[i].Socket.write(Helpers.EncodeMessage(Commands.WHISPER, nonce, MessageType.TOUSER, `${Sender}/${Message}`));
                hasSent = true;
            }
        }
        if (hasSent) return true;
        return 'Invalid Reciever';
    }

    public Subscribe = (socket: net.Socket, Group: string): true | string => {
        let Sender = this.GetSocketUser(socket);

        if (!Sender) return 'User not logged in';

        let IsMember = this.GroupHasMember(Sender, Group);

        if (!IsMember) {
            this.GroupchatAccounts.push({
                socket: socket,
                groupchat: Group,
                sender: Sender
            });
            return true;
        }
        else return 'User already subscribed to the group';
    }

    public Unsubscribe = (socket: net.Socket, Group: string): true | string => {
        let Sender = this.GetSocketUser(socket);

        if (!Sender) return 'User not logged in';

        let IsMember = this.GroupHasMember(Sender, Group);

        if (!IsMember) return 'Groupchat does not exist';

        for (let i = 0; i < this.GroupchatAccounts.length; i++) {
            if (this.GroupchatAccounts[i].sender == Sender) {
                this.GroupchatAccounts.splice(i, 1);
                return true;
            }
        }
        return 'User not subscribed to the group';
    }

    public Groupchat = (socket: net.Socket, nonce: number, Group: string, Message: string): true | string => {
        let Sender = this.GetSocketUser(socket);

        if (!Sender) return 'User not logged in';

        let IsMember = this.GroupHasMember(Sender, Group);

        if (!IsMember) return 'Groupchat does not exist';

        let hasSent = false;

        for (let i = 0; i < this.GroupchatAccounts.length; i++) {
            if (this.GroupchatAccounts[i].groupchat == Group &&
                this.GroupchatAccounts[i].sender != Sender) {
                for (let j = 0; j < this.LoggedInAccounts.length; j++) {
                    if (this.LoggedInAccounts[j].Username == this.GroupchatAccounts[i].sender) {
                        this.LoggedInAccounts[i].Socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, nonce, MessageType.TOGROUP, `${Sender}/${Group}/${Message}`));
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
    }

    public SanitizeAccount = (username: string, password: string): boolean => {
        if (username && username.length >= 4 && password && password.length >= 4) {
            return true;
        }
        else return false;
    }

    public FindUnique = (username: string, password: string) => {
        for (let i = 0; i < this.UserAccounts.length; i++) {
            if (this.UserAccounts[i].Username == username &&
                this.UserAccounts[i].Password == password) {
                return true;
            }
        }
        return false;
    }

    public GetSocketUser = (socket: net.Socket): string => {
        let User: string = '';

        for (let i = 0; i < this.LoggedInAccounts.length; i++) {
            if (this.LoggedInAccounts[i].Socket.remoteAddress == socket.remoteAddress &&
                this.LoggedInAccounts[i].Socket.remotePort == socket.remotePort) {
                User = this.LoggedInAccounts[i].Username;
                break;
            }
        }
        return User;
    }

    public GroupHasMember = (sender: string, groupchat: string): boolean => {
        for (let i = 0; i < this.GroupchatAccounts.length; i++) {
            if (this.GroupchatAccounts[i].groupchat == groupchat &&
                this.GroupchatAccounts[i].sender == sender) {
                return true;
            }
        }
        return false;
    }

    public GetUserAccounts = (): IUserAccount[] => {
        return this.UserAccounts;
    }
}

export default UserService;