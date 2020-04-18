import Commands from '../Enums/Commands';
import MessageTypes from '../Enums/MessageTypes';

interface IMessage {
    command: Commands,
    nonce: number,
    status: MessageTypes,
    payload: string
}

export default IMessage;