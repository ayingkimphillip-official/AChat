import * as net from 'net';
import readline from 'readline';

class Program {
    static Port: number = 1337;
    static Address: string = "127.0.0.1";
    static Socket: net.Socket;
    static Interface: readline.Interface;
    // static OnServerConnection: (() => void) | undefined;

    static Main(args: string[]) {
        console.log("HELLO CLIENT WORLD");
        this.Socket = new net.Socket();
        this.Socket.connect(this.Port, this.Address, this.OnServerConnection);
        this.Socket.on('data', this.OnDataRecieved);
    }

    static OnServerConnection() {
        console.log("Connected to Server");
        console.log(this.Socket);
        this.Interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.Interface.on('line', function (line: string) {
            console.log(line);
        })
    }

    // static OnServerConnection = (): void => {
    //     console.log("Connected to Server");
    //     let Interface = readline.createInterface({
    //         input: process.stdin,
    //         output: process.stdout
    //     });
    //     Interface.on('line', (line: string) => {
    //         console.log(line);
    //     });
    // };

    static OnDataRecieved = (data: Buffer | string) => {

    };
}

Program.Main([]);