declare module 'spdy' {
    import * as http from 'http';
    import * as https from 'https';
  
    interface Options {
      key: string | Buffer;
      cert: string | Buffer;
      ca?: string | Buffer;
      passphrase?: string;
      [key: string]: any;
    }
  
    // 使用 spdy 创建 HTTP/2 服务器
    function createServer(options: Options, handler: http.RequestListener): https.Server;
    function createServer(options: Options, handler: http2.Http2RequestListener): http2.Http2Server;
  
    export = { createServer };
  }
  