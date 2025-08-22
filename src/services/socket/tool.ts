import { decrypt, encrypt } from "./jiami";

export interface MsgData {
    len: number;    // 预期消息长度（不包括长度头部的4字节）
    data: Buffer;   // 已收到的内容
}

export interface MsgData {
    len: number;    // 剩余要接收的消息长度（不包括长度头）
    data: Buffer;   // 缓存未处理的部分
}

/**
 * type 0: json 1；二进制 2 token
 */
export interface ParsedMessage {
    id: number;
    type: number;
    body: Buffer;
}

/**
 * 处理 TCP 粘包/拆包，返回完整解析的消息
 * @param chunk 本次 data 收到的 Buffer
 * @param msgData 存储粘包/半包的缓存
 * @returns ParsedMessage | null
 */
export function handleTcpData(
    chunk: Buffer,
    state: MsgData,
    opts?: { maxFrameSize?: number }   // 防御过大长度，避免DoS
): ParsedMessage[] {
    const maxFrameSize = opts?.maxFrameSize ?? 32 * 1024 * 1024; // 32MB上限，可按需调整
    let buf = chunk;

    // 把上次剩余拼上来
    if (state.data.length) {
        buf = Buffer.concat([state.data, buf]);
        state.data = Buffer.alloc(0);
    }

    const out: ParsedMessage[] = [];

    while (true) {
        // 还没拿到长度头
        if (state.len === 0) {
            if (buf.length < 4) {            // 长度头都不够，等下次数据
                state.data = buf;
                break;
            }
            state.len = buf.readUInt32BE(0); // 读取消息体长度（不含这4字节）
            buf = buf.slice(4);

            // 防御：非法或过大长度直接丢弃连接/抛错
            if (state.len < 8 || state.len > maxFrameSize) {
                throw new Error(`非法消息长度: ${state.len}`);
            }
        }

        // 需要的字节还不够完整消息体
        if (buf.length < state.len) {
            state.data = buf; // 留到下次
            break;
        }

        // 取出一条完整的消息体 (id+type+body)
        const frame = buf.slice(0, state.len);
        buf = buf.slice(state.len);  // 把已读的从缓冲去掉
        state.len = 0;               // 重置，准备读下一条

        // 基本校验：至少要有id和type的8字节
        if (frame.length < 8) {
            throw new Error(`消息体过短: ${frame.length}`);
        }

        const id = frame.readUInt32BE(0);
        const type = frame.readUInt32BE(4);
        const encBody = frame.slice(8);

        let body: Buffer;
        try {
            body = decrypt(encBody);
        } catch (e: any) {
            throw new Error(`解密失败: ${e?.message ?? e}`);
        }

        out.push({ id, type, body });

        // 循环继续，看当前 buf 里是否还有下一条完整的
    }

    return out;
}


/**
 * 
 * @param payload 
 * @param id 
 * @param type 0表示json，1表示二进制
 * @returns 
 */
export function packMessage(
    payload: string | Buffer,
    id: number,
    type: 0 | 1
): Buffer {
    const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf-8');
    const reqBody = encrypt(body);
    const idBuff = Buffer.alloc(4);
    const typeBuff = Buffer.alloc(4);

    idBuff.writeUInt32BE(id, 0);
    typeBuff.writeUInt32BE(type, 0);

    // 消息长度 = id(4) + type(4) + body
    const len = Buffer.alloc(4);
    len.writeUInt32BE(idBuff.length + typeBuff.length + reqBody.length, 0);

    return Buffer.concat([len, idBuff, typeBuff, reqBody]);
}


let IdNum = 100;
export function getMsgId() {
    IdNum++;
    return IdNum;

}