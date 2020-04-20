import * as net from 'net';

import IUserAccount from '../../../Common/Interfaces/IUserAccount';
import ILoggedInAccount from '../../../Common/Interfaces/ILoggedInAccount';
import ISubscription from '../../../Common/Interfaces/ISubscription';
import Commands from '../../../Common/Enums/Commands';
import MessageTypes from '../../../Common/Enums/MessageTypes';

import Helpers from '../../../Common/helperFunctions';


export default class UserService {
    static UserAccounts: IUserAccount[];
    static LoggedInAccounts: ILoggedInAccount[];

    constructor() {
        UserService.UserAccounts = [];
        UserService.LoggedInAccounts = [];
    }

    static Register = (username: string, password: string): true | string => {
        let IsSanitized = UserService.Sanitize(username, password);

        if (!IsSanitized) return 'Invalid Username or Password';

        for (let i = 0; i < UserService.UserAccounts.length; i++) {
            if (UserService.UserAccounts[i].Username == username) {
                return 'Username already registered';
            }
        }
        let NewUser: IUserAccount = {
            Username: username,
            Password: password
        }
        UserService.UserAccounts.push(NewUser);
        return true;
    }

    static Login = (socket: net.Socket, username: string, password: string): true | string => {
        let IsSanitized = UserService.Sanitize(username, password);
        if (!IsSanitized) return 'Invalid Username or Password';

        let IsUnique = UserService.FindUnique(username, password);
        if (!IsUnique) return 'Incorrect Username or Password';


        let IsLoggedIn = UserService.GetLoggedInAccounts(socket, username);
        if (IsLoggedIn) return 'Account already logged in';

        UserService.LoggedInAccounts.push({
            Socket: socket,
            Username: username
        });

        return true;
    }

    static Logout = (socket: net.Socket): true | string => {
        let User = UserService.GetSocketUser(socket);

        if (User == false) return 'User not logged in';

        for (let i = 0; i < UserService.LoggedInAccounts.length; i++) {
            if (UserService.LoggedInAccounts[i].Socket.remoteAddress == socket.remoteAddress &&
                UserService.LoggedInAccounts[i].Socket.remotePort == socket.remotePort) {
                UserService.LoggedInAccounts.splice(i, 1);
                return true;
            }
        }
        return '';
    }

    static Sanitize = (username: string, password: string): boolean => {
        if (username && username.length >= 4 && password && password.length >= 4) {
            return true;
        }
        else return false;
    }

    static FindUnique = (username: string, password: string) => {
        for (let i = 0; i < UserService.UserAccounts.length; i++) {
            if (UserService.UserAccounts[i].Username == username &&
                UserService.UserAccounts[i].Password == password) {
                return true;
            }
        }
        return false;
    }

    static GetSocketUser = (socket: net.Socket): false | string => {
        let User: false | string;

        for (let i = 0; i < UserService.LoggedInAccounts.length; i++) {
            if (UserService.LoggedInAccounts[i].Socket.remoteAddress == socket.remoteAddress &&
                UserService.LoggedInAccounts[i].Socket.remotePort == socket.remotePort) {
                User = UserService.LoggedInAccounts[i].Username;
                return User;
            }
        }
        return false;
    }

    static GetLoggedInAccounts = (socket: net.Socket, username: string): boolean => {
        for (let i = 0; i < UserService.LoggedInAccounts.length; i++) {
            if (UserService.LoggedInAccounts[i].Socket == socket &&
                UserService.LoggedInAccounts[i].Username == username) {
                return true;
            }
        }
        return false;
    }

    static GetUserAccounts = (): IUserAccount[] => {
        return UserService.UserAccounts;
    }
}