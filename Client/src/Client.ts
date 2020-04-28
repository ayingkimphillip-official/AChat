import * as net from 'net';
import readline from 'readline';
import filesystem, { write } from 'fs';

import Commands from '../../Common/Enums/Commands';
import MessageTypes from '../../Common/Enums/MessageTypes';
import ICallback from '../../Common/Interfaces/ICallback';
import IMessage from '../../Common/Interfaces/IMessage';
import IPermission from '../../Common/Interfaces/IPermission';
import IFileTable from '../../Common/Interfaces/IFileTable';

import ClientCommands from './Enums/ClientCommands';
import Helpers from '../../Common/helperFunctions';
import IResponse from '../../Common/Interfaces/IResponse';


class Program {
    static Port: number = 1337;
    static Address: string = "127.0.0.1";
    static Socket: net.Socket;
    static Interface: readline.Interface;
    static Nonce: number = 1;
    static CallbackArray: ICallback[] = [];

    static Main(args: string[]) {
        Program.Socket = new net.Socket();
        Program.Socket = Program.Socket.connect(Program.Port, Program.Address, Program.OnServerConnection);
        Program.Socket.on('data', Program.OnDataRecieved);

        Program.Interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
    }

    static OnServerConnection = (): void => {
        console.log("Connected to Server");

        Program.Interface.on('line', (line: string): void => {
            let params: string[] = line.split(' ');

            switch (params[0]) {
                case ClientCommands.REGISTER:
                    Program.ProcessRegister(params);
                    break;
                case ClientCommands.LOGIN:
                    Program.ProcessLogin(params);
                    break;
                case ClientCommands.LOGOUT:
                    Program.ProcessLogout(params);
                    break;
                case ClientCommands.WHISPER:
                    Program.ProcessWhisper(params);
                    break;
                case ClientCommands.SUBSCRIBE:
                    Program.ProcessSubscribe(params);
                    break;
                case ClientCommands.UNSUBSCRIBE:
                    Program.ProcessUnsubscribe(params);
                    break;
                case ClientCommands.GROUPCHAT:
                    Program.ProcessGroupchat(params);
                    break;
                case ClientCommands.SEND:
                    Program.ProcessSendPermissionReqeust(params);
                    break;
                case ClientCommands.RESPOND:
                    Program.ProcessSendPermissionResponse(params);
                    break;
                default:
                    break;
            }
        })
    }

    static ProcessSendPermissionReqeust = (params: string[]): void => {
        if (params.length == 5) {
            let fileSize: bigint = BigInt(params[1]);
            let reciever: string = params[2];
            let filename: string = params[3];
            let addressPort: string = params[4]; //to be deleted

            Program.Socket.write(Helpers.EncodePermission(Commands.SEND, Program.Nonce, MessageTypes.REQUEST, fileSize, `${reciever}/${filename}/${addressPort}`));
        }
    }

    static ProcessReceivedPermissionRequest = (data: Buffer): void => {
        let permissionRequest: IPermission = Helpers.DecodePermission(data);
        let payload: string[] = permissionRequest.payload.split('/');
        const fileSize: bigint = permissionRequest.fileSize;
        const sender: string = payload[0];
        const filename: string = payload[1];

        console.log(`${sender} would like to send you a file: ${filename} (file size: ${fileSize})\r\n`);
        console.log("Would you accept? Y/N");
    }

    static ProcessSendPermissionResponse = (params: string[]): void => {
        if (params.length == 5) {
            const response: number = parseInt(params[1]);
            const sender: string = params[2];
            const filename: string = params[3];
            const addressPort: string = params[4];

            Program.Socket.write(Helpers.EncodeResponse(Commands.RESPOND, 0, MessageTypes.SENDFILE, response, `${sender}/${filename}/${addressPort}`));
        }
    }

    static ProcessReceivedPermissionResponse = (data: Buffer): void => {
        let permissionResponse: IResponse = Helpers.DecodeResponse(data);
        const payload: string = permissionResponse.payload;
        const response: number = permissionResponse.response;

        console.log(`Receiver response: ${payload}`);
        if (response == MessageTypes.YES) {
            filesystem.readFile('/home/aying/Documents/Projects/AChat/hello.txt', (err, data) => {
                // console.log(err);
                Program.Socket.write(data);
            });
        }
    }

