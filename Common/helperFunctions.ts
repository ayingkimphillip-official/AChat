import IMessage from './Interfaces/IMessage';
import IFile from './Interfaces/IFile';

export default class Helpers {
    public static EncodeMessage = (command: number, nonce: number, status: number, payload: string): Buffer => {
        let EncodedMessage = Buffer.alloc(3 + Buffer.byteLength(payload, 'utf8'));
        EncodedMessage[0] = command;
        EncodedMessage[1] = nonce;
        EncodedMessage[2] = status;
        EncodedMessage.fill(payload, 3);
        return EncodedMessage;
    }

    public static DecodeMessage = (msgBuffer: Buffer): IMessage => {
        let message: IMessage = {
            command: msgBuffer[0],
            nonce: msgBuffer[1],
            status: msgBuffer[2],
            payload: msgBuffer.slice(3).toString()
        }
        return message;
    }

    public static EncodeFile = (command: number, nonce: number, status: number, filesize: bigint, payload: string): Buffer => {
        let EncodedFile = Buffer.alloc(11 + Buffer.byteLength(payload, 'utf8'));
        EncodedFile[0] = command;
        EncodedFile[1] = nonce;
        EncodedFile[2] = status;
        EncodedFile.writeBigUInt64BE(filesize, 3);
        EncodedFile.fill(payload, 11);

        return EncodedFile;
    }

    public static DecodeFile = (fileBuffer: Buffer): IFile => {
        let file: IFile = {
            command: fileBuffer[0],
            nonce: fileBuffer[1],
            status: fileBuffer[2],
            fileSize: fileBuffer.readBigUInt64BE(3),
            payload: fileBuffer.slice(11).toString()
        }
        return file;
    }
}