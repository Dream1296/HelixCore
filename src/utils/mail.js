const nodemailer = require('nodemailer');

async function sendmail({ to, subject, text, html }) {
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
    to: to, // 收件人列表，逗号分隔
    subject: subject, // 主题
    text: text, // 纯文本内容
    html: html, // HTML内容
  };
  console.log(mailOptions);

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

module.exports = sendmail;

// // 使用示例
// sendEmailWithQQMail({
//   to: 'dream1296@outlook.com',
//   subject: 'Hello ✔',
//   text: 'Hello world?',
//   html: '<b>Hello world?</b>',
// });
