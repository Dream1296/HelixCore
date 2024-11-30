
// 监听来自父进程的消息
process.on('message', (msg) => {
    console.log('子进程接收到来自父进程的消息:', msg);
    test();

    // 发送回复消息给父进程
    // process.send({ reply: 'hello from child process' });
});


function test(){
    console.log('收到一条消息');
    
}