import * as net from 'net';
import readline from 'readline';
import filesystem from 'fs';

import Commands from '../../Common/Enums/Commands';
import MessageTypes from '../../Common/Enums/MessageTypes';
import ICallback from '../../Common/Interfaces/ICallback';
import IMessage from '../../Common/Interfaces/IMessage';
import Ifile from '../../Common/Interfaces/IFile';

import ClientCommands from './Enums/ClientCommands';
import Helpers from '../../Common/helperFunctions';


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

        filesystem.readFile('/home/aying/Documents/Projects/AChat/hello.txt', (err, data) => {
            // console.log(err);
            // console.log(data.length);
        });

        Program.Interface.on('line', (line: string): void => {
            let Params: string[] = line.split(' ');

            switch (Params[0]) {
                case ClientCommands.REGISTER:
                    Program.ProcessRegister(Params);
                    break;
                case ClientCommands.LOGIN:
                    Program.ProcessLogin(Params);
                    break;
                case ClientCommands.LOGOUT:
                    Program.ProcessLogout(Params);
                    break;
                case ClientCommands.WHISPER:
                    Program.ProcessWhisper(Params);
                    break;
                case ClientCommands.SUBSCRIBE:
                    Program.ProcessSubscribe(Params);
                    break;
                case ClientCommands.UNSUBSCRIBE:
                    Program.ProcessUnsubscribe(Params);
                    break;
                case ClientCommands.GROUPCHAT:
                    Program.ProcessGroupchat(Params);
                    break;
                case ClientCommands.SEND:
                    Program.ProcessFileSize(Params);
                    break;
                default:
                    break;
            }
        })
    }

    static ProcessFileSize = (params: string[]): void => {
        let fileSize: bigint = BigInt(params[1]);
        let reciever: string = params[2];
        let filename: string = params[3];
        let addressPort: string = params[4];

        Program.Socket.write(Helpers.EncodeFile(Commands.SEND, Program.Nonce, MessageTypes.REQUEST, fileSize, `${reciever}/${filename}/${addressPort}`));

        // for (let i = 0; i < fileSizeBuf.length; i++) {
        //     if (fileSize == 0) {
        //         fileSizeBuf[fileSizeBuf.length - (i + 1)] = 0;
        //         console.log("first", fileSizeBuf);
        //         break;
        //     }

        //     if (fileSize != 0 && fileSize < Bytes) {
        //         fileSizeBuf[fileSizeBuf.length - (i + 1)] = fileSize;
        //         console.log("second", fileSizeBuf);
        //         break;
        //     }

        //     if (fileSize != 0 && fileSize >= Bytes) {
        //         remainder = fileSize % (Bytes - 1);
        //         fileSize = fileSize / Bytes;
        //         console.log("First if", remainder);

        //         if (remainder == 0) {
        //             fileSizeBuf[fileSizeBuf.length - (i + 1)] = fileSize;
        //             console.log("third", fileSizeBuf);
        //         }
        //         else {
        //             console.log(remainder);
        //             console.log(fileSize);
        //             fileSizeBuf[fileSizeBuf.length - (i + 1)] = remainder;
        //             fileSizeBuf[fileSizeBuf.length - (i + 2)] = fileSize;
        //             console.log("Here!");
        //             break;
        //         }
        //     }
        // }
    }


    static OnDataRecieved = (data: Buffer): void => {
        console.log(data);
        let Response: IMessage = Helpers.DecodeMessage(data);
        // let fileResponse: Ifile = Helpers.DecodeFile(data);
        // console.log(fileResponse);

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
                Program.SendToOthers(Response);
                break;
            case Commands.SUBSCRIBE:
                Program.SearchCallbackArray(Response);
                break;
            case Commands.UNSUBSCRIBE:
                Program.SearchCallbackArray(Response);
                break;
            case Commands.GROUPCHAT:
                Program.SearchCallbackArray(Response);
                Program.SendToOthers(Response);
                break;
            default:
                break;
        }
    }

    static ProcessRegister = (params: string[]): void => {
        if (params.length == 3) {
            let Username: string = params[1];
            let Password: string = params[2];

            const a: number = 64;

            Program.Socket.write(Helpers.EncodeMessage(Commands.REGISTER, Program.Nonce, MessageTypes.REQUEST, `${Username}/${Password}`));
            // Program.Socket.write(Helpers.EncodeMessage(a, Program.Nonce, MessageTypes.REQUEST, `${Username}/${Password}`));
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
