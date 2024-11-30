import {myEvent} from '@/services/evenTs';
import '@/services/mail';

let data = {
    to:"dream1296@outlook.com",
    subject:"测试邮件",
    text:"这是一个测试邮件",
    html:"<h1>测试</h1>"
}

myEvent.emit('sendMail',data);