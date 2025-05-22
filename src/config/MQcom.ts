import amqp, { Connection, Channel } from "amqplib";

let connection: amqp.ChannelModel | null = null;
let channel: Channel | null = null;
let isShow = true;

export async function getRabbitMQChannel(): Promise<Channel> {
  if (!channel) {
    try {
      // 1️⃣ 连接 RabbitMQ 服务器
      connection = await amqp.connect({
        protocol: 'amqp',
        hostname: process.env.MQhost,
        port: Number(process.env.MQport),
        username: process.env.MQname,
        password: process.env.MQpassword,
      });
      channel = await connection.createChannel();
      if (!channel) {
        console.error("RabbitMQ 连接失败:");
        throw "rabitMQ连接错误"
      }
      if(isShow){
        console.log("RabbitMQ 连接成功！");
        isShow = false;
      }
    } catch (error) {
      console.error("RabbitMQ 连接失败:", error);
      throw error;
    }
  }
  return channel!;
}
