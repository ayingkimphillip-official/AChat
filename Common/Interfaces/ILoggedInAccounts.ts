import * as net from 'net';

interface ILoggedInAccounts {
    Socket: net.Socket;
    Username: string;
}

export default ILoggedInAccounts;