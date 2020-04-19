import Commands from '../Enums/Commands';
import MessageTypes from '../Enums/MessageTypes';

export default interface IMessage {
    command: Commands,
    nonce: number,
    status: MessageTypes,
    payload: string
}