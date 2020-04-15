import * as net from 'net';
import UserService from './userService';
import IUserService from '../../Common/Interfaces/IUserAccount';
import Commands from '../../Common/Enums/Commands';
import Response from '../../Common/Enums/Response';

class Program {
    static Port: number = 1337;
    static Address: string = "127.0.0.1";
    static Server: net.Server;
    static UserService: UserService;

    static Main(args: string[]) {
        Program.Server = net.createServer();
        Program.UserService = new UserService();
        Program.Server.listen(Program.Port, Program.Address);
        Program.Server.on('connection', Program.OnClientConnection);
    }

    static OnClientConnection = (socket: net.Socket) => {
        console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
        socket.on('data', (data) => { Program.OnDataRecieved(socket, data) });
    }

    static OnDataRecieved = (socket: net.Socket, data: Buffer) => {
        let request = data.toString().split('/');
        let command = parseInt(request[0]);

        switch (command) {
            case Commands.REGISTER:
                Program.Register(socket, request);
                break;
            case Commands.LOGIN:
                Program.Login(socket, request);
                break;
            default:
                break;
        }
    };

    static Register = (socket: net.Socket, request: string[]) => {
        if (request.length == 3) {
            let username = request[1];
            let password = request[2];
            let result = Program.UserService.RegisterAccount(username, password);
            if (result == true) socket.write(`${parseInt(request[0])}/''/${Response.SUCCESS}`);
            else socket.write(`${parseInt(request[0])}/${result}/${Response.FAIL}`);
        }
    }

    static Login = (socket: net.Socket, request: string[]) => {
        if (request.length == 3) {
            let username = request[1];
            let password = request[2];
            let result = Program.UserService.LoginAccount(socket, username, password);
            if (result == true) socket.write(`${parseInt(request[0])}/''/${Response.SUCCESS}`);
            else socket.write(`${parseInt(request[0])}/${result}/${Response.FAIL}`);
        }
    }
}

Program.Main([]);