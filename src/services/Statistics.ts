// import path from "path";
// import puppeteer, { Browser, Page } from "puppeteer";
// import fs from "fs";
// import ejs from "ejs";

// // 延迟函数，模拟等待
// function stop(num: number): Promise<void> {
//   return new Promise<void>((resolve) => {
//     setTimeout(resolve, num);
//   });
// }

// async function renderHtmlToImage(htmlContent: string, outputPath: string): Promise<void> {
//   try {
//     const browser: Browser = await puppeteer.launch({
//       headless: true,
//       executablePath: '/usr/bin/chromium-browser', // 替换为你的 Chromium 路径
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     });
//     const page: Page = await browser.newPage();

//     // 设置页面内容
//     await page.setContent(htmlContent, { waitUntil: "networkidle0" });

//     // 可选：设置视口大小，以适应移动端和 PC 端
//     await page.setViewport({ width: 1280, height: 500 });

//     // 停止一段时间，确保页面完全加载
//     await stop(3000);

//     // 生成截图并保存为图片
//     await page.screenshot({ path: outputPath, fullPage: true });

//     await browser.close();
//   } catch (error) {
//     console.error("生成图片时出错:", error);
//   }
// }


// // 用户数据
// const user = {
//   title: '动态',
//   data: ['2024,01,01', '2024,12,31']  // 使用正确的数组格式
// };

// // 读取 EJS 模板并渲染 HTML
// const templatePath = path.join(__dirname, '../models/Template/dateStatistics.ejs');
// const template = fs.readFileSync(templatePath, 'utf-8');  // 确保 ejs 模板存在
// const html = ejs.render(template, user);  // 使用 ejs 渲染模板，传入数据
// console.log(html);

// // 将渲染后的 HTML 内容转换为图像
// renderHtmlToImage(html, "output.png")
//   .then(() => console.log("图片生成成功"))
//   .catch((err) => console.error("生成图片时出错:", err));
