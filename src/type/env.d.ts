declare namespace NodeJS {
  interface ProcessEnv {
    // 基础服务
    PORT: string
    rootPath: string
    assets: string
    publicPath: string

    // 新资源目录
    aNew: string

    // MySQL 配置
    mysqlHost: string
    mysqlUser: string
    mysqlPassword: string

    // 数据库名
    mysqlDreamName: string
    mysqlAI: string
    mysqlFY: string
    mysqlChat: string
    mysqlFeel: string
    mysqlBook: string

    // Token
    tokenPasswd: string
    tokenR: string

    // 用户
    Guest: string

    // 加密
    miKey: string
    loa13: string

    // RabbitMQ
    MQhost: string
    MQport: string
    MQname: string
    MQpassword: string

    // 动态资源目录
    dtImgSrc: string
    dtVideoSrc: string

    // 默认图片比例
    showProportion: string

    // Prisma
    DATABASE_URL: string
  }
}