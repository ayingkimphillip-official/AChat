class Helpers {
    EncodeMessage = (command, nonce, payloadString, statusCode) => {
        let commandBuf = Buffer.allocUnsafe(1);
        commandBuf.writeUInt8(command);
        let nonceBuf = Buffer.allocUnsafe(1);
        nonceBuf.writeUInt8(nonce);
        let payloadBuf = Buffer.from(payloadString);
        if (statusCode) {
            let statusCodeBuf = Buffer.allocUnsafe(1);
            statusCodeBuf.writeUInt8(statusCode);
            return Buffer.concat([commandBuf, nonceBuf, statusCodeBuf, payloadBuf]);
        }
        return Buffer.concat([commandBuf, nonceBuf, payloadBuf]);
    };

    DecodeMessage = (message, withStatusCode = false) => {
        let command = Buffer.from(message.buffer, 0, 1).readInt8();
        let nonce = Buffer.from(message.buffer, 1, 1).readInt8();
        let statusCode;
        let payload;

        if (withStatusCode) {
            statusCode = Buffer.from(message.buffer, 2, 1).readInt8();
            payload = Buffer.from(message.buffer, 3).toString();
        }
        else
            payload = Buffer.from(message.buffer, 2).toString();

        return { command, nonce, statusCode, payload };
    };
}

module.exports = new Helpers();