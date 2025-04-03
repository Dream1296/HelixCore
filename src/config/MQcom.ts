import amqp, { Connection, Channel } from "amqplib";

let connection: amqp.ChannelModel | null = null;
let channel: Channel | null = null;

export async function getRabbitMQChannel(): Promise<Channel> {
  if (!channel) {
    try {
      // 1️⃣ 连接 RabbitMQ 服务器
      connection = await amqp.connect({
        protocol: 'amqp',
        hostname: '127.0.0.1',
        port: 5672,
        username: 'yw',
        password: 'A8412640',
      });
      channel = await connection.createChannel();
      if (!channel) {
        console.error("RabbitMQ 连接失败:");
        throw "rabitMQ连接错误"
      }
      console.log("RabbitMQ 连接成功");
    } catch (error) {
      console.error("RabbitMQ 连接失败:", error);
      throw error;
    }
  }
  return channel!;
}
