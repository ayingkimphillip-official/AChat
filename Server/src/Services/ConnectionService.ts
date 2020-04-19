import * as net from 'net';
import UserService from './UserService';
import ChatService from './ChatService';
import Commands from '../../../Common/Enums/Commands';
import MessageTypes from '../../../Common/Enums/MessageTypes';
import Helpers from '../../../Common/helperFunctions';
import IMessage from '../../../Common/Interfaces/IMessage';

export default class ConnectionService {
    private Port: number = 1337;
    private Address: string = "127.0.0.1";
    private Server: net.Server;
    private UserService: UserService;
    private ChatService: ChatService;

    constructor() {
        this.Server = net.createServer();
        this.UserService = new UserService();
        this.ChatService = new ChatService();
    }

    public StartServer = (): void => {
        this.Server.listen(this.Port, this.Address);
        this.Server.on('connection', this.OnClientConnection);
    }

    private OnClientConnection = (socket: net.Socket): void => {
        console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
        socket.on('data', (data) => { this.OnDataRecieved(socket, data) });
        socket.on('close', () => { this.UserService.LogoutAccount(socket) });
    }

    private OnDataRecieved = (socket: net.Socket, data: Buffer): void => {
        let DecodedMessage: IMessage = Helpers.DecodeMessage(data);
        console.log(DecodedMessage);

        let command: Commands = DecodedMessage.command;
        let nonce: number = DecodedMessage.nonce;
        let request: string[] = DecodedMessage.payload.split('/');

        switch (command) {
            case Commands.REGISTER:
                this.Register(socket, nonce, request, command);
                break;
            case Commands.LOGIN:
                this.Login(socket, nonce, request, command);
                break;
            case Commands.LOGOUT:
                this.Logout(socket, nonce, command);
                break;
            case Commands.WHISPER:
                this.Whisper(socket, nonce, request, command);
                break;
            case Commands.SUBSCRIBE:
                this.Subscribe(socket, nonce, request, command);
                break;
            case Commands.UNSUBSCRIBE:
                this.Unsubscribe(socket, nonce, request, command);
                break;
            case Commands.GROUPCHAT:
                this.Groupchat(socket, nonce, request, command);
                break;
            default:
                break;
        }
    }

    private Register = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 2) {
            let Username: string = request[0];
            let Password: string = request[1];
            let result: true | string = this.UserService.RegisterAccount(Username, Password);
            this.Response(socket, result, nonce, command);
        }
    }

    private Login = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 2) {
            let Username: string = request[0];
            let Password: string = request[1];
            let result: true | string = this.UserService.LoginAccount(socket, Username, Password);
            this.Response(socket, result, nonce, command);
        }
    }

    private Logout = (socket: net.Socket, nonce: number, command: number): void => {
        let result: true | string = this.UserService.LogoutAccount(socket);
        this.Response(socket, result, nonce, command);
    }

    private Whisper = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 2) {
            let Reciever: string = request[0];
            let Message: string = request[1];
            let result: true | string = this.UserService.Whisper(socket, nonce, Reciever, Message);
            // let result: true | string = this.ChatService.Whisper(socket, nonce, Reciever, Message);
            this.Response(socket, result, nonce, command);
        }
    }

    private Subscribe = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 1) {
            let Groupchat: string = request[0];
            let result: true | string = this.UserService.Subscribe(socket, Groupchat);
            this.Response(socket, result, nonce, command);
        }
    }

    private Unsubscribe = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 1) {
            let Groupchat: string = request[0];
            let result: true | string = this.UserService.Unsubscribe(socket, Groupchat);
            this.Response(socket, result, nonce, command);
        }
    }

    private Groupchat = (socket: net.Socket, nonce: number, request: string[], command: number): void => {
        if (request.length == 2) {
            let Group: string = request[0];
            let Message: string = request[1];
            let result: true | string = this.UserService.Groupchat(socket, nonce, Group, Message);
            this.Response(socket, result, nonce, command);
        }
    }

    private Response = (socket: net.Socket, result: true | string, nonce: number, command: number): void => {
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
