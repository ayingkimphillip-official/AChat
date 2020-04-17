import Commands from '../Enums/Commands';
import MessageTypes from '../Enums/MessageType';

interface IMessage {
    command: Commands,
    nonce: number,
    status: MessageTypes,
    payload: string
}

export default IMessage;