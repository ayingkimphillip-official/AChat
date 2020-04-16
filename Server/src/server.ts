import * as net from 'net';
import UserService from './userService';
import Commands from '../../Common/Enums/Commands';
import MessageType from '../../Common/Enums/MessageType';
import Helpers from '../../Common/helperFunctions';

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
        socket.on('close', () => { Program.UserService.LogoutAccount(socket) });
    }

    static OnDataRecieved = (socket: net.Socket, data: Buffer) => {
        let DecodedMessage = Helpers.DecodeMessage(data);
        console.log(DecodedMessage);

        let command: Commands = DecodedMessage.command;
        let nonce: number = DecodedMessage.nonce;
        let request: string[] = DecodedMessage.payload.split('/');

        switch (command) {
            case Commands.REGISTER:
                Program.Register(socket, nonce, request);
                break;
            case Commands.LOGIN:
                Program.Login(socket, nonce, request);
                break;
            case Commands.LOGOUT:
                Program.Logout(socket, nonce);
                break;
            case Commands.WHISPER:
                Program.Whisper(socket, nonce, request);
                break;
            case Commands.SUBSCRIBE:
                Program.Subscribe(socket, nonce, request);
                break;
            case Commands.UNSUBSCRIBE:
                Program.Unsubscribe(socket, nonce, request);
                break;
            case Commands.GROUPCHAT:
                Program.Groupchat(socket, nonce, request);
                break;
            default:
                break;
        }
    }

    static Register = (socket: net.Socket, nonce: number, request: string[]): void => {
        if (request.length == 2) {
            let Username: string = request[0];
            let Password: string = request[1];
            let result: true | string = Program.UserService.RegisterAccount(Username, Password);
            if (result == true) socket.write(Helpers.EncodeMessage(Commands.REGISTER, nonce, MessageType.SUCCESS, ''));
            else socket.write(Helpers.EncodeMessage(Commands.REGISTER, nonce, MessageType.FAIL, `${result}`));
        }
    }

    static Login = (socket: net.Socket, nonce: number, request: string[]): void => {
        if (request.length == 2) {
            let Username: string = request[0];
            let Password: string = request[1];
            let result: true | string = Program.UserService.LoginAccount(socket, Username, Password);
            if (result == true) socket.write(Helpers.EncodeMessage(Commands.LOGIN, nonce, MessageType.SUCCESS, ''));
            else socket.write(Helpers.EncodeMessage(Commands.LOGIN, nonce, MessageType.FAIL, `${result}`));
        }
    }

    static Logout = (socket: net.Socket, nonce: number): void => {
        let result: true | string = Program.UserService.LogoutAccount(socket);
        if (result == true) socket.write(Helpers.EncodeMessage(Commands.LOGOUT, nonce, MessageType.SUCCESS, ''));
        else socket.write(Helpers.EncodeMessage(Commands.LOGOUT, nonce, MessageType.FAIL, `${result}`));
    }

    static Whisper = (socket: net.Socket, nonce: number, request: string[]): void => {
        if (request.length == 2) {
            let Reciever: string = request[0];
            let Message: string = request[1];
            let result: true | string = Program.UserService.Whisper(socket, nonce, Reciever, Message);
            if (result == true) socket.write(Helpers.EncodeMessage(Commands.WHISPER, nonce, MessageType.SUCCESS, ''));
            else socket.write(Helpers.EncodeMessage(Commands.WHISPER, nonce, MessageType.FAIL, `${result}`));
        }
    }

    static Subscribe = (socket: net.Socket, nonce: number, request: string[]): void => {
        if (request.length == 1) {
            let Groupchat: string = request[0];
            let result: true | string = Program.UserService.Subscribe(socket, Groupchat);
            if (result == true) socket.write(Helpers.EncodeMessage(Commands.SUBSCRIBE, nonce, MessageType.SUCCESS, ''));
            else socket.write(Helpers.EncodeMessage(Commands.SUBSCRIBE, nonce, MessageType.FAIL, `${result}`));
        }
    }

    static Unsubscribe = (socket: net.Socket, nonce: number, request: string[]): void => {
        if (request.length == 1) {
            let Groupchat: string = request[0];
            let result: true | string = Program.UserService.Unsubscribe(socket, Groupchat);
            if (result == true) socket.write(Helpers.EncodeMessage(Commands.UNSUBSCRIBE, nonce, MessageType.SUCCESS, ''));
            else socket.write(Helpers.EncodeMessage(Commands.UNSUBSCRIBE, nonce, MessageType.FAIL, `${result}`));
        }
    }

    static Groupchat = (socket: net.Socket, nonce: number, request: string[]): void => {
        if (request.length == 2) {
            let Group: string = request[0];
            let Message: string = request[1];
            let result: true | string = Program.UserService.Groupchat(socket, nonce, Group, Message);
            if (result == true) socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, nonce, MessageType.SUCCESS, ''));
            else socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, nonce, MessageType.FAIL, `${result}`));
        }
    }
}

Program.Main([]);