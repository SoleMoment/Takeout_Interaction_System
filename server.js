const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 存储所有连接的客户端
const clients = new Map();

// 数据目录配置
const DATA_DIR = path.join(__dirname, 'data');
const LESSON1_DIR = path.join(DATA_DIR, 'lesson1');
const LESSON2_DIR = path.join(DATA_DIR, 'lesson2');

// 确保数据目录存在
async function ensureDataDirectories() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.mkdir(LESSON1_DIR, { recursive: true });
        await fs.mkdir(LESSON2_DIR, { recursive: true });
        console.log('✓ 数据目录初始化完成');
    } catch (error) {
        console.error('数据目录创建失败:', error);
    }
}

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 路由配置
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/lesson1/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lesson1_student.html'));
});

app.get('/lesson1/teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lesson1_teacher.html'));
});

app.get('/lesson3/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lesson3_student.html'));
});

app.get('/lesson3/teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lesson3_teacher.html'));
});

// ==================== 数据存储API ====================

// 保存学生数据
app.post('/api/save-student-data/:lesson/:username', async (req, res) => {
    try {
        const { lesson, username } = req.params;
        const data = req.body;

        // 验证课程编号
        if (lesson !== 'lesson1' && lesson !== 'lesson2') {
            return res.status(400).json({ error: '无效的课程编号' });
        }

        // 确定保存目录
        const lessonDir = lesson === 'lesson1' ? LESSON1_DIR : LESSON2_DIR;

        // 文件名使用用户名（安全处理）
        const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filePath = path.join(lessonDir, `${safeUsername}.json`);

        // 添加时间戳
        data.lastModified = new Date().toISOString();

        // 保存数据
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

        console.log(`✓ 保存数据: ${lesson}/${safeUsername}.json`);
        res.json({ success: true, message: '数据保存成功' });
    } catch (error) {
        console.error('保存数据失败:', error);
        res.status(500).json({ error: '数据保存失败', details: error.message });
    }
});

// 读取学生数据
app.get('/api/load-student-data/:lesson/:username', async (req, res) => {
    try {
        const { lesson, username } = req.params;

        // 验证课程编号
        if (lesson !== 'lesson1' && lesson !== 'lesson2') {
            return res.status(400).json({ error: '无效的课程编号' });
        }

        // 确定读取目录
        const lessonDir = lesson === 'lesson1' ? LESSON1_DIR : LESSON2_DIR;

        // 文件名使用用户名（安全处理）
        const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filePath = path.join(lessonDir, `${safeUsername}.json`);

        // 检查文件是否存在
        try {
            await fs.access(filePath);
        } catch {
            // 文件不存在，返回空数据
            console.log(`⚠ 数据文件不存在: ${lesson}/${safeUsername}.json`);
            return res.json({ exists: false, data: null });
        }

        // 读取数据
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        console.log(`✓ 读取数据: ${lesson}/${safeUsername}.json`);
        res.json({ exists: true, data });
    } catch (error) {
        console.error('读取数据失败:', error);
        res.status(500).json({ error: '数据读取失败', details: error.message });
    }
});

// 获取某课程的所有学生数据（用于教师端）
app.get('/api/get-all-students/:lesson', async (req, res) => {
    try {
        const { lesson } = req.params;

        // 验证课程编号
        if (lesson !== 'lesson1' && lesson !== 'lesson2') {
            return res.status(400).json({ error: '无效的课程编号' });
        }

        // 确定读取目录
        const lessonDir = lesson === 'lesson1' ? LESSON1_DIR : LESSON2_DIR;

        // 读取目录中的所有JSON文件
        const files = await fs.readdir(lessonDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        // 读取所有学生数据
        const studentsData = [];
        for (const file of jsonFiles) {
            const filePath = path.join(lessonDir, file);
            const fileContent = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            studentsData.push(data);
        }

        console.log(`✓ 读取所有学生数据: ${lesson} (${studentsData.length}名学生)`);
        res.json({ success: true, count: studentsData.length, students: studentsData });
    } catch (error) {
        console.error('读取所有学生数据失败:', error);
        res.status(500).json({ error: '数据读取失败', details: error.message });
    }
});

// ==================== WebSocket连接处理 ====================

wss.on('connection', (ws, req) => {
    const clientId = Date.now() + Math.random();
    clients.set(clientId, ws);
    
    console.log(`新客户端连接: ${clientId}, 当前在线: ${clients.size}`);

    // 接收消息并广播
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('收到消息:', data.type);
            
            // 广播给所有其他客户端
            clients.forEach((client, id) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } catch (error) {
            console.error('消息处理错误:', error);
        }
    });

    // 连接关闭
    ws.on('close', () => {
        clients.delete(clientId);
        console.log(`客户端断开: ${clientId}, 当前在线: ${clients.size}`);
    });

    // 错误处理
    ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
        clients.delete(clientId);
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', async () => {
    // 初始化数据目录
    await ensureDataDirectories();

    console.log('='.repeat(60));
    console.log('🚀 校园外卖守护大作战 - 教学系统服务器');
    console.log('='.repeat(60));
    console.log(`📡 服务器地址: http://localhost:${PORT}`);
    console.log(`🌐 局域网访问: http://[本机IP]:${PORT}`);
    console.log('');
    console.log('📚 访问地址:');
    console.log(`   首页导航: http://[本机IP]:${PORT}/`);
    console.log(`   第一课学生端: http://[本机IP]:${PORT}/lesson1/student`);
    console.log(`   第一课教师端: http://[本机IP]:${PORT}/lesson1/teacher`);
    console.log(`   第三课学生端: http://[本机IP]:${PORT}/lesson3/student`);
    console.log(`   第三课教师端: http://[本机IP]:${PORT}/lesson3/teacher`);
    console.log('');
    console.log('💾 数据存储:');
    console.log(`   数据目录: ${DATA_DIR}`);
    console.log(`   第一课数据: ${LESSON1_DIR}`);
    console.log(`   第二课数据: ${LESSON2_DIR}`);
    console.log('');
    console.log('💡 提示:');
    console.log('   1. 将 [本机IP] 替换为教师机的实际IP地址');
    console.log('   2. 查看本机IP: Windows输入 ipconfig, Mac/Linux输入 ifconfig');
    console.log('   3. 确保防火墙允许端口 3000 的访问');
    console.log('   4. 学生数据将自动保存到本地JSON文件');
    console.log('='.repeat(60));
});
