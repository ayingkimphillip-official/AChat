import UserService from './userService';
import IUserService from '../../Common/Interfaces/IUserAccount';
import * as net from 'net';

class Program {
    static Port: number = 1337;
    static Address: string = "127.0.0.1";
    static Server: net.Server;
    static UserService: UserService;

    static Main(args: string[]) {
        this.UserService = new UserService();
        this.Server = net.createServer();
        this.Server.listen(this.Port, this.Address);
        this.Server.on('connection', this.OnClientConnection);
        // this.UserService.RegisterAccount("aying", "aying");
        // console.log(this.UserService.GetUserAccounts());
    }

    // static OnClientConnection = (socket: net.Socket): void => {
    //     console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
    //     socket.on('data', this.OnDataRecieved);
    // };

    static OnClientConnection(socket: net.Socket) {
        console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
        socket.on('data', (data: Buffer | string) => this.OnDataRecieved(socket, data));
    }

    static OnDataRecieved(socket: net.Socket, data: Buffer | string) {
        console.log(data.toString());
    };
}

Program.Main([]);