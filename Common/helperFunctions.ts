import IMessage from './Interfaces/IMessage';
import IPermission from './Interfaces/IPermission';
import IResponse from './Interfaces/IResponse';

export default class Helpers {

    public static EncodeMessage = (command: number, nonce: number, status: number, payload: string): Buffer => {
        let encodedMessage = Buffer.alloc(3 + Buffer.byteLength(payload, 'utf8'));
        encodedMessage[0] = command;
        encodedMessage[1] = nonce;
        encodedMessage[2] = status;
        encodedMessage.fill(payload, 3);
        return encodedMessage;
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

    public static EncodePermission = (command: number, nonce: number, status: number, filesize: bigint, payload: string): Buffer => {
        let encodePermission: Buffer = Buffer.alloc(11 + Buffer.byteLength(payload, 'utf8'));
        encodePermission[0] = command;
        encodePermission[1] = nonce;
        encodePermission[2] = status;
        encodePermission.writeBigUInt64BE(filesize, 3);
        encodePermission.fill(payload, 11);

        return encodePermission;
    }

    public static DecodePermission = (permissionBuffer: Buffer): IPermission => {
        let decodedPermission: IPermission = {
            command: permissionBuffer[0],
            nonce: permissionBuffer[1],
            status: permissionBuffer[2],
            fileSize: permissionBuffer.readBigUInt64BE(3),
            payload: permissionBuffer.slice(11).toString()
        }
        return decodedPermission;
    }

    public static EncodeResponse = (command: number, nonce: number, status: number, responsetype: number, payload: string): Buffer => {
        let encodedResponse: Buffer = Buffer.alloc(4 + Buffer.byteLength(payload, 'utf8'));
        encodedResponse[0] = command;
        encodedResponse[1] = nonce;
        encodedResponse[2] = status;
        encodedResponse[3] = responsetype;
        encodedResponse.fill(payload, 4);
        return encodedResponse;
    }

    public static DecodeResponse = (responseBuffer: Buffer): IResponse => {
        let decodedResponse: IResponse = {
            command: responseBuffer[0],
            nonce: responseBuffer[1],
            status: responseBuffer[2],
            response: responseBuffer[3],
            payload: responseBuffer.slice(4).toString()
        }
        return decodedResponse;
    }
}