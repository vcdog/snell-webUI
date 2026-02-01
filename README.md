# Snell Panel Web UI

一个现代化、美观的 Snell 代理节点管理面板前端界面。

## 📸 预览

![Snell Panel Login Preview](https://img1.ijeko.com/snell-webui/20260131214855_38_2.png)

![Snell Panel Main Preview](https://img1.ijeko.com/snell-webui/20260131215623_39_2.png)



## ✨ 特性

- 🎨 **现代化设计** - 采用 Glassmorphism 设计风格，渐变背景，流畅动画
- 📱 **响应式布局** - 完美适配桌面端和移动端
- 🔒 **多重安全** - 独立的登录页面，支持会话管理与 API Token 双重认证
- 🌍 **多语言支持** - 支持中文界面
- 🚀 **高性能** - 纯原生 JavaScript，无框架依赖

## 🎯 功能

### 身份验证
- ✅ 用户名密码登录保护
- ✅ 独立的登录页面
- ✅ 会话状态管理 (Session Storage)
- ✅ 记住我功能 (Local Storage)

### 节点管理
- ✅ 查看所有节点列表
- ✅ 添加新节点
- ✅ 编辑节点信息
- ✅ 删除节点
- ✅ 按名称搜索筛选

### 订阅管理
- ✅ 生成 Surge 兼容的订阅链接
- ✅ 支持中转节点 (via) 参数
- ✅ 支持按名称筛选节点
- ✅ 可选显示国家旗帜
- ✅ 一键复制订阅链接

### API 配置
- ✅ 自定义 API URL
- ✅ API Token 认证
- ✅ 配置本地持久化存储
- ✅ 密码显示/隐藏切换

## 🚀 快速开始

### 方法 1: 直接打开

双击 `index.html` 或 `login.html` 文件在浏览器中打开。系统会自动重定向到正确的页面。

> ⚠️ 注意: 由于浏览器安全策略限制，某些功能（如剪贴板复制）可能需要通过 HTTP 服务器访问。

### 方法 2: 使用 HTTP 服务器 (推荐)

#### 使用 Python

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### 使用 Node.js

```bash
# 安装 serve
npm install -g serve

# 启动服务器
serve .
```

#### 使用 VS Code Live Server

1. 安装 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 扩展
2. 右键点击 `index.html` -> "Open with Live Server"

### 方法 3: 部署到 Web 服务器

将以下文件部署到任意 Web 服务器：

```
snell-webUI/
├── login.html
├── index.html
├── styles.css
└── app.js
```

## 📖 使用说明

### 1. 登录系统

1. 打开应用，进入登录界面
2. 输入默认用户名: `admin`
3. 输入默认密码: `admin`
4. (可选) 勾选 "记住我" 保持登录状态
5. 点击登录进入主界面

### 2. 配置 API (首次登录)

1. 登录成功后，若未检测到 API 配置，系统会提示空状态
2. 点击 **"配置 API"** 按钮
3. 输入您的 Snell Panel 后端 API URL（例如: `https://api.example.com`）
4. 输入 API Token
5. 点击 **"保存设置"**

### 3. 添加节点

1. 确保已配置 API
2. 点击 **"添加节点"** 按钮
3. 填写节点信息：
   - 节点名称（可选）
   - IP 地址或域名
   - 端口号
   - PSK 密钥
   - 协议版本
4. 点击 **"保存节点"**

### 4. 生成订阅链接

1. 点击 **"生成订阅链接"** 按钮
2. 可选配置：
   - **中转节点 (Via)**: 为所有节点添加 underlying-proxy 参数
   - **节点筛选**: 按名称关键字筛选节点
   - **显示国家旗帜**: 是否在节点名称前显示国旗 emoji
3. 点击复制按钮复制链接

## 🔧 API 接口

Web UI 调用以下后端 API 接口：

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/entries` | 获取所有节点 |
| `POST` | `/entry` | 创建新节点 |
| `PUT` | `/modify/:id` | 更新节点 |
| `DELETE` | `/entry/node/:node_id` | 删除节点 |
| `GET` | `/subscribe` | 获取订阅链接 |

## 📁 项目结构

```
snell-webUI/
├── login.html      # 登录页面 HTML
├── index.html      # 主页面 HTML
├── styles.css      # 样式文件
├── app.js          # JavaScript 应用逻辑
└── README.md       # 说明文档
```

## 🎨 设计特点

- **渐变背景动画**: 使用 CSS 动画实现流动的渐变效果
- **玻璃拟态设计**: 半透明卡片配合模糊效果
- **微交互动画**: 按钮悬停、加载状态、Toast 通知
- **响应式网格**: CSS Grid 和 Flexbox 布局
- **暗色主题支持**: 可轻松扩展支持暗色模式

## 🔐 安全说明

- **双重防护**: 登录会话与 API Token 分离存储
- **会话安全**: 默认使用 Session Storage，关闭浏览器即退出
- API Token 存储在浏览器 LocalStorage 中以便持久使用
- 建议使用 HTTPS 部署确保传输安全
- 定期更换 API Token

## 🌐 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系

- GitHub: [missuo](https://github.com/missuo)
- Telegram: [@missuo](https://t.me/missuo)
