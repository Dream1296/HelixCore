import nodemailer from 'nodemailer';
import {myEvent} from '@/services/evenTs';


type Obj = {
    to: string,
    subject: string,
    text: string,
    html: string
}

myEvent.on('sendMail',(data:Obj)=>{
    sendmail(data);
})

async function sendmail(obj:Obj) {
    // 创建邮件发送者对象
    let transporter = nodemailer.createTransport({
        host: 'smtp.qq.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: '2759774229@qq.com', // 你的QQ邮箱账号
            pass: 'eivmqalwnvfsdedj', // 你的QQ邮箱授权码
        },
    });

    // 设置邮件内容
    let mailOptions = {
        from: '"web" <2759774229@qq.com>', // 发件人
        to: obj.to, // 收件人列表，逗号分隔
        subject: obj.subject, // 主题
        text: obj.text, // 纯文本内容
        html: obj.html, // HTML内容
    };
    // console.log(mailOptions);

    // 发送邮件
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('发送成功: %s', info.messageId);
        return `1`;
    } catch (error) {
        console.error('Error sending email: ', error);
        return `0`;
    }
}



