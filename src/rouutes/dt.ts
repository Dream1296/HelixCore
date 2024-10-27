import express, { Request, Response } from 'express';
const app = express();
import { getDtList,dtDates,dtimg ,dtimgs,dtvideo,uploadSingleFile,uploadVideos,upvideo,
    updt,postdt,postCom ,delDts ,getemoji,getemojilist,getweizhi,gpsc,getdt,dtindex,
    dtfinds,
    dtvideoImg,lvi,lviobj} 
    from '@/controllers/dt';



//获取动态数据
app.get('/getDtList',getDtList );

//获取当个动态数据
app.get('/getdt',getdt)

//设置动态的标签
app.post('/dtindex',dtindex);

//查询动态
app.get('/dtfind',dtfinds);

//时间信息
app.get('/dtDate', dtDates)

//缩略图
app.get("/dtimg",dtimg);

//原图 已废弃
// app.get("/dtimgs", dtimgs );

//视频
app.get('/dtvideo',dtvideo);

//视频缩略图
app.get('/dtvideoImg',dtvideoImg);


//上传图片
// 路由：处理文件上传
app.post('/updt', uploadSingleFile, updt);

app.post('/upvideo',uploadVideos,upvideo);

//提交动态
app.post("/postdt", postdt);

//提交动态评论
app.post('/postCom',postCom);

//删除动态
app.post('/delDt',delDts)

//小表情
app.get('/emoji',getemoji);

//小表情列表
app.get('/emojilist',getemojilist);

//获取用户位置
app.get('/gps',getweizhi);

//经纬度转地理位置
app.get('/gpsc',gpsc);

//长视频播放
app.get('/lvi',lvi);

//视频信息
app.get('/lviobj',lviobj);


export default app;


