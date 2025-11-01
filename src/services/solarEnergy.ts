import { dbSql } from "@/utils/dbSql";
import { mqtt_message } from "./Aether";
import { myEvent } from "./evenTs";


export async function solarEnergyData() {
    myEvent.addListener('mqtt_ack', (e: mqtt_message) => {
        if (e.topic == '/se/esp8266_01/data') {
            let date = new Date(e.time);
            console.log(e.payload);
            let data: any;
            try {
                data = JSON.parse(e.payload);
            } catch {
                console.log("se插入数据异常");

                return
            }
            // 拼接 SQL 插入语句
            const sql = `
                INSERT INTO solar_energy_data (
                date, ch1_u, ch1_i, ch2_u, ch2_i, ch3_u, ch3_i, pwm, wifiRSSI
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
            dbSql(sql, [formatDateToSQL(date), data.ch1.U, data.ch1.I, data.ch2.U, data.ch2.I, data.ch3.U, data.ch3.I, data.pwm, data.wifiRSSI]
                , undefined, 'feel'
            );

        }


    })
}







function formatDateToSQL(date: Date) {
    const pad = (n: any) => String(n).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
