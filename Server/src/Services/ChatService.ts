import IUserAccount from '../../../Common/Interfaces/IUserAccount';
import ILoggedInAccount from '../../../Common/Interfaces/ILoggedInAccount';
import ISubscription from '../../../Common/Interfaces/ISubscription';
import * as net from 'net';
import Helpers from '../../../Common/helperFunctions';
import Commands from '../../../Common/Enums/Commands';
import MessageTypes from '../../../Common/Enums/MessageTypes';

import UserService from './UserService';

export default class ChatService {
    private Subscriptions: ISubscription[];

    constructor() {
        this.Subscriptions = [];
    }

    // public Whisper = (socket: net.Socket, nonce: number, reciever: string, message: string): true | string => {
    //     let Sender = this.GetSocketUser(socket);
    //     let Sender = this.UserService.GetSocketUser(socket);

    //     if (Sender == false) return 'User not logged in';

    //     let hasSent = false;
    //     for (let i = 0; i < this.UserService.LoggedInAccounts.length; i++) {
    //         if (this.UserService.LoggedInAccounts[i].Username == reciever) {
    //             this.UserService.LoggedInAccounts[i].Socket.write(Helpers.EncodeMessage(Commands.WHISPER, nonce, MessageTypes.TOUSER, `${Sender}/${message}`));
    //             hasSent = true;
    //         }
    //     }
    //     if (hasSent) return true;
    //     return 'Invalid Reciever';
    // }
}