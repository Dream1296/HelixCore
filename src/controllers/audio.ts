import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import url from 'url';  



function audiso(req:Request, res:Response){
    const filename = req.query.name;
    const audioPath = 'public/2.mp3';
    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  
      const chunksize = (end - start) + 1;
      const audioStream = fs.createReadStream(audioPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      };
  
      res.writeHead(206, head);
      audioStream.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'audio/mpeg',
      };
      res.writeHead(200, head);
      fs.createReadStream(audioPath).pipe(res);
    }
}

// function audiso(req:Request, res:Response){
//   const filename = req.query.name;
//   const audioPath = 'public/2.mp4';
//   const stat = fs.statSync(audioPath);
//   const fileSize = stat.size;

//   const range = req.headers.range;
//   if (range) {
//     const parts = range.replace(/bytes=/, "").split("-");
//     const start = parseInt(parts[0], 10);
//     const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

//     const chunksize = (end - start) + 1;
//     const audioStream = fs.createReadStream(audioPath, { start, end });
//     const head = {
//       'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//       'Accept-Ranges': 'bytes',
//       'Content-Length': chunksize,
//       'Content-Type': 'video/mp4',
//     };

//     res.writeHead(206, head);
//     audioStream.pipe(res);
//   } else {
//     const head = {
//       'Content-Length': fileSize,
//       'Content-Type': 'audio/mpeg',
//     };
//     res.writeHead(200, head);
//     fs.createReadStream(audioPath).pipe(res);
//   }
// }



function auTime(req:Request, res:Response){
    let time = req.query.time || -1;

    if(time == -1){
      time = fs.readFileSync('public/time.txt').toString();
      return res.send({time});
    }
    
    fs.writeFileSync('public/time.txt',time.toString());
    return res.send({time});1

}

function getHTML(req:Request, res:Response){
  let html =  fs.readFileSync('public/c.html');
  res.setHeader('content-type','text/html');
    res.send(html);
}











export {audiso , auTime, getHTML}