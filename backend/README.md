# 人力资源管理系统 - 后端 API

基于 Express + Node.js + MongoDB 的人力资源管理系统后端服务

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `config/env.example.txt` 内容创建 `.env` 文件：

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/hr_management

# JWT Secret
JWT_SECRET=hr_management_secret_key_2025_change_in_production
JWT_EXPIRE=7d

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# CORS Origin (frontend URL)
CORS_ORIGIN=http://localhost:5173
```

### 3. 确保 MongoDB 已启动

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. 初始化测试数据

```bash
npm run seed
```

这将创建测试组织架构、员工和用户账号。

### 5. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将运行在 `http://localhost:5000`

## 📝 测试账号

### 管理员
- **用户名**: admin
- **密码**: admin123
- **权限**: 完全管理权限

### 前端部门负责人（Boss）
- **用户名**: boss_zhao
- **密码**: 123456
- **姓名**: 赵主管
- **权限**: 管理前端开发部的员工

### 后端部门负责人（Boss）
- **用户名**: boss_liu
- **密码**: 123456
- **姓名**: 刘经理
- **权限**: 管理后端开发部的员工

### 普通员工
- **用户名**: zhangsan
- **密码**: 123456
- **姓名**: 张三

- **用户名**: liming
- **密码**: 123456
- **姓名**: 李明

- **用户名**: wangfang
- **密码**: 123456
- **姓名**: 王芳

## 📚 API 文档

### 认证相关

#### POST /api/auth/register
注册新用户

#### POST /api/auth/login
用户登录

请求体：
```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

响应：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "...",
      "username": "zhangsan",
      "role": "employee",
      "isBoss": false,
      "employeeId": "...",
      "name": "张三",
      "position": "前端工程师",
      "organizationPath": {
        "level1": "华宇集团总公司",
        "level2": "技术研发中心",
        "level3": "前端开发部"
      },
      "supervisors": {
        "level1Boss": {...},
        "level2Boss": {...},
        "level3Boss": {...}
      }
    },
    "token": "jwt_token_here"
  }
}
```

#### GET /api/auth/me
获取当前用户信息（需要登录）

Headers:
```
Authorization: Bearer <token>
```

### 员工自助功能

#### GET /api/employee/archive
获取个人档案信息

#### PUT /api/employee/archive
更新个人可编辑信息（电话、邮箱等）

#### GET /api/employee/salary
获取个人薪酬记录

#### GET /api/employee/organization
获取组织架构信息和上级领导信息

### 下属管理功能（机构负责人）

#### GET /api/employee/subordinates
获取下属员工列表

#### GET /api/employee/subordinates/:id
获取下属员工详情

#### PUT /api/employee/subordinates/:id
更新下属员工信息

请求体：
```json
{
  "phone": "13800001111",
  "email": "newemail@example.com",
  "status": "在职"
}
```

#### GET /api/employee/subordinates/:id/salary
查看下属员工薪酬汇总（只显示总额，不显示明细）

### 管理员功能

#### 机构管理

- GET /api/admin/organizations - 获取机构列表
- GET /api/admin/organizations/tree - 获取机构树
- GET /api/admin/organizations/:id - 获取机构详情
- POST /api/admin/organizations - 创建机构
- PUT /api/admin/organizations/:id - 更新机构
- DELETE /api/admin/organizations/:id - 删除机构

#### 职位管理

- GET /api/admin/positions - 获取职位列表
- GET /api/admin/positions/:id - 获取职位详情
- POST /api/admin/positions - 创建职位
- PUT /api/admin/positions/:id - 更新职位
- DELETE /api/admin/positions/:id - 删除职位

#### 档案管理

- GET /api/admin/archives - 获取档案列表
- GET /api/admin/archives/:id - 获取档案详情
- POST /api/admin/archives - 登记新员工档案
- PUT /api/admin/archives/:id - 更新员工档案
- PUT /api/admin/archives/:id/review - 复核员工档案
- DELETE /api/admin/archives/:id - 删除员工档案

