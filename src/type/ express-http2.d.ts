declare module 'express-http2' {
    import * as express from 'express';
    import * as http2 from 'http2';
  
    // 类型声明 express-http2 中的 createServer 方法
    export function createServer(
      options: http2.SecureServerOptions,
      app: express.Application
    ): http2.Http2SecureServer;
  }
  