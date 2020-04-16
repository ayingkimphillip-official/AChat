import * as net from 'net';

interface IGroupchat {
    socket: net.Socket,
    groupchat: string,
    sender: string,
}

export default IGroupchat;