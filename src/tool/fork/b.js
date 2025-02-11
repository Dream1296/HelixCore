const Tesseract = require("tesseract.js");

// 监听来自父进程的消息
process.on("message", async (msg) => {
    const { src, id } = msg;

    try {
        const text = await recognizeTextFromImage(src);
        const data = { text, id };

        if (process && process.send) {
            process.send(data);
        }
    } catch (error) {
        console.error("OCR process error:", error);

        if (process && process.send) {
            process.send({ text: "error", id });
        }
    }
});

// 图片文本识别
async function recognizeTextFromImage(imagePath) {
    try {
        const result = await Tesseract.recognize(
            imagePath,
            "chi_sim", // 使用简体中文
            {
                logger: (m) => console.log(m), // 可选：记录识别进度
            }
        );
        const text = result.data.text;
        return text.replace(/\s+/g, ""); // 去除空格
    } catch (error) {
        console.error("OCR识别失败:", error);
        return "error";
    }
}