## 🔐 权限说明

### 角色类型

1. **admin** - 管理员
   - 拥有所有权限
   - 可以管理机构、职位、员工档案、薪酬等

2. **boss** - 机构负责人
   - 查看和管理本机构下的员工
   - 可以更新下属的基本信息（电话、邮箱、工作状态等）
   - 可以查看下属的薪酬总额（不含明细）
   - 不能修改核心信息（身份证号、薪酬标准等）

3. **employee** - 普通员工
   - 查看个人档案
   - 查看个人薪酬记录
   - 更新个人联系方式
   - 查看组织架构和上级信息

### 权限控制

所有接口都通过中间件进行权限控制：

- `protect` - 验证 JWT Token，确保用户已登录
- `isAdmin` - 验证管理员权限
- `isBoss` - 验证机构负责人权限
- `canAccessEmployee` - 验证是否可以访问员工信息
- `canUpdateEmployee` - 验证是否可以修改员工信息

## 📊 数据库设计

### 主要集合

1. **organizations** - 机构表
   - 支持三级结构（总公司 → 分中心 → 部门）
   - 包含机构负责人字段

2. **positions** - 职位表
   - 归属于三级机构
   - 一个机构可以有多个职位

3. **employees** - 员工表
   - 关联职位
   - 包含档案信息、复核状态

4. **users** - 用户表
   - 关联员工
   - 包含角色信息

5. **salary_items** - 薪酬项目表
   - 定义薪酬组成部分

6. **salary_standards** - 薪酬标准表
   - 定义职位的薪酬标准

7. **salary_payments** - 薪酬发放表
   - 记录实际发放记录

## 🛠️ 技术栈

- **Node.js** - JavaScript 运行环境
- **Express** - Web 框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB ODM
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **CORS** - 跨域资源共享

## 📂 项目结构

```
backend/
├── config/              # 配置文件
│   └── database.js      # 数据库连接配置
├── controllers/         # 控制器
│   ├── admin/          # 管理员功能控制器
│   ├── authController.js
│   └── employeeController.js
├── middleware/          # 中间件
│   ├── auth.js         # 认证中间件
│   └── errorHandler.js # 错误处理
├── models/             # 数据模型
│   ├── Organization.js
│   ├── Position.js
│   ├── Employee.js
│   ├── User.js
│   ├── SalaryItem.js
│   ├── SalaryStandard.js
│   └── SalaryPayment.js
├── routes/             # 路由
│   ├── authRoutes.js
│   ├── employeeRoutes.js
│   └── adminRoutes.js
├── scripts/            # 脚本
│   └── seed.js        # 种子数据
├── utils/              # 工具函数
│   ├── generateToken.js
│   └── responseFormatter.js
├── .env               # 环境变量（需手动创建）
├── .gitignore
├── package.json
├── README.md
└── server.js          # 服务器入口
```

## 🔍 开发建议

### 前端对接

1. 登录后保存 token 到 localStorage
2. 每次请求在 Header 中携带 token：
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

3. 根据返回的用户信息动态显示菜单：
   - `user.isBoss === true` 时显示"下属管理"菜单
   - `user.role === 'admin'` 时显示管理员菜单

### 测试建议

1. 使用 Postman 或类似工具测试 API
2. 先运行 `npm run seed` 创建测试数据
3. 使用提供的测试账号登录
4. 测试不同角色的权限控制

## ⚠️ 注意事项

1. **生产环境**请修改 JWT_SECRET 为更安全的密钥
2. 确保 MongoDB 已正确安装和启动
3. 首次运行请执行 `npm run seed` 创建测试数据
4. 所有敏感信息都已通过权限控制保护

## 📞 问题反馈

如有问题，请检查：
1. MongoDB 是否正常运行
2. 环境变量是否正确配置
3. Node.js 版本是否 >= 14
4. 依赖包是否正确安装



