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

    static GetPermission = (socket: net.Socket, filesize: bigint, receiver: string, filename: string, receiverAddress: string): true | string => {
        const receiverAddressNew: string[] = receiverAddress.split(':');
        const receiverIP: string = receiverAddressNew[0];
        const receiverPort: number = parseInt(receiverAddressNew[1]);
        const sender: false | string = UserService.GetSocketUser(socket);

        if (sender == false) return "Sender is not logged in"; //Sender is not logged in.

        // const isReceiverLoggedIn = FileService.IsReceiverLoggedIn(receiverIP, receiverPort); //UserService should be used for this function. Dapat UserService ang gamiton.
        // if (!isReceiverLoggedIn) return "Reciever is not logged in";

        for (let i = 0; i < UserService.LoggedInAccounts.length; i++) {
            if (UserService.LoggedInAccounts[i].Username == receiver) {
                UserService.LoggedInAccounts[i].Socket.write(Helpers.EncodePermission(Commands.SEND, 0, MessageTypes.SENDFILE, filesize, `${sender}/${filename}`));
                FileService.IFileTable.push({
                    Sender: sender,
                    FileSize: filesize,
                    FileName: filename,
                    Receiver: receiver,
                    ReceiverSocket: UserService.LoggedInAccounts[i].Socket
                });
                return true;
            }
        }

        return "Invalid reqeust";
    }

    static GetResponse = (socket: net.Socket, response: number, receiver: string, filename: string, receiverAddress: string): true | string => {
        const receiverAddressNew: string[] = receiverAddress.split(':');
        const receiverIP: string = receiverAddressNew[0];
        const receiverPort: number = parseInt(receiverAddressNew[1]);
        const sender: false | string = UserService.GetSocketUser(socket);

        if (sender == false) return "Sender is not logged in"; //Sender is not logged in.

        const isReceiverLoggedIn = FileService.IsReceiverLoggedIn(receiverIP, receiverPort);
        if (!isReceiverLoggedIn) return "Reciever is not logged in";

        for (let i = 0; i < UserService.LoggedInAccounts.length; i++) {
            if (UserService.LoggedInAccounts[i].Username == receiver) {
                if (response == MessageTypes.YES) UserService.LoggedInAccounts[i].Socket.write(Helpers.EncodeResponse(Commands.RESPOND, 0, MessageTypes.SENDFILE, response, `YES`));
                else if (response == MessageTypes.NO) UserService.LoggedInAccounts[i].Socket.write(Helpers.EncodeResponse(Commands.RESPOND, 0, MessageTypes.SENDFILE, response, `NO`));
                return true;
            }
        }

        return "Invalid response";
    }

    static IsReceiverLoggedIn = (receiverIP: string, receiverPort: number): boolean => {
        for (let i = 0; i < UserService.LoggedInAccounts.length; i++) {
            if (UserService.LoggedInAccounts[i].Socket.remoteAddress == receiverIP &&
                UserService.LoggedInAccounts[i].Socket.remotePort == receiverPort) {
                return true;
            }
        }
        return false;
    }

    static SendFile = (data: Buffer): void => {
        for (let i = 0; i < FileService.IFileTable.length; i++) {
            FileService.IFileTable[i].ReceiverSocket.write(data);
        }
    }
}