import * as net from 'net';

import UserService from './UserService';
import IFileTable from '../../../Common/Interfaces/IFileTable';
import Helpers from '../../../Common/helperFunctions';
import Commands from '../../../Common/Enums/Commands';
import MessageTypes from '../../../Common/Enums/MessageTypes';

export default class FileService {
    static IFileTable: IFileTable[];

    constructor() {
        FileService.IFileTable = [];
    }

    static GetPermission = (socket: net.Socket, filesize: bigint, receiver: string, filename: string, receiverAddress: string): boolean => {
        const receiverAddressNew: string[] = receiverAddress.split(':');
        const receiverIP: string = receiverAddressNew[0];
        const receiverPort: number = parseInt(receiverAddressNew[1]);
        const sender: false | string = UserService.GetSocketUser(socket);

        if (sender == false) return false; //Sender is not logged in.

        for (let i = 0; i < UserService.LoggedInAccounts.length; i++) {
            if (UserService.LoggedInAccounts[i].Username == receiver &&
                UserService.LoggedInAccounts[i].Socket.remoteAddress == receiverIP &&
                UserService.LoggedInAccounts[i].Socket.remotePort == receiverPort) {
                UserService.LoggedInAccounts[i].Socket.write(Helpers.EncodeFile(Commands.SEND, 0, MessageTypes.SENDFILE, filesize, `${sender}/${filename}`));
                return true;
            }
        }
        return false;
    }

    static GetReceiver = (receiver: string, receiverIP: string, receiverPort: number): boolean => {
        for (let i = 0; i < UserService.LoggedInAccounts.length; i++) {
            if (UserService.LoggedInAccounts[i].Username == receiver &&
                UserService.LoggedInAccounts[i].Socket.remoteAddress == receiverIP &&
                UserService.LoggedInAccounts[i].Socket.remotePort == receiverPort) {
                return true;
            }
        }
        return false;
    }
}