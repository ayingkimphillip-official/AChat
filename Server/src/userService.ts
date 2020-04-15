import IUserAccount from '../../Common/Interfaces/IUserAccount';

class UserService {
    public UserAccounts: IUserAccount[];

    constructor() {
        this.UserAccounts = [];
    }

    RegisterAccount = (username: string, password: string): true | string => {
        if (username && username.length >= 4 && password && password.length >= 4) {
            for (let i = 0; i < this.UserAccounts.length; i++) {
                if (this.UserAccounts[i].Username == username) {
                    return 'User already registerd';
                }
            }
            let newUser: IUserAccount = {
                Username: username,
                Password: password
            };
            this.UserAccounts.push(newUser);
            return true;
        }

        else return 'Invalid Username or Password';
    };

    public GetUserAccounts = (): IUserAccount[] => {
        return this.UserAccounts;
    };
}

export default UserService;