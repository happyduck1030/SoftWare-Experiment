# 🚀 5分钟快速上手指南

## ✅ 已完成的工作

后端已经完全配置好，包括：

- ✨ MongoDB 数据模型（7个集合）
- 🔐 完整的用户认证系统（JWT）
- 👥 员工自助功能 API
- 👑 机构负责人管理功能 API
- 🛡️ 权限控制中间件
- 📊 管理员功能 API
- 🌱 测试数据种子脚本

## 🎯 立即开始

### 1️⃣ 确保 MongoDB 已安装并运行

```bash
# Windows: 检查 MongoDB 是否运行
tasklist | findstr "mongod"

# 如果没有运行，启动它
net start MongoDB
```

如果还没有安装 MongoDB：
- 下载地址: https://www.mongodb.com/try/download/community
- 或使用 MongoDB Atlas 云服务（免费）

### 2️⃣ 创建环境变量文件

在 `backend` 目录创建 `.env` 文件：

```env
MONGODB_URI=mongodb://localhost:27017/hr_management
JWT_SECRET=hr_management_secret_key_2025
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3️⃣ 初始化测试数据

```bash
npm run seed
```

### 4️⃣ 启动服务器

```bash
npm run dev
```

看到以下输出表示成功：
```
✅ MongoDB Connected
🚀 Server is running on port 5000
```

## 🧪 测试 API

### 使用 Postman 或浏览器测试

1. **健康检查**
```
GET http://localhost:5000/api/health
```

2. **登录（获取 token）**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "zhangsan",
  "password": "123456"
}
```

3. **获取个人信息（需要 token）**
```
GET http://localhost:5000/api/employee/archive
Authorization: Bearer <your_token_here>
```

## 👥 测试账号速查

```
管理员：admin / admin123
Boss（前端部门）：boss_zhao / 123456
Boss（后端部门）：boss_liu / 123456
员工（张三）：zhangsan / 123456
员工（李明）：liming / 123456
员工（王芳）：wangfang / 123456
```

## 📱 前端对接关键点

### 1. 登录流程

```javascript
// 登录
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'zhangsan', password: '123456' })
});

const data = await response.json();

// 保存 token
localStorage.setItem('token', data.data.token);

// 保存用户信息
localStorage.setItem('user', JSON.stringify(data.data.user));
```

### 2. 携带 Token 请求

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:5000/api/employee/archive', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. 根据角色显示菜单

```javascript
const user = JSON.parse(localStorage.getItem('user'));

// 如果是机构负责人，显示"下属管理"菜单
if (user.isBoss) {
  // 显示下属管理菜单
}

// 如果是管理员，显示管理功能
if (user.role === 'admin') {
  // 显示管理员菜单
}
```

## 📊 登录返回的用户信息结构

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "65f...",
      "username": "zhangsan",
      "role": "employee",
      "isBoss": false,
      "employeeId": "65f...",
      "name": "张三",
      "position": "前端工程师",
      "organizationPath": {
        "level1": "华宇集团总公司",
        "level2": "技术研发中心",
        "level3": "前端开发部"
      },
      "organizationIds": ["65f...", "65f...", "65f..."],
      "supervisors": {
        "level1Boss": null,
        "level2Boss": null,
        "level3Boss": {
          "name": "赵主管",
          "position": "前端负责人",
          "phone": "13900003333"
        }
      },
      "bossOfOrganizationId": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 🔑 关键字段说明

- `user.isBoss`: 是否是机构负责人（用于显示"下属管理"菜单）
- `user.role`: 角色（admin/boss/employee）
- `user.organizationPath`: 完整的机构层级路径
- `user.supervisors`: 各级上级领导信息
- `user.bossOfOrganizationId`: 如果是boss，这是其负责的机构ID

## 🎨 前端页面对应的 API

| 前端页面 | API 端点 | 说明 |
|---------|---------|------|
| 个人档案 | GET /api/employee/archive | 获取个人档案 |
| 组织架构 | GET /api/employee/organization | 获取机构和上级信息 |
| 薪酬记录 | GET /api/employee/salary | 获取个人薪酬 |
| 下属管理-列表 | GET /api/employee/subordinates | 获取下属列表 |
| 下属管理-详情 | GET /api/employee/subordinates/:id | 获取下属详情 |
| 下属管理-编辑 | PUT /api/employee/subordinates/:id | 更新下属信息 |
| 下属管理-薪酬 | GET /api/employee/subordinates/:id/salary | 查看下属薪酬 |

## ⚡ 下一步

1. ✅ 后端已完成，现在可以开始前端对接
2. 📝 参考 `README.md` 查看完整 API 文档
3. 🔍 使用 Postman 测试所有 API
4. 🎨 更新前端页面，调用真实 API

## 💡 提示

- Boss（负责人）可以查看和更新下属的信息
- Boss 可以看到下属的薪酬总额，但看不到明细
- 普通员工只能看自己的完整信息
- 所有接口都有权限控制，安全可靠

## 🆘 遇到问题？

查看 `INSTALL.md` 中的"常见问题"部分，或参考详细的 `README.md`



