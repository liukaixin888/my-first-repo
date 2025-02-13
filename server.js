// server.js
const express = require('express');
const axios = require('axios');
const qs = require('qs'); // 引入 qs 库用于序列化参数
const cors = require('cors'); // 引入 cors 中间件解决跨域问题
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // 使用环境变量 PORT 或默认 3000

// 抖音API配置
const DOUYIN_API_URL = 'https://apis.tianapi.com/douyinhot/index'; // 替换为实际的抖音API URL
const DOUYIN_API_KEY = 'fe2eee57131f85134623ad958ae9214e'; // 替换为你的抖音API密钥

// 微博API配置
const WEIBO_API_URL = 'https://apis.tianapi.com/wxhottopic/index'; // 替换为实际的微博API URL
const WEIBO_API_KEY = 'fe2eee57131f85134623ad958ae9214e'; // 替换为你的微博API密钥

// 调用抖音API获取热点数据
async function fetchDouyinHotTopics() {
    try {
        const response = await axios.post(DOUYIN_API_URL, qs.stringify({
            key: DOUYIN_API_KEY,
            limit: 50
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.code === 200) {
            return (response.data.result.list || []).map(item => ({
                title: item.word || '未知标题',
                hotindex: item.hotindex || 0,
                label: item.label || '无标签',
                platform: 'douyin' // 标记来源为抖音
            }));
        } else {
            console.error('Error fetching Douyin hot topics:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching Douyin hot topics:', error.response ? error.response.data : error.message);
        return [];
    }
}

// 调用微博API获取热点数据
async function fetchWeiboHotTopics() {
    try {
        const response = await axios.post(WEIBO_API_URL, qs.stringify({
            key: WEIBO_API_KEY,
            limit: 50
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.code === 200) {
            return (response.data.result.list || []).map(item => ({
                title: item.title || '未知标题', // 假设微博API字段名为 title
                hotindex: item.hot || 0,         // 假设微博API字段名为 hot
                label: item.category || '无标签', // 假设微博API字段名为 category
                platform: 'weibo'                 // 标记来源为微博
            }));
        } else {
            console.error('Error fetching Weibo hot topics:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching Weibo hot topics:', error.response ? error.response.data : error.message);
        return [];
    }
}

// 创建API路由
app.get('/api/hot-topics', async (req, res) => {
    const douyinTopics = await fetchDouyinHotTopics(); // 获取抖音热点数据
    const weiboTopics = await fetchWeiboHotTopics();   // 获取微博热点数据

    res.json({
        douyin: douyinTopics, // 返回抖音热点数据
        weibo: weiboTopics    // 返回微博热点数据
    });
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});