interface Callback {
    nonce: number,
    callback: (command: number, status: number, payload: string) => void,
}

export default Callback