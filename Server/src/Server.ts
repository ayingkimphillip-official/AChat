import ConnectionService from '../src/Services/ConnectionService';

class Program {
    static ConnectionService: ConnectionService;

    static Main(args: string[]) {
        Program.ConnectionService = new ConnectionService();
        Program.ConnectionService.StartServer();
    }
}

Program.Main([]);