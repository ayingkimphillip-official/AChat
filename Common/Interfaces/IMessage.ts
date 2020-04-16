import Commands from '../Enums/Commands';
import MessageType from '../Enums/MessageType';

export default interface IMessage {
    command: Commands,
    nonce: number,
    status: MessageType,
    payload: string
}