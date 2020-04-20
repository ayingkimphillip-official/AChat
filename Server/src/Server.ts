import * as net from 'net';

import UserService from './Services/UserService';
import Groupchat from './Services/ChatService';

import Commands from '../../Common/Enums/Commands';
import MessageTypes from '../../Common/Enums/MessageTypes';
import Helpers from '../../Common/helperFunctions';
import IMessage from '../../Common/Interfaces/IMessage';
import ChatService from './Services/ChatService';


class Program {
    static Port: number = 1337;
    static Address: string = "127.0.0.1";
    static Server: net.Server;
    static UserService: UserService;
    static ChatService: ChatService;

    static Main(args: string[]) {
        Program.Server = net.createServer();
        Program.UserService = new UserService();
        Program.ChatService = new ChatService();

        Program.Server.listen(Program.Port, Program.Address);
        Program.Server.on('connection', Program.OnClientConnection);
    }

    static OnClientConnection = (socket: net.Socket): void => {
        console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
        socket.on('data', (data) => { Program.OnDataRecieved(socket, data) });
        socket.on('close', () => { UserService.Logout(socket) });
    }

    static OnDataRecieved = (socket: net.Socket, data: Buffer): void => {
        let DecodedMessage: IMessage = Helpers.DecodeMessage(data);
        console.log(DecodedMessage);

        let command: Commands = DecodedMessage.command;
        let nonce: number = DecodedMessage.nonce;
        let request: string[] = DecodedMessage.payload.split('/');

        switch (command) {
            case Commands.REGISTER:
                Program.ProcessRegister(socket, nonce, request, command);
                break;
            case Commands.LOGIN:
                Program.ProcessLogin(socket, nonce, request, command);
                break;
            case Commands.LOGOUT:
                Program.ProcessLogout(socket, nonce, command);
                break;
            case Commands.WHISPER:
                Program.ProcessWhisper(socket, nonce, request, command);
                break;
            case Commands.SUBSCRIBE:
                Program.ProcessSubscribe(socket, nonce, request, command);
                break;
            case Commands.UNSUBSCRIBE:
                Program.ProcessUnsubscribe(socket, nonce, request, command);
                break;
            case Commands.GROUPCHAT:
                Program.ProcessGroupchat(socket, nonce, request, command);
                break;
            default:
                break;
        }
    }

    static ProcessRegister = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 2) {
            let Username: string = request[0];
            let Password: string = request[1];
            let result: true | string = UserService.Register(Username, Password);
            Program.Response(socket, result, nonce, command);
        }
    }

    static ProcessLogin = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 2) {
            let Username: string = request[0];
            let Password: string = request[1];
            let result: true | string = UserService.Login(socket, Username, Password);
            Program.Response(socket, result, nonce, command);
        }
    }

    static ProcessLogout = (socket: net.Socket, nonce: number, command: number): void => {
        let result: true | string = UserService.Logout(socket);
        Program.Response(socket, result, nonce, command);
    }

    static ProcessWhisper = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 2) {
            let Reciever: string = request[0];
            let Message: string = request[1];
            let result: true | string = ChatService.Whisper(socket, nonce, Reciever, Message);
            Program.Response(socket, result, nonce, command);
        }
    }

    static ProcessSubscribe = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 1) {
            let Groupchat: string = request[0];
            let result: true | string = ChatService.Subscribe(socket, Groupchat);
            Program.Response(socket, result, nonce, command);
        }
    }

    static ProcessUnsubscribe = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 1) {
            let Groupchat: string = request[0];
            let result: true | string = ChatService.Unsubscribe(socket, Groupchat);
            Program.Response(socket, result, nonce, command);
        }
    }

    static ProcessGroupchat = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 2) {
            let Group: string = request[0];
            let Message: string = request[1];
            let result: true | string = ChatService.Groupchat(socket, nonce, Group, Message);
            Program.Response(socket, result, nonce, command);
        }
    }

    static Response = (socket: net.Socket, result: true | string, nonce: number, command: number): void => {
        switch (command) {
            case Commands.REGISTER:
                if (result == true) socket.write(Helpers.EncodeMessage(Commands.REGISTER, nonce, MessageTypes.SUCCESS, ''));
                else socket.write(Helpers.EncodeMessage(Commands.REGISTER, nonce, MessageTypes.FAIL, `${result}`));
                break;
            case Commands.LOGIN:
                if (result == true) socket.write(Helpers.EncodeMessage(Commands.LOGIN, nonce, MessageTypes.SUCCESS, ''));
                else socket.write(Helpers.EncodeMessage(Commands.LOGIN, nonce, MessageTypes.FAIL, `${result}`));
                break;
            case Commands.LOGOUT:
                if (result == true) socket.write(Helpers.EncodeMessage(Commands.LOGOUT, nonce, MessageTypes.SUCCESS, ''));
                else socket.write(Helpers.EncodeMessage(Commands.LOGOUT, nonce, MessageTypes.FAIL, `${result}`));
                break;
            case Commands.WHISPER:
                if (result == true) socket.write(Helpers.EncodeMessage(Commands.WHISPER, nonce, MessageTypes.SUCCESS, ''));
                else socket.write(Helpers.EncodeMessage(Commands.WHISPER, nonce, MessageTypes.FAIL, `${result}`));
                break;
            case Commands.SUBSCRIBE:
                if (result == true) socket.write(Helpers.EncodeMessage(Commands.SUBSCRIBE, nonce, MessageTypes.SUCCESS, ''));
                else socket.write(Helpers.EncodeMessage(Commands.SUBSCRIBE, nonce, MessageTypes.FAIL, `${result}`));
                break;
            case Commands.UNSUBSCRIBE:
                if (result == true) socket.write(Helpers.EncodeMessage(Commands.UNSUBSCRIBE, nonce, MessageTypes.SUCCESS, ''));
                else socket.write(Helpers.EncodeMessage(Commands.UNSUBSCRIBE, nonce, MessageTypes.FAIL, `${result}`));
                break;
            case Commands.GROUPCHAT:
                if (result == true) socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, nonce, MessageTypes.SUCCESS, ''));
                else socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, nonce, MessageTypes.FAIL, `${result}`));
            default:
                break;
        }
    }
}

Program.Main([]);