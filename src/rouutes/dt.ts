import express, { Request, Response, Router } from 'express';
const app = Router();

import {
    getDtList, dtDates, dtimg, dtimgs, dtvideo, uploadSingleFile, uploadVideos, upvideo,
    updt, postdt, postCom, delDts, getemoji, getemojilist, getweizhi, gpsc, getdt, dtindex,
    dtfinds,
    dtvideoImg, lvi, lviobj, dtDataImg,
    setDtBgStyles, upDtData, setDts,
    getShare,
    setShare,
    getLongText,
    linkScreenShow,
    dtFile,
    keepRun,
    linkScreenControl,
    dtimgCom,
    getYear,
    setdt,userIndex,
    getDtId,
    upImgVideo,
    upImgVideoNum,
    upDtImgTemp,
    postDtRelation
}  from '@/controllers/dt';
import { PublishAfterExecution } from '@/services/upListData';

import * as t from '../middlewares/routesType';
import { isRequest } from '../middlewares/types';
import { getImgDB } from '@/models/dt/dthc';
import { allowUsers } from '@/middlewares/allowUsers';


/**
 * --------------------------------------
 * 获取动态内容
 */ 

//获取动态数据
app.get('/getDtList', getDtList);

//获取单个动态数据
app.get('/getdt', getdt);

//查询动态 搜索动态
app.get('/dtfind', dtfinds);

//视频
app.get('/dtvideo', dtvideo);

//视频缩略图
app.get('/dtvideoImg', dtvideoImg);


/**
 * --------------------------------------
 * 上传和修改动态内容
 */ 

// 预上传，拿到dt_id
// app.get('/preUpDt', getDtId);

// 内容上传
app.post('/upDt', allowUsers('yw','dlhe','code','dy','now','new'), updt);

// 新的图片上传接口
app.post('/upImgVideo', allowUsers('yw','dlhe','code','dy','now','new'), upImgVideo);

// 新的视频上传接口
// app.post('/upVideo', upvideo);

// 更新图片视频数量
app.post('/upImgVideoNum', allowUsers('yw','dlhe','code','dy','now','new'), upImgVideoNum);

// 更新临时存储目录内容记录
app.get('/upDtImgTemp', allowUsers('yw','dlhe','code','dy','now','new'), upDtImgTemp);

//提交动态
app.post("/postdt", allowUsers('yw','dlhe','code','dy','now','new'), postdt);

// 提交动态关系
app.post("/postDtRelation",allowUsers('yw','dlhe','code','dy','now','new'),postDtRelation)

//修改单个动态数据
app.post('/setdt',allowUsers('yw','dlhe','code','dy','now','new'), setdt);

//设置动态的标签
app.post('/dtindex', allowUsers('yw','dlhe'), dtindex);

//删除动态
app.post('/delDt', allowUsers('yw','dlhe'), delDts)




/**
 * --------------------------------------
 * 查询动态相关的内容
 */ 

//查询用户标签
app.get('/userIndex',userIndex);

//时间信息
app.get('/dtDate', dtDates);

//提供时间信息生成图表
app.get('/dtDataImg', dtDataImg);

//图
app.get("/dtimg", dtimg);

//评论图
app.get('/dtimgCom', dtimgCom);

//获取动态长文本数据
app.get('/getLongText', getLongText);

//小表情列表
app.get('/emojilist', getemojilist);

//小表情
app.get('/emoji', getemoji);



/**
 * --------------------------------------
 * 修改动态相关内容
 */ 

//修改背景样式
app.post('/setBgStyle', allowUsers('yw','dlhe'), setDtBgStyles);

//提交动态评论
app.post('/postCom', allowUsers('yw','dlhe','dy'), postCom);

//修改动态数据
app.post('/setDt', allowUsers('yw','dlhe'), setDts);

//分享动态
app.get('/getShare', getShare);

//设置分享
app.post('/setShare', allowUsers('yw','dlhe'), setShare);

//文件链接
app.get('/dtFile', dtFile);


/**
 * --------------------------------------
 * 其他
 */ 

//墨水屏图片生成
//app.get('/linksc', linksc)

//墨水屏图片数据请求
app.get('/linkScreenShow', linkScreenShow);

//墨水屏刷新控制
app.get('/linkScreenControl', linkScreenControl);

//获取用户位置
app.get('/gps', getweizhi);

//经纬度转地理位置
app.get('/gpsc', gpsc);

//长视频播放
app.get('/lvi', lvi);

//视频信息
app.get('/lviobj', lviobj);

//测试
app.get("/keepOcr", keepRun);

// 刷新redis
app.get('/upDtData', upDtData);

// 年份图片获取
app.get('/getYear', getYear);

//缓存相关
app.get('/getImgDB', getImgDB);






export default app;


