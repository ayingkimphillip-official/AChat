import * as net from 'net';
import readline from 'readline';
import Commands from '../../Common/Enums/Commands';
import Response from '../../Common/Enums/Response';
import ClientCommands from './clientCommands';
import Helpers from '../../Common/helperFunctions';

class Program {
    static Port: number = 1337;
    static Address: string = "127.0.0.1";
    static Socket: net.Socket;
    static Interface: readline.Interface;
    static Helpers: Helpers;
    static Nonce: number = 1;
    static CallBackArray: Buffer[] = [];

    static Main(args: string[]) {
        console.log("HELLO CLIENT WORLD");
        Program.Socket = new net.Socket();
        Program.Helpers = new Helpers();
        Program.Socket = Program.Socket.connect(Program.Port, Program.Address, Program.OnServerConnection);
        Program.Socket.on('data', Program.OnDataRecieved);
    }

    static OnServerConnection = () => {
        console.log("Connected to Server");
        Program.Interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        Program.Interface.on('line', (line: string) => {
            let params = line.split(' ');

            switch (params[0]) {
                case ClientCommands.REGISTER:
                    Program.Register(params);
                    break;
                case ClientCommands.LOGIN:
                    Program.Login(params);
                    break;
                default:
                    break;
            }
        });
    }

    static OnDataRecieved = (data: Buffer) => {
        let response = data.toString();
        console.log(response);
    }

    static Register = (params: string[]) => {
        if (params.length == 3) {
            let username = params[1];
            let password = params[2];
            let request: string;

            request = Commands.REGISTER.toString().concat("", Program.Nonce.toString());
            request = request.concat("", `${username}/${password}`);
            Program.Helpers.EncodeMessage(request);

            // Program.Socket.write(`1/${username}/${password}`);
        }
    }

    static Login = (params: string[]) => {
        if (params.length == 3) {
            let username = params[1];
            let password = params[2];

            Program.Socket.write(`2/${username}/${password}`);
        }
    }
}

Program.Main([]);
