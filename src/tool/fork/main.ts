import { fork } from 'child_process';

// 创建子进程，执行 child.js 脚本
const child = fork('child.ts');

// // 监听来自子进程的消息
// child.on('message', (msg) => {
//   console.log('主进程接收到来自子进程的消息:', msg);
// });

// 发送消息给子进程
child.send({ hello: 'from main process' });