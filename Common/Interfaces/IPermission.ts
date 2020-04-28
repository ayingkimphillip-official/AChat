import Commands from '../Enums/Commands';
import MessageTypes from '../Enums/MessageTypes';

export default interface IPermission {
    command: Commands,
    nonce: number,
    status: MessageTypes,
    fileSize: bigint,
    payload: string
}