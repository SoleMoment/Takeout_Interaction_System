// WebSocket客户端连接模块
class ClassroomWebSocket {
    constructor() {
        this.ws = null;
        this.messageHandlers = [];
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.init();
    }

    init() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;

        try {
            this.ws = new WebSocket(wsUrl);

            // 设置二进制类型为文本
            this.ws.binaryType = 'blob';

            this.ws.onopen = () => {
                console.log('✅ WebSocket连接成功');
                this.connected = true;
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = async (event) => {
                try {
                    let messageText;

                    // 处理 Blob 类型的消息
                    if (event.data instanceof Blob) {
                        messageText = await event.data.text();
                    } else {
                        messageText = event.data;
                    }

                    const data = JSON.parse(messageText);
                    this.messageHandlers.forEach(handler => handler(data));
                } catch (error) {
                    console.error('消息解析错误:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket连接关闭');
                this.connected = false;
                this.reconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket错误:', error);
            };
        } catch (error) {
            console.error('WebSocket初始化失败:', error);
            this.reconnect();
        }
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.init(), 3000);
        } else {
            console.error('WebSocket重连失败，请刷新页面');
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket未连接，消息未发送');
        }
    }

    onMessage(handler) {
        this.messageHandlers.push(handler);
    }
}

// 全局实例
window.classroomWS = new ClassroomWebSocket();
