interface ICallback {
    nonce: number,
    callback: (command: number, status: number, payload: string) => void,
}

export default ICallback;