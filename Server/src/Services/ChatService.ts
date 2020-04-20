import IUserAccount from '../../../Common/Interfaces/IUserAccount';
import ILoggedInAccount from '../../../Common/Interfaces/ILoggedInAccount';
import ISubscription from '../../../Common/Interfaces/ISubscription';
import * as net from 'net';
import Helpers from '../../../Common/helperFunctions';
import Commands from '../../../Common/Enums/Commands';
import MessageTypes from '../../../Common/Enums/MessageTypes';

import UserService from './UserService';

export default class ChatService {
    static Subscriptions: ISubscription[];

    constructor() {
        ChatService.Subscriptions = [];
    }

    static Whisper = (socket: net.Socket, nonce: number, reciever: string, message: string): true | string => {
        let Sender = UserService.GetSocketUser(socket);

        if (Sender == false) return 'User not logged in';

        let hasSent = false;
        for (let i = 0; i < UserService.LoggedInAccounts.length; i++) {
            if (UserService.LoggedInAccounts[i].Username == reciever) {
                UserService.LoggedInAccounts[i].Socket.write(Helpers.EncodeMessage(Commands.WHISPER, nonce, MessageTypes.TOUSER, `${Sender}/${message}`));
                hasSent = true;
            }
        }
        if (hasSent) return true;
        return 'Invalid Reciever';
    }

    static Subscribe = (socket: net.Socket, group: string): true | string => {
        let Sender = UserService.GetSocketUser(socket);

        if (Sender == false) return 'User not logged in';

        let IsMember = ChatService.GroupHasMember(Sender, group);

        if (!IsMember) {
            ChatService.Subscriptions.push({
                GroupName: group,
                Subscriber: Sender
            });
            return true;
        }
        else return 'User already subscribed to the group';
    }

    static Unsubscribe = (socket: net.Socket, group: string): true | string => {
        let Sender = UserService.GetSocketUser(socket);

        if (Sender == false) return 'User not logged in';

        let IsMember = ChatService.GroupHasMember(Sender, group);

        if (!IsMember) return 'Groupchat does not exist';

        for (let i = 0; i < ChatService.Subscriptions.length; i++) {
            if (ChatService.Subscriptions[i].Subscriber == Sender) {
                ChatService.Subscriptions.splice(i, 1);
                return true;
            }
        }
        return 'User not subscribed to the group';
    }

    static Groupchat = (socket: net.Socket, nonce: number, group: string, message: string): true | string => {
        let Sender = UserService.GetSocketUser(socket);

        if (Sender == false) return 'User not logged in';

        let IsMember = ChatService.GroupHasMember(Sender, group);

        if (!IsMember) return 'Sender is not a member';

        let HasSent = false;

        for (let i = 0; i < ChatService.Subscriptions.length; i++) {
            if (ChatService.Subscriptions[i].GroupName == group &&
                ChatService.Subscriptions[i].Subscriber != Sender) {
                for (let j = 0; j < UserService.LoggedInAccounts.length; j++) {
                    if (UserService.LoggedInAccounts[j].Username == ChatService.Subscriptions[i].Subscriber) {
                        UserService.LoggedInAccounts[j].Socket.write(Helpers.EncodeMessage(Commands.GROUPCHAT, nonce, MessageTypes.TOGROUP, `${Sender}/${group}/${message}`));
                        HasSent = true;
                    }
                }
            }
        }
        return true;
    }

    static GroupHasMember = (sender: string, groupchat: string): boolean => {
        for (let i = 0; i < ChatService.Subscriptions.length; i++) {
            if (ChatService.Subscriptions[i].GroupName == groupchat &&
                ChatService.Subscriptions[i].Subscriber == sender) {
                return true;
            }
        }
        return false;
    }
}