import * as net from 'net';

export default interface IFileTable {
    Sender: string,
    FileSize: bigint,
    FileName: string,
    Receiver: string,
    ReceiverSocket: net.Socket
}