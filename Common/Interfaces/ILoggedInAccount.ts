import * as net from 'net';

export default interface ILoggedInAccount {
    Socket: net.Socket;
    Username: string;
}