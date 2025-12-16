# 后端安装和启动指南

## 📋 前置要求

1. **Node.js** (版本 >= 14.x)
   - 下载地址: https://nodejs.org/

2. **MongoDB** (版本 >= 4.x)
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: 参考官方文档

## 🚀 安装步骤

### Step 1: 安装依赖

```bash
cd backend
npm install
```

### Step 2: 配置环境变量

在 `backend` 目录下创建 `.env` 文件（可以参考 `config/env.example.txt`）：

```env
MONGODB_URI=mongodb://localhost:27017/hr_management
JWT_SECRET=hr_management_secret_key_2025_change_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Step 3: 启动 MongoDB

#### Windows
```bash
# 使用服务
net start MongoDB

# 或手动启动
mongod --dbpath="C:\data\db"
```

#### macOS/Linux
```bash
# 使用服务
sudo systemctl start mongod

# 或使用 brew (macOS)
brew services start mongodb-community
```

### Step 4: 初始化测试数据

```bash
npm run seed
```

这将创建：
- 3级组织架构（总公司 → 技术研发中心 → 前端/后端开发部）
- 6个员工（包括2个部门负责人）
- 6个用户账号（1个管理员，2个boss，3个员工）
- 薪酬项目和发放记录

### Step 5: 启动服务器

```bash
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm start
```

看到以下输出表示启动成功：

```
✅ MongoDB Connected: localhost
📦 Database: hr_management
🚀 Server is running on port 5000
📝 Environment: development
🔗 API URL: http://localhost:5000
✅ Ready to handle requests
```

## 🧪 测试接口

### 1. 健康检查

```bash
curl http://localhost:5000/api/health
```

### 2. 登录测试

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangsan","password":"123456"}'
```

## 🔑 测试账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 完全权限 |
| 前端部门负责人 | boss_zhao | 123456 | 管理前端开发部 |
| 后端部门负责人 | boss_liu | 123456 | 管理后端开发部 |
| 普通员工 | zhangsan | 123456 | 张三 - 前端工程师 |
| 普通员工 | liming | 123456 | 李明 - 高级前端工程师 |
| 普通员工 | wangfang | 123456 | 王芳 - 前端工程师 |

## ❓ 常见问题

### 问题1: MongoDB 连接失败

**错误信息**: `MongoNetworkError: failed to connect to server`

**解决方案**:
1. 确认 MongoDB 已启动
2. 检查 `.env` 中的 `MONGODB_URI` 是否正确
3. 如果使用 MongoDB Atlas，确保 IP 白名单已配置

### 问题2: 端口已被占用

**错误信息**: `Error: listen EADDRINUSE: address already in use :::5000`

**解决方案**:
1. 修改 `.env` 中的 `PORT` 为其他端口
2. 或者关闭占用 5000 端口的程序

### 问题3: JWT 验证失败

**错误信息**: `Token 无效或已过期`

**解决方案**:
1. 重新登录获取新的 token
2. 确认请求头格式: `Authorization: Bearer <token>`

### 问题4: 权限不足

**错误信息**: `您无权访问该员工信息`

**解决方案**:
1. 确认当前用户角色
2. 机构负责人只能访问本机构的员工
3. 普通员工只能访问自己的信息

## 📝 开发模式

开发模式下，服务器会在代码更改时自动重启（使用 nodemon）：

```bash
npm run dev
```

## 🏭 生产部署

1. 修改环境变量：
```env
NODE_ENV=production
MONGODB_URI=<生产环境MongoDB连接字符串>
JWT_SECRET=<更安全的密钥>
```

2. 不要运行 `npm run seed`（避免覆盖生产数据）

3. 使用 PM2 等进程管理器：
```bash
npm install -g pm2
pm2 start server.js --name hr-backend
```

## 🔄 重置数据库

如需重新初始化数据：

```bash
# 停止服务器
# 删除 MongoDB 中的数据库（可选）
mongo hr_management --eval "db.dropDatabase()"

# 重新运行种子脚本
npm run seed
```

## 📞 需要帮助？

如果遇到问题：
1. 检查 MongoDB 是否正常运行
2. 检查 `.env` 配置是否正确
3. 查看控制台错误信息
4. 参考 README.md 中的 API 文档



