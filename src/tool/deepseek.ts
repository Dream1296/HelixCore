const axios = require('axios');

// DeepSeek API 的 URL 和 API Key
const DEEPSEEK_API_URL = 'https://api.deepseek.com'; // 替换为实际的 API 地址
const API_KEY = 'sk-7bd987a3fae7440983b6d6d6e203b08d'; // 替换为你的 API Key

// 调用 DeepSeek API 的函数
async function callDeepSeekAPI(data:any) {
    try {
        const response = await axios.post(DEEPSEEK_API_URL, data, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // 返回 API 的响应数据
        return response.data;
    } catch (error) {
        // console.error('Error calling DeepSeek API:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 示例调用
(async () => {
    const requestData = {
        // 根据 DeepSeek API 的要求填写请求参数
        prompt: "What is the capital of France?",
        max_tokens: 50
    };

    try {
        const result = await callDeepSeekAPI(requestData);
        console.log('API Response:', result);
    } catch (error) {
        console.error('Failed to call API:', error);
    }
})();