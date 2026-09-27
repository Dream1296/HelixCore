import * as sdk from "microsoft-cognitiveservices-speech-sdk";

function aus(text:string, filename:string, cla:number) {

    return new Promise((resolve, reject)=>{
  
  
    "use strict";
  
    let audioFile = filename ;
  
    // 密钥
    const speechConfig = sdk.SpeechConfig.fromSubscription('abfcf96ccbd74ad8a92458f1afe1071e', 'westus');
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);
  
    // 音色
    if (cla == 0) {
      speechConfig.speechSynthesisVoiceName = "zh-CN-XiaoxiaoNeural";
    } else {
      speechConfig.speechSynthesisVoiceName = "zh-CN-XiaochenNeural";
    }
  
    // 
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3; // 设置输出格式为 Riff16Khz16BitMonoPcm
  
    // 创建实例
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  
  
  
    synthesizer.speakTextAsync(text,
      function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("合成完成");
          
          // setTimeout(()=>{
            
          // },2000);
        } else {
          console.error("Speech synthesis canceled, " + result.errorDetails +
            "\nDid you set the speech resource key and region values?");
        }
        synthesizer.close();
        // synthesizer = null;
        resolve('OK');
      },
      function (err) {
        console.trace("err - " + err);
        synthesizer.close();
        // synthesizer = null;
      });
  
  
    });
  
  
  }

  export {aus}