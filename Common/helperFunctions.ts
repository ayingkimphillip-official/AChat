import * as net from 'net';

class Helpers {
    public EncodeMessage = (message: string, status?: boolean): Buffer => {
        let EncodedMessage = Buffer.from(message);
        console.log(EncodedMessage);

        return Buffer.concat([]);
    }

    // public DecodeMessage = (): number | string => {
    //     let number: number = 1;
    //     let string: string = "aying";

    //     return {number, string};
    // }
}

export default Helpers;