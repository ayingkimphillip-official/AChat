import Commands from '../Enums/Commands';
import MessageTypes from '../Enums/MessageTypes';

export default interface IResponse {
    command: Commands,
    nonce: number,
    status: MessageTypes,
    response: MessageTypes,
    payload: string
}