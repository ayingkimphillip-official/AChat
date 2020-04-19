import * as net from 'net';
import readline from 'readline';
import Commands from '../../../Common/Enums/Commands';
import MessageTypes from '../../../Common/Enums/MessageTypes';
import ClientCommands from '../Enums/ClientCommands';
import Helpers from '../../../Common/helperFunctions';
import ICallback from '../../../Common/Interfaces/ICallback';
import IMessage from '../../../Common/Interfaces/IMessage';

export default class ConnectionService {
    private Port: number = 1337;
    private Address: string = "127.0.0.1";
    private Socket: net.Socket;
    private Interface: readline.Interface;
    private Nonce: number = 1;
    private CallbackArray: ICallback[] = [];

    constructor() {
        this.Socket = new net.Socket();
        this.Interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
    }

    public StartClient = (): void => {
        this.Socket = this.Socket.connect(this.Port, this.Address, this.OnServerConnection);
        this.Socket.on('data', this.OnDataRecieved);
    }

    private OnServerConnection = (): void => {
        console.log("Connected to Server");

        this.Interface.on('line', (line: string): void => {
            let Params: string[] = line.split(' ');

            switch (Params[0]) {
                case ClientCommands.REGISTER:
                    this.Register(Params);
                    break;
                case ClientCommands.LOGIN:
                    this.Login(Params);
                    break;
                case ClientCommands.LOGOUT:
                    this.Logout(Params);
                    break;
                case ClientCommands.WHISPER:
                    this.Whisper(Params);
                    break;
                case ClientCommands.SUBSCRIBE:
                    this.Subscribe(Params);
                    break;
                case ClientCommands.UNSUBSCRIBE:
                    this.Unsubscribe(Params);
                    break;
                case ClientCommands.GROUPCHAT:
                    this.Groupchat(Params);
                    break;
                default:
                    break;
            }
        })
    }

    private OnDataRecieved = (data: Buffer): void => {
        let Response: IMessage = Helpers.DecodeMessage(data);

        switch (Response.command) {
            case Commands.REGISTER:
                this.SearchCallbackArray(Response);
                break;
            case Commands.LOGIN:
                this.SearchCallbackArray(Response);
                break;
            case Commands.LOGOUT:
                this.SearchCallbackArray(Response);
                break;
            case Commands.WHISPER:
                this.SearchCallbackArray(Response);
                this.SendToOthers(Response);
                break;
            case Commands.SUBSCRIBE:
                this.SearchCallbackArray(Response);
                break;
            case Commands.UNSUBSCRIBE:
                this.SearchCallbackArray(Response);
                break;
            case Commands.GROUPCHAT:
                this.SearchCallbackArray(Response);
                this.SendToOthers(Response);
                break;
            default:
                break;
        }
    }

    private Register = (params: string[]): void => {
        if (params.length == 3) {
            let Username: string = params[1];
            let Password: string = params[2];

            this.Socket.write(Helpers.EncodeMessage(Commands.REGISTER, this.Nonce, MessageTypes.REQUEST, `${Username}/${Password}`));
            this.CallbackArray.push({
                nonce: this.Nonce++,
                callback: this.Callback
            });
        }
    }

    private Login = (params: string[]): void => {
        if (params.length == 3) {
            let Username: string = params[1];
            let Password: string = params[2];

            this.Socket.write(Helpers.EncodeMessage(Commands.LOGIN, this.Nonce, MessageTypes.REQUEST, `${Username}/${Password}`));
            this.CallbackArray.push({
                nonce: this.Nonce++,
                callback: this.Callback
            });
        }
    }

    private Logout = (params: string[]): void => {
        if (params.length == 1) {
            this.Socket.write(Helpers.EncodeMessage(Commands.LOGOUT, this.Nonce, MessageTypes.REQUEST, ""));
            this.CallbackArray.push({
                nonce: this.Nonce++,
                callback: this.Callback
            });
        }
    }

    private Whisper = (params: string[]): void => {
        let Reciever: string = params[1];
        let MessageHolder: string[] = params.slice(2);
        let Message: string = MessageHolder.join(" ");

        this.Socket.write(Helpers.EncodeMessage(Commands.WHISPER, this.Nonce, MessageTypes.REQUEST, `${Reciever}/${Message}`));
        this.CallbackArray.push({
            nonce: this.Nonce++,
            callback: this.Callback
        });
    }

    private Subscribe = (params: string[]): void => {
        if (params.length == 2) {
            let Group: string = params[1];

            this.Socket.write(Helpers.EncodeMessage(Commands.SUBSCRIBE, this.Nonce, MessageTypes.REQUEST, `${Group}`));
            this.CallbackArray.push({
                nonce: this.Nonce++,
                callback: this.Callback
            });
        }
    }

    private Unsubscribe = (params: string[]): void => {
        if (params.length == 2) {
            let Group: string = params[1];

            this.Socket.write(Helpers.EncodeMessage(Commands.UNSUBSCRIBE, this.Nonce, MessageTypes.REQUEST, `${Group}`));
            this.CallbackArray.push({
                nonce: this.Nonce++,
                callback: this.Callback
            });
        }
    }

    private Groupchat = (params: string[]): void => {
        let Group: string = params[1];
        let MessageHolder: string[] = params.slice(2);
        let Message: string = MessageHolder.join(" ");

        this.Socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, this.Nonce, MessageTypes.REQUEST, `${Group}/${Message}`));
        this.CallbackArray.push({
            nonce: this.Nonce++,
            callback: this.Callback
        });
    }

    private Callback = (command: number, status: number, payload: string): void => {
        let DisplayResult: string = "";
        switch (command) {
            case Commands.REGISTER:
                DisplayResult = "REGISTRATION ";
                break;
            case Commands.LOGIN:
                DisplayResult = "LOGIN ";
                break;
            case Commands.LOGOUT:
                DisplayResult = "LOGOUT ";
                break;
            case Commands.WHISPER:
                DisplayResult = "MESSAGE SENT ";
                break;
            case Commands.SUBSCRIBE:
                DisplayResult = "SUBSCRIPTION ";
                break;
            case Commands.UNSUBSCRIBE:
                DisplayResult = "UNSUBSCRIPTION ";
                break;
            case Commands.GROUPCHAT:
                DisplayResult = "MESSAGE SENT TO GROUP ";
                break;
            default:
                break;
        }

        if (status == MessageTypes.SUCCESS) {
            DisplayResult += "Successful!";
        }
        else DisplayResult += `Failed: ${payload}`;
        console.log(DisplayResult);
        if (this.Nonce > 255) this.Nonce = 1;
    }

    private SearchCallbackArray = (response: IMessage): void => {
        for (let i = 0; i < this.CallbackArray.length; i++) {
            if (this.CallbackArray[i].nonce == response.nonce) {
                this.CallbackArray[i].callback(response.command, response.status, response.payload);
                this.CallbackArray.splice(i, 1);
                break;
            }
        }
    }

    private SendToOthers = (response: IMessage): void => {
        let Payload: string[];
        let Sender: string;
        let Group: string;
        let Message: string;
        switch (response.status) {

            case MessageTypes.TOUSER:
                Payload = response.payload.split('/');
                Sender = Payload[0];
                Message = Payload[1];

                console.log(`(whisp)${Sender}: ${Message}`);
                break;
            case MessageTypes.TOGROUP:
                Payload = response.payload.split('/');
                Sender = Payload[0];
                Group = Payload[1];
                Message = Payload[2];

                console.log(`[${Group}]${Sender}: ${Message}`);
                break;
            default:
                break;
        }
    }
}