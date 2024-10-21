const ffmpeg = require("fluent-ffmpeg");
const path = require("path");


module.exports = function mp3s( pathFile ,pathFiles,head, end) {
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
      .setStartTime(startTime.toFixed(3)) // 确保小数格式
      .setDuration(duration.toFixed(3)) // 确保小数格式
      .audioCodec("libmp3lame")
      .audioBitrate("160k")
      .audioChannels(1)
      .audioFrequency(24000)
      .output(output)
      .on("start", (commandLine) => {
      })
      .on("progress", (progress) => {
        console.log(
          `Processing: ${
            progress.percent ? progress.percent + "%" : "in progress"
          }`
        );
      })
      .on("end", () => {
        resolve(output);
      })
      .on("error", (err) => {
      })
      .run();
  });
}
