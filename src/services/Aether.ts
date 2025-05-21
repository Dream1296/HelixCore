import { getRabbitMQChannel } from "@/config/MQcom";
import { myEvent } from "./evenTs";



//墨水屏刷新
export async function linkScreenRefresh() {
    let con = await getRabbitMQChannel();

    // 声明一个 Direct 交换机（交换机负责将消息路由到队列）
    const exchange = 'mqtt';
    await con.assertExchange(exchange, 'direct', { durable: true });

    // 发送消息（指定 Routing Key）
    const msg = `{
    "topic":"link_screen/esp32_01/eink/set",
    "payload":"updata_dream"
    }`;
    const routingKey = 'mqtt_send';

    con.publish(exchange, routingKey, Buffer.from(msg));

    let res = 408;

    await (new Promise((resolve, reject) => {

        setTimeout(() => {
            res = 408;
            myEvent.removeListener('mqtt_ack', fn);
            resolve(null);
        }, 5000);

        const fn = (data: mqtt_message) => {
            if (data.topic == "link_screen/esp32_01/eink/ask" && data.payload == '200'  ) {
                console.log('刷新成功！');
                res = 200;
                myEvent.removeListener('mqtt_ack', fn);
                resolve(null);
            }
        }


        myEvent.addListener('mqtt_ack', fn);
    }))

    return res;

}


export type mqtt_message = {
    topic: string,
    payload: string,
    time: string
}

getMqttDate();


//数据获取
export async function getMqttDate() {
    let con = await getRabbitMQChannel();

    // 声明一个 Direct 交换机（交换机负责将消息路由到队列）
    const exchange = 'mqtt';
    await con.assertExchange(exchange, 'direct', { durable: true });

    // 3️⃣ 声明任务处理队列（Queue）
    const queue = 'mqtt_a';
    await con.assertQueue(queue, { durable: true });

    // 4️⃣ 绑定队列到交换机，并指定 Routing Key
    await con.bindQueue(queue, exchange, 'mqtt_take');

    console.log("rabbitMQ连接成功");

    // 5️⃣ 开始消费队列中的消息
    con.consume(queue, (msg) => {
        if (!msg) {
            return
        }
        let data: mqtt_message;
        try {
            data = JSON.parse(msg.content.toString());
        } catch (error) {
            console.log(msg.content.toString());

            return
        }



        myEvent.emit('mqtt_ack', data);

        // 处理消息
        console.log(msg.content.toString());

        // 确认消息已被处理
        con.ack(msg);
    });



}