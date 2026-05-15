const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const STRAPI_URL = "https://dazzling-family-6d1f24102d.strapiapp.com";
const VIDEO_DIR = "D:\\blog\\video\\H264";
const ENV_PATH = "d:\\blog\\portfolio\\frontend-v2\\.env.local";

async function uploadVideos() {
    // 1. 获取并清洗 Token
    let envContent = fs.readFileSync(ENV_PATH, 'utf8');
    
    // 如果读取出来是空的或者有乱码，尝试重新处理
    // 强制去掉所有空格、制表符、换行以及不可见字符
    const sanitized = envContent.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, '');
    
    let token = "";
    const tokenMatch = sanitized.match(/STRAPI_ADMIN_TOKEN=([a-f0-9]+)/);
    if (!tokenMatch) {
        // 尝试另一种方式：如果它是 UTF-16 LE
        const buffer = fs.readFileSync(ENV_PATH);
        const utf16Content = buffer.toString('utf16le');
        const sanitized16 = utf16Content.replace(/\s+/g, '');
        const tokenMatch16 = sanitized16.match(/STRAPI_ADMIN_TOKEN=([a-f0-9]+)/);
        
        if (!tokenMatch16) {
            console.error("无法在 .env.local 中找到 STRAPI_ADMIN_TOKEN。内容长度:", sanitized.length);
            return;
        }
        token = tokenMatch16[1];
    } else {
        token = tokenMatch[1];
    }
    console.log("Token 已识别并准备就绪。");

    // 2. 读取视频文件 (重试顽固文件)
    const files = ["temp_upload.mp4"];
    console.log(`正在重试上传重命名后的顽固文件...`);

    for (const file of files) {
        const filePath = path.join(VIDEO_DIR, file);
        console.log(`正在上传: ${file} ...`);

        const form = new FormData();
        form.append('files', fs.createReadStream(filePath));

        try {
            const response = await axios.post(`${STRAPI_URL}/api/upload`, form, {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${token}`
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 300000 // 5 minutes
            });
            console.log(`✅ 成功: ${file} (ID: ${response.data[0].id})`);
        } catch (error) {
            console.error(`❌ 失败: ${file}`, error.response?.data || error.message);
        }
    }
}

uploadVideos();
