import IUserAccount from '../../Common/Interfaces/IUserAccount';
import ILoggedInAccount from '../../Common/Interfaces/ILoggedInAccounts';
import ISubscription from '../../Common/Interfaces/ISubscription';
import * as net from 'net';
import Helpers from '../../Common/helperFunctions';
import Commands from '../../Common/Enums/Commands';
import MessageTypes from '../../Common/Enums/MessageType';

class UserService {
    private UserAccounts: IUserAccount[];
    private LoggedInAccounts: ILoggedInAccount[];
    private Subscriptions: ISubscription[];

    constructor() {
        this.UserAccounts = [];
        this.LoggedInAccounts = [];
        this.Subscriptions = [];
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


        let IsLoggedIn = this.GetLoggedInAccounts(socket, username);
        if (IsLoggedIn) return 'Account already logged in';

        this.LoggedInAccounts.push({
            Socket: socket,
            Username: username
        });

        return true;
    }

    public LogoutAccount = (socket: net.Socket): true | string => {
        let User = this.GetSocketUser(socket);

        if (User == false) return 'User not logged in';

        for (let i = 0; i < this.LoggedInAccounts.length; i++) {
            if (this.LoggedInAccounts[i].Username == User) {
                this.LoggedInAccounts.splice(i, 1);
                return true;
            }
        }
        return '';
    }

    public Whisper = (socket: net.Socket, nonce: number, reciever: string, message: string): true | string => {
        let Sender = this.GetSocketUser(socket);

        if (Sender == false) return 'User not logged in';

        let hasSent = false;
        for (let i = 0; i < this.LoggedInAccounts.length; i++) {
            if (this.LoggedInAccounts[i].Username == reciever) {
                this.LoggedInAccounts[i].Socket.write(Helpers.EncodeMessage(Commands.WHISPER, nonce, MessageTypes.TOUSER, `${Sender}/${message}`));
                hasSent = true;
            }
        }
        if (hasSent) return true;
        return 'Invalid Reciever';
    }

    public Subscribe = (socket: net.Socket, group: string): true | string => {
        let Sender = this.GetSocketUser(socket);

        if (Sender == false) return 'User not logged in';

        let IsMember = this.GroupHasMember(Sender, group);

        if (!IsMember) {
            this.Subscriptions.push({
                GroupName: group,
                Subscriber: Sender
            });
            return true;
        }
        else return 'User already subscribed to the group';
    }

    public Unsubscribe = (socket: net.Socket, group: string): true | string => {
        let Sender = this.GetSocketUser(socket);

        if (Sender == false) return 'User not logged in';

        let IsMember = this.GroupHasMember(Sender, group);

        if (!IsMember) return 'Groupchat does not exist';

        for (let i = 0; i < this.Subscriptions.length; i++) {
            if (this.Subscriptions[i].Subscriber == Sender) {
                this.Subscriptions.splice(i, 1);
                return true;
            }
        }
        return 'User not subscribed to the group';
    }

    public Groupchat = (socket: net.Socket, nonce: number, group: string, message: string): true | string => {
        let Sender = this.GetSocketUser(socket);

        if (Sender == false) return 'User not logged in';

        let IsMember = this.GroupHasMember(Sender, group);

        if (!IsMember) return 'Sender is not a member';

        let HasSent = false;

        for (let i = 0; i < this.Subscriptions.length; i++) {
            if (this.Subscriptions[i].GroupName == group &&
                this.Subscriptions[i].Subscriber != Sender) {
                for (let j = 0; j < this.LoggedInAccounts.length; j++) {
                    if (this.LoggedInAccounts[j].Username == this.Subscriptions[i].Subscriber) {
                        this.LoggedInAccounts[j].Socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, nonce, MessageTypes.TOGROUP, `${Sender}/${group}/${message}`));
                        HasSent = true;
                    }
                }
            }
        }
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

    public GetSocketUser = (socket: net.Socket): false | string => {
        let User: false | string;

        for (let i = 0; i < this.LoggedInAccounts.length; i++) {
            if (this.LoggedInAccounts[i].Socket.remoteAddress == socket.remoteAddress &&
                this.LoggedInAccounts[i].Socket.remotePort == socket.remotePort) {
                User = this.LoggedInAccounts[i].Username;
                return User;
            }
        }
        return false;
    }

    public GetLoggedInAccounts = (socket: net.Socket, username: string): boolean => {
        for (let i = 0; i < this.LoggedInAccounts.length; i++) {
            if (this.LoggedInAccounts[i].Socket == socket &&
                this.LoggedInAccounts[i].Username == username) {
                return true;
            }
        }
        return false;
    }

    public GroupHasMember = (sender: string, groupchat: string): boolean => {
        for (let i = 0; i < this.Subscriptions.length; i++) {
            if (this.Subscriptions[i].GroupName == groupchat &&
                this.Subscriptions[i].Subscriber == sender) {
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