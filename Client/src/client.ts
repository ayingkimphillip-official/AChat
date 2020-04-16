import * as net from 'net';
import readline from 'readline';
import Commands from '../../Common/Enums/Commands';
import MessageType from '../../Common/Enums/MessageType';
import ClientCommands from './clientCommands';
import Helpers from '../../Common/helperFunctions';
import Callback from '../../Common/Interfaces/ICallback';
import IMessage from '../../Common/Interfaces/IMessage';

class Program {
    static Port: number = 1337;
    static Address: string = "127.0.0.1";
    static Socket: net.Socket;
    static Interface: readline.Interface;
    static Nonce: number = 1;
    static CallbackArray: Callback[] = [];

    static Main(args: string[]) {
        Program.Socket = new net.Socket();
        Program.Socket = Program.Socket.connect(Program.Port, Program.Address, Program.OnServerConnection);
        Program.Socket.on('data', Program.OnDataRecieved);
    }

    static OnServerConnection = (): void => {
        console.log("Connected to Server");
        Program.Interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        Program.Interface.on('line', (line: string): void => {
            let params: string[] = line.split(' ');

            switch (params[0]) {
                case ClientCommands.REGISTER:
                    Program.Register(params);
                    break;
                case ClientCommands.LOGIN:
                    Program.Login(params);
                    break;
                case ClientCommands.LOGOUT:
                    Program.Logout(params);
                    break;
                case ClientCommands.WHISPER:
                    Program.Whisper(params);
                    break;
                case ClientCommands.SUBSCRIBE:
                    Program.Subscribe(params);
                    break;
                case ClientCommands.UNSUBSCRIBE:
                    Program.Unsubscribe(params);
                    break;
                case ClientCommands.GROUPCHAT:
                    Program.Groupchat(params);
                    break;
                default:
                    break;
            }
        })
    }

    static OnDataRecieved = (data: Buffer): void => {
        let Response: IMessage = Helpers.DecodeMessage(data);

        switch (Response.command) {
            case Commands.REGISTER:
                Program.SearchCallbackArray(Response);
                break;
            case Commands.LOGIN:
                Program.SearchCallbackArray(Response);
                break;
            case Commands.LOGOUT:
                Program.SearchCallbackArray(Response);
                break;
            case Commands.WHISPER:
                Program.SearchCallbackArray(Response);
                Program.SendToOtherUsers(Response);
                break;
            case Commands.SUBSCRIBE:
                Program.SearchCallbackArray(Response);
                break;
            case Commands.UNSUBSCRIBE:
                Program.SearchCallbackArray(Response);
                break;
            case Commands.GROUPCHAT:
                Program.SearchCallbackArray(Response);
                Program.SendToOtherUsers(Response);
                break;
            default:
                break;
        }
    }

    static Register = (params: string[]): void => {
        if (params.length == 3) {
            let username: string = params[1];
            let password: string = params[2];

            Program.Socket.write(Helpers.EncodeMessage(Commands.REGISTER, Program.Nonce, MessageType.REQUEST, `${username}/${password}`));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static Login = (params: string[]): void => {
        if (params.length == 3) {
            let username: string = params[1];
            let password: string = params[2];

            Program.Socket.write(Helpers.EncodeMessage(Commands.LOGIN, Program.Nonce, MessageType.REQUEST, `${username}/${password}`));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static Logout = (params: string[]): void => {
        if (params.length == 1) {
            Program.Socket.write(Helpers.EncodeMessage(Commands.LOGOUT, Program.Nonce, MessageType.REQUEST, ""));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static Whisper = (params: string[]): void => {
        let Reciever: string = params[1];
        let MessageHolder: string[] = params.slice(2);
        let Message: string = MessageHolder.join(" ");

        Program.Socket.write(Helpers.EncodeMessage(Commands.WHISPER, Program.Nonce, MessageType.REQUEST, `${Reciever}/${Message}`));
        Program.CallbackArray.push({
            nonce: Program.Nonce++,
            callback: Program.Callback
        });
    }

    static Subscribe = (params: string[]): void => {
        if (params.length == 2) {
            let Group: string = params[1];

            Program.Socket.write(Helpers.EncodeMessage(Commands.SUBSCRIBE, Program.Nonce, MessageType.REQUEST, `${Group}`));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static Unsubscribe = (params: string[]): void => {
        if (params.length == 2) {
            let Group: string = params[1];

            Program.Socket.write(Helpers.EncodeMessage(Commands.UNSUBSCRIBE, Program.Nonce, MessageType.REQUEST, `${Group}`));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static Groupchat = (params: string[]): void => {
        let Group: string = params[1];
        let MessageHolder: string[] = params.slice(2);
        let Message: string = MessageHolder.join(" ");

        Program.Socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, Program.Nonce, MessageType.REQUEST, `${Group}/${Message}`));
        Program.CallbackArray.push({
            nonce: Program.Nonce++,
            callback: Program.Callback
        });
    }

    static Callback = (command: number, status: number, payload: string): void => {
        let displayResult: string = "";
        switch (command) {
            case Commands.REGISTER:
                displayResult = "REGISTRATION ";
                break;
            case Commands.LOGIN:
                displayResult = "LOGIN ";
                break;
            case Commands.LOGOUT:
                displayResult = "LOGOUT ";
                break;
            case Commands.WHISPER:
                displayResult = "MESSAGE SENT ";
                break;
            case Commands.SUBSCRIBE:
                displayResult = "SUBSCRIPTION ";
                break;
            case Commands.UNSUBSCRIBE:
                displayResult = "UNSUBSCRIPTION ";
                break;
            case Commands.GROUPCHAT:
                displayResult = "MESSAGE SENT TO GROUP ";
                break;
            default:
                break;
        }

        if (status == MessageType.SUCCESS) {
            displayResult += "Successful!";
        }
        else displayResult += `Failed: ${payload}`;
        console.log(displayResult);
    }

    static SearchCallbackArray = (Response: IMessage): void => {
        for (let i = 0; i < Program.CallbackArray.length; i++) {
            if (Program.CallbackArray[i].nonce == Response.nonce) {
                Program.CallbackArray[i].callback(Response.command, Response.status, Response.payload);
                Program.CallbackArray.splice(i, 1);
                break;
            }
        }
    }

    static SendToOtherUsers = (Response: IMessage): void => {
        let Payload: string[];
        let Sender: string;
        let Group: string;
        let Message: string;
        switch (Response.status) {

            case MessageType.TOUSER:
                Payload = Response.payload.split('/');
                Sender = Payload[0];
                Message = Payload[1];

                console.log(`(whisp)${Sender}: ${Message}`);
                break;
            case MessageType.TOGROUP:
                Payload = Response.payload.split('/');
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

Program.Main([]);
