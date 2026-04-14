const ffmpeg = require("fluent-ffmpeg");
const path = require("path");


module.exports = function mp3s(pathFile, pathFiles, head, end) {
  return new Promise((resolve, reject) => {
    const AUDIO_FILE_PATH = pathFile; // 音频文件路径
    const times = new Date().getTime();
    const output = pathFiles;

    // 设置开始时间和持续时间（支持三位小数）
    let startTime = head;
    let duration = end;
    startTime = startTime / 1000;
    duration = duration / 1000 - startTime;

    ffmpeg(AUDIO_FILE_PATH)
      .setStartTime(startTime.toFixed(3))
      .setDuration(duration.toFixed(3))
      .audioCodec("libmp3lame")  // 使用 MP3 编解码器
      .audioBitrate("160k")
      .audioChannels(1)
      .audioFrequency(24000)
      .output(output)
      .outputOptions("-loglevel", "debug")
      .on("start", (commandLine) => {
        console.log('Start command:', commandLine);
      })
      .on("progress", (progress) => {
        console.log(`Processing: ${progress.percent ? progress.percent + "%" : "in progress"}`);
      })
      .on("end", () => {
        resolve(output);
      })
      .on("error", (err) => {
        console.error('Error:', err);
        reject(err);
      })
      .run();

  });
}
