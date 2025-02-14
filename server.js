// server.js
const express = require('express');
const axios = require('axios');
const qs = require('qs'); // 引入 qs 库用于序列化参数
const cors = require('cors'); // 引入 cors 中间件解决跨域问题
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000; // 使用环境变量 PORT 或默认 3000

// 启用 CORS
app.use(cors());

// 抖音API配置
const DOUYIN_API_URL = 'https://apis.tianapi.com/douyinhot/index';
const DOUYIN_API_KEY = 'fe2eee57131f85134623ad958ae9214e';

// 微博API配置
const WEIBO_API_URL = 'https://apis.tianapi.com/weibohot/index';
const WEIBO_API_KEY = 'fe2eee57131f85134623ad958ae9214e';

// 国际新闻API配置
const WORLD_API_URL = 'https://apis.tianapi.com/world/index';
const WORLD_API_KEY = 'fe2eee57131f85134623ad958ae9214e';

// 头条新闻API配置
const TOPNEWS_API_URL = 'https://apis.tianapi.com/topnews/index';
const TOPNEWS_API_KEY = 'fe2eee57131f85134623ad958ae9214e';

// 财经新闻API配置
const CAIJING_API_URL = 'https://apis.tianapi.com/caijing/index';
const CAIJING_API_KEY = 'fe2eee57131f85134623ad958ae9214e';

// 腾讯新闻API配置
const WXHOTTOPIC_API_URL = 'https://apis.tianapi.com/wxhottopic/index';
const WXHOTTOPIC_API_KEY = 'fe2eee57131f85134623ad958ae9214e';

// 通用函数：调用 API 并解析数据
async function fetchHotTopics(apiUrl, apiKey, limit = 50) {
    try {
        const response = await axios.post(apiUrl, qs.stringify({
            key: apiKey,
            limit: limit
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.code === 200) {
            const result = response.data.result;
            const list = result.list || result.newslist || []; // 尝试解析不同的字段
            return list.map(item => ({
                title: item.title || item.word || item.hotword || '未知标题',
                hotindex: item.hotindex || item.hotwordnum || item.index || 0,
                label: item.label || item.hottag || item.source || '无标签',
                link: item.url || '#', // 确保每条新闻都有链接
                platform: apiUrl.includes('douyin') ? 'douyin' :
                          apiUrl.includes('weibo') ? 'weibo' :
                          apiUrl.includes('world') ? 'world' :
                          apiUrl.includes('topnews') ? 'topnews' :
                          apiUrl.includes('caijing') ? 'caijing' :
                          apiUrl.includes('wxhottopic') ? 'wxhottopic' : 'unknown'
            }));
        } else {
            console.error(`Error fetching data from ${apiUrl}:`, response.data);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching data from ${apiUrl}:`, error.response ? error.response.data : error.message);
        return [];
    }
}

// 创建API路由
app.get('/api/hot-topics', async (req, res) => {
    const douyinTopics = await fetchHotTopics(DOUYIN_API_URL, DOUYIN_API_KEY, 50); // 获取抖音热点数据
    const weiboTopics = await fetchHotTopics(WEIBO_API_URL, WEIBO_API_KEY, 50);   // 获取微博热点数据
    const worldTopics = await fetchHotTopics(WORLD_API_URL, WORLD_API_KEY, 50);   // 获取国际新闻数据
    const topnewsTopics = await fetchHotTopics(TOPNEWS_API_URL, TOPNEWS_API_KEY, 50);   // 获取头条新闻数据
    const caijingTopics = await fetchHotTopics(CAIJING_API_URL, CAIJING_API_KEY, 50);   // 获取财经新闻数据
    const wxhottopicTopics = await fetchHotTopics(WXHOTTOPIC_API_URL, WXHOTTOPIC_API_KEY, 50);   // 获取腾讯热点数据

    res.json({
        douyin: douyinTopics,
        weibo: weiboTopics,
        world: worldTopics,
        topnews: topnewsTopics,
        caijing: caijingTopics,
        wxhottopic: wxhottopicTopics
    });
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});