    static ReceiveFile = (data: Buffer): void => {
        console.log(data.toString());
    }

    static OnDataRecieved = (data: Buffer): void => {
        let response: IMessage = Helpers.DecodeMessage(data);

        switch (response.command) {
            case Commands.REGISTER:
                Program.SearchCallbackArray(response);
                break;
            case Commands.LOGIN:
                Program.SearchCallbackArray(response);
                break;
            case Commands.LOGOUT:
                Program.SearchCallbackArray(response);
                break;
            case Commands.WHISPER:
                Program.SearchCallbackArray(response);
                Program.SendToOthers(response);
                break;
            case Commands.SUBSCRIBE:
                Program.SearchCallbackArray(response);
                break;
            case Commands.UNSUBSCRIBE:
                Program.SearchCallbackArray(response);
                break;
            case Commands.GROUPCHAT:
                Program.SearchCallbackArray(response);
                Program.SendToOthers(response);
                break;
            case Commands.SEND:
                if (response.status == MessageTypes.SENDFILE) {
                    Program.ProcessReceivedPermissionRequest(data);
                }
                break;
            case Commands.RESPOND:
                if (response.status == MessageTypes.SENDFILE) {
                    Program.ProcessReceivedPermissionResponse(data);
                }
                break;
            default:
                Program.ReceiveFile(data);
                break;
        }
    }

    static ProcessRegister = (params: string[]): void => {
        if (params.length == 3) {
            let Username: string = params[1];
            let Password: string = params[2];

            Program.Socket.write(Helpers.EncodeMessage(Commands.REGISTER, Program.Nonce, MessageTypes.REQUEST, `${Username}/${Password}`));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static ProcessLogin = (params: string[]): void => {
        if (params.length == 3) {
            let Username: string = params[1];
            let Password: string = params[2];

            Program.Socket.write(Helpers.EncodeMessage(Commands.LOGIN, Program.Nonce, MessageTypes.REQUEST, `${Username}/${Password}`));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static ProcessLogout = (params: string[]): void => {
        if (params.length == 1) {
            Program.Socket.write(Helpers.EncodeMessage(Commands.LOGOUT, Program.Nonce, MessageTypes.REQUEST, ""));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static ProcessWhisper = (params: string[]): void => {
        let Reciever: string = params[1];
        let MessageHolder: string[] = params.slice(2);
        let Message: string = MessageHolder.join(" ");

        Program.Socket.write(Helpers.EncodeMessage(Commands.WHISPER, Program.Nonce, MessageTypes.REQUEST, `${Reciever}/${Message}`));
        Program.CallbackArray.push({
            nonce: Program.Nonce++,
            callback: Program.Callback
        });
    }

    static ProcessSubscribe = (params: string[]): void => {
        if (params.length == 2) {
            let Group: string = params[1];

            Program.Socket.write(Helpers.EncodeMessage(Commands.SUBSCRIBE, Program.Nonce, MessageTypes.REQUEST, `${Group}`));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static ProcessUnsubscribe = (params: string[]): void => {
        if (params.length == 2) {
            let Group: string = params[1];

            Program.Socket.write(Helpers.EncodeMessage(Commands.UNSUBSCRIBE, Program.Nonce, MessageTypes.REQUEST, `${Group}`));
            Program.CallbackArray.push({
                nonce: Program.Nonce++,
                callback: Program.Callback
            });
        }
    }

    static ProcessGroupchat = (params: string[]): void => {
        let Group: string = params[1];
        let MessageHolder: string[] = params.slice(2);
        let Message: string = MessageHolder.join(" ");

        Program.Socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, Program.Nonce, MessageTypes.REQUEST, `${Group}/${Message}`));
        Program.CallbackArray.push({
            nonce: Program.Nonce++,
            callback: Program.Callback
        });
    }

    static Callback = (command: number, status: number, payload: string): void => {
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
        if (Program.Nonce > 255) Program.Nonce = 1;
    }

    static SearchCallbackArray = (response: IMessage): void => {
        for (let i = 0; i < Program.CallbackArray.length; i++) {
            if (Program.CallbackArray[i].nonce == response.nonce) {
                Program.CallbackArray[i].callback(response.command, response.status, response.payload);
                Program.CallbackArray.splice(i, 1);
                break;
            }
        }
    }

    static SendToOthers = (response: IMessage): void => {
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

Program.Main([]);
