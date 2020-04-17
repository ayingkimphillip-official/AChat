import * as net from 'net';

interface ILoggedInAccount {
    Socket: net.Socket;
    Username: string;
}

export default ILoggedInAccount;