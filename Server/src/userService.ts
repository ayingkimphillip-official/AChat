import IUserAccount from '../../Common/Interfaces/IUserAccount';
import ILoggedInAccounts from '../../Common/Interfaces/ILoggedInAccounts';
import * as net from 'net';

class UserService {
    private UserAccounts: IUserAccount[];
    private LoggedInAccounts: ILoggedInAccounts[];

    constructor() {
        this.UserAccounts = [];
        this.LoggedInAccounts = [];
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
        };
        this.UserAccounts.push(NewUser);
        return true;
    }

    public LoginAccount = (socket: net.Socket, username: string, password: string) => {
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
        });
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

    public GetUserAccounts = (): IUserAccount[] => {
        return this.UserAccounts;
    }
}

export default UserService;