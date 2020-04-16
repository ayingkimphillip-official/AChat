import IMessage from './Interfaces/IMessage';

class Helpers {
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
}

export default Helpers;