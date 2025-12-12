import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';

// 导入模型
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Organization from '../models/Organization.js';
import Position from '../models/Position.js';
import SalaryItem from '../models/SalaryItem.js';
import SalaryStandard from '../models/SalaryStandard.js';
import SalaryPayment from '../models/SalaryPayment.js';

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

const seedData = async () => {
  try {
    console.log('🌱 开始清空数据库...');
    
    // 清空所有集合
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Organization.deleteMany({});
    await Position.deleteMany({});
    await SalaryItem.deleteMany({});
    await SalaryStandard.deleteMany({});
    await SalaryPayment.deleteMany({});

    console.log('✅ 数据库已清空');
    console.log('🌱 开始创建种子数据...\n');

    // 1. 创建机构
    console.log('📁 创建机构...');
    const org1 = await Organization.create({
      org_name: '华宇集团总公司',
      org_level: 1,
      parent_org_id: null
    });

    const org2 = await Organization.create({
      org_name: '技术研发中心',
      org_level: 2,
      parent_org_id: org1._id
    });

    const org3 = await Organization.create({
      org_name: '前端开发部',
      org_level: 3,
      parent_org_id: org2._id
    });

    const org4 = await Organization.create({
      org_name: '后端开发部',
      org_level: 3,
      parent_org_id: org2._id
    });

    console.log(`✅ 创建了 ${await Organization.countDocuments()} 个机构\n`);

    // 2. 创建职位
    console.log('💼 创建职位...');
    const pos1 = await Position.create({
      pos_name: '前端开发部负责人',
      org_id: org3._id,
      description: '负责前端开发部的管理工作'
    });

    const pos2 = await Position.create({
      pos_name: '高级前端工程师',
      org_id: org3._id,
      description: '负责前端开发工作'
    });

    const pos3 = await Position.create({
      pos_name: '前端工程师',
      org_id: org3._id,
      description: '负责前端开发工作'
    });

    const pos4 = await Position.create({
      pos_name: '后端开发部负责人',
      org_id: org4._id,
      description: '负责后端开发部的管理工作'
    });

    const pos5 = await Position.create({
      pos_name: '后端工程师',
      org_id: org4._id,
      description: '负责后端开发工作'
    });

    console.log(`✅ 创建了 ${await Position.countDocuments()} 个职位\n`);

    // 3. 创建员工
    console.log('👥 创建员工...');
    
    // 前端部门负责人
    const emp1 = await Employee.create({
      name: '赵主管',
      gender: '男',
      id_card: '110101199001011234',
      phone: '13900003333',
      email: 'zhaozg@example.com',
      hire_date: new Date('2020-01-15'),
      pos_id: pos1._id,
      status: '在职',
      education: '本科',
      address: '北京市朝阳区xxx街道xxx号',
      emergency_contact: '赵太太',
      emergency_phone: '13900003334',
      reviewed: true
    });

    // 更新机构负责人
    org3.manager_emp_id = emp1._id;
    await org3.save();

    // 高级前端工程师
    const emp2 = await Employee.create({
      name: '李明',
      gender: '男',
      id_card: '110101199201012345',
      phone: '13800001111',
      email: 'liming@example.com',
      hire_date: new Date('2023-03-15'),
      pos_id: pos2._id,
      status: '在职',
      education: '硕士',
      address: '北京市海淀区xxx路xxx号',
      emergency_contact: '李父',
      emergency_phone: '13800001112',
      reviewed: true
    });

    // 前端工程师
    const emp3 = await Employee.create({
      name: '王芳',
      gender: '女',
      id_card: '110101199301013456',
      phone: '13800002222',
      email: 'wangfang@example.com',
      hire_date: new Date('2023-06-20'),
      pos_id: pos3._id,
      status: '在职',
      education: '本科',
      address: '北京市西城区xxx街xxx号',
      emergency_contact: '王母',
      emergency_phone: '13800002223',
      reviewed: true
    });

    // 张三 - 普通前端工程师
    const emp4 = await Employee.create({
      name: '张三',
      gender: '男',
      id_card: '110101199401014567',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      hire_date: new Date('2024-01-15'),
      pos_id: pos3._id,
      status: '在职',
      education: '本科',
      address: '北京市朝阳区xxx街道xxx号',
      emergency_contact: '李四',
      emergency_phone: '13900139000',
      reviewed: true
    });

    // 后端部门负责人
    const emp5 = await Employee.create({
      name: '刘经理',
      gender: '男',
      id_card: '110101198801015678',
      phone: '13900004444',
      email: 'liujl@example.com',
      hire_date: new Date('2019-05-10'),
      pos_id: pos4._id,
      status: '在职',
      education: '硕士',
      address: '北京市东城区xxx路xxx号',
      emergency_contact: '刘太太',
      emergency_phone: '13900004445',
      reviewed: true
    });

    // 更新机构负责人
    org4.manager_emp_id = emp5._id;
    await org4.save();

    // 后端工程师
    const emp6 = await Employee.create({
      name: '陈静',
      gender: '女',
      id_card: '110101199501016789',
      phone: '13800004444',
      email: 'chenjing@example.com',
      hire_date: new Date('2023-09-01'),
      pos_id: pos5._id,
      status: '在职',
      education: '本科',
      address: '北京市丰台区xxx街xxx号',
      emergency_contact: '陈父',
      emergency_phone: '13800004445',
      reviewed: true
    });

    console.log(`✅ 创建了 ${await Employee.countDocuments()} 个员工\n`);

    // 4. 创建用户
    console.log('👤 创建用户账号...');
    
    // 管理员账号
    await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });

    // 前端部门负责人账号（boss）
    await User.create({
      username: 'boss_zhao',
      password: '123456',
      emp_id: emp1._id,
      role: 'boss'
    });

    // 后端部门负责人账号（boss）
    await User.create({
      username: 'boss_liu',
      password: '123456',
      emp_id: emp5._id,
      role: 'boss'
    });

    // 张三的普通员工账号
    await User.create({
      username: 'zhangsan',
      password: '123456',
      emp_id: emp4._id,
      role: 'employee'
    });

    // 李明的普通员工账号
    await User.create({
      username: 'liming',
      password: '123456',
      emp_id: emp2._id,
      role: 'employee'
    });

    // 王芳的普通员工账号
    await User.create({
      username: 'wangfang',
      password: '123456',
      emp_id: emp3._id,
      role: 'employee'
    });

    console.log(`✅ 创建了 ${await User.countDocuments()} 个用户账号\n`);

    // 5. 创建薪酬项目
    console.log('💰 创建薪酬项目...');
    const salaryItem1 = await SalaryItem.create({
      item_name: '基本工资',
      description: '员工的基本工资',
      is_active: true
    });

    const salaryItem2 = await SalaryItem.create({
      item_name: '绩效奖金',
      description: '根据绩效考核发放的奖金',
      is_active: true
    });

    const salaryItem3 = await SalaryItem.create({
      item_name: '交通补贴',
      description: '交通补贴',
      is_active: true
    });

    const salaryItem4 = await SalaryItem.create({
      item_name: '餐饮补贴',
      description: '餐饮补贴',
      is_active: true
    });

    const salaryItem5 = await SalaryItem.create({
      item_name: '住房公积金',
      description: '单位缴纳的住房公积金',
      is_active: true
    });

    const salaryItem6 = await SalaryItem.create({
      item_name: '医疗保险',
      description: '单位缴纳的医疗保险',
      is_active: true
    });

    const salaryItem7 = await SalaryItem.create({
      item_name: '养老保险',
      description: '单位缴纳的养老保险',
      is_active: true
    });

    const salaryItem8 = await SalaryItem.create({
      item_name: '失业保险',
      description: '单位缴纳的失业保险',
      is_active: true
    });

    const salaryItem9 = await SalaryItem.create({
      item_name: '全勤奖',
      description: '全勤奖励',
      is_active: true
    });

    const salaryItem10 = await SalaryItem.create({
      item_name: '加班费',
      description: '加班工资',
      is_active: true
    });

    const salaryItem11 = await SalaryItem.create({
      item_name: '年终奖',
      description: '年终奖金',
      is_active: true
    });

    const salaryItem12 = await SalaryItem.create({
      item_name: '项目奖金',
      description: '项目完成奖金',
      is_active: true
    });

    console.log(`✅ 创建了 ${await SalaryItem.countDocuments()} 个薪酬项目\n`);

    // 6. 创建薪酬标准
    console.log('📊 创建薪酬标准...');
    
    // 张三的薪酬标准（前端工程师）
    await SalaryStandard.create([
      {
        pos_id: pos3._id,
        item_id: salaryItem1._id,
        amount: 8000,
        effective_date: new Date('2024-01-01'),
        reviewed: true
      },
      {
        pos_id: pos3._id,
        item_id: salaryItem2._id,
        amount: 3000,
        effective_date: new Date('2024-01-01'),
        reviewed: true
      },
      {
        pos_id: pos3._id,
        item_id: salaryItem3._id,
        amount: 500,
        effective_date: new Date('2024-01-01'),
        reviewed: true
      },
      {
        pos_id: pos3._id,
        item_id: salaryItem4._id,
        amount: 500,
        effective_date: new Date('2024-01-01'),
        reviewed: true
      },
      {
        pos_id: pos3._id,
        item_id: salaryItem5._id,
        amount: 960,
        effective_date: new Date('2024-01-01'),
        reviewed: true
      },
      {
        pos_id: pos3._id,
        item_id: salaryItem6._id,
        amount: 240,
        effective_date: new Date('2024-01-01'),
        reviewed: true
      },
      {
        pos_id: pos3._id,
        item_id: salaryItem7._id,
        amount: 640,
        effective_date: new Date('2024-01-01'),
        reviewed: true
      },
      {
        pos_id: pos3._id,
        item_id: salaryItem8._id,
        amount: 80,
        effective_date: new Date('2024-01-01'),
        reviewed: true
      },
      {
        pos_id: pos3._id,
        item_id: salaryItem9._id,
        amount: 200,
        effective_date: new Date('2024-01-01'),
        reviewed: true
      }
    ]);

    console.log(`✅ 创建了 ${await SalaryStandard.countDocuments()} 个薪酬标准\n`);

    // 7. 创建薪酬发放记录（为张三创建几个月的薪酬记录）
    console.log('💸 创建薪酬发放记录...');
    
    const months = ['2024-01', '2023-12', '2023-11'];
    for (const month of months) {
      const batchId = `BATCH_${month.replace('-', '')}_${org3._id}`;
      
      await SalaryPayment.create([
        {
          emp_id: emp4._id,
          item_id: salaryItem1._id,
          amount: 8000,
          pay_month: new Date(`${month}-01`),
          batch_id: batchId,
          reviewed: true
        },
        {
          emp_id: emp4._id,
          item_id: salaryItem2._id,
          amount: month === '2024-01' ? 3000 : month === '2023-12' ? 2500 : 3500,
          pay_month: new Date(`${month}-01`),
          batch_id: batchId,
          reviewed: true
        },
        {
          emp_id: emp4._id,
          item_id: salaryItem3._id,
          amount: 500,
          pay_month: new Date(`${month}-01`),
          batch_id: batchId,
          reviewed: true
        },
        {
          emp_id: emp4._id,
          item_id: salaryItem4._id,
          amount: 500,
          pay_month: new Date(`${month}-01`),
          batch_id: batchId,
          reviewed: true
        },
        {
          emp_id: emp4._id,
          item_id: salaryItem5._id,
          amount: 960,
          pay_month: new Date(`${month}-01`),
          batch_id: batchId,
          reviewed: true
        },
        {
          emp_id: emp4._id,
          item_id: salaryItem6._id,
          amount: 240,
          pay_month: new Date(`${month}-01`),
          batch_id: batchId,
          reviewed: true
        },
        {
          emp_id: emp4._id,
          item_id: salaryItem7._id,
          amount: 640,
          pay_month: new Date(`${month}-01`),
          batch_id: batchId,
          reviewed: true
        },
        {
          emp_id: emp4._id,
          item_id: salaryItem8._id,
          amount: 80,
          pay_month: new Date(`${month}-01`),
          batch_id: batchId,
          reviewed: true
        },
        {
          emp_id: emp4._id,
          item_id: salaryItem9._id,
          amount: 200,
          pay_month: new Date(`${month}-01`),
          batch_id: batchId,
          reviewed: true
        }
      ]);
    }

    console.log(`✅ 创建了 ${await SalaryPayment.countDocuments()} 条薪酬发放记录\n`);

    console.log('✨ 种子数据创建完成！\n');
    console.log('📝 测试账号信息：');
    console.log('--------------------------------------------------');
    console.log('管理员账号：');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    console.log('\n前端部门负责人（Boss）：');
    console.log('  用户名: boss_zhao');
    console.log('  密码: 123456');
    console.log('  姓名: 赵主管');
    console.log('\n后端部门负责人（Boss）：');
    console.log('  用户名: boss_liu');
    console.log('  密码: 123456');
    console.log('  姓名: 刘经理');
    console.log('\n普通员工（张三）：');
    console.log('  用户名: zhangsan');
    console.log('  密码: 123456');
    console.log('  姓名: 张三');
    console.log('\n普通员工（李明）：');
    console.log('  用户名: liming');
    console.log('  密码: 123456');
    console.log('  姓名: 李明');
    console.log('\n普通员工（王芳）：');
    console.log('  用户名: wangfang');
    console.log('  密码: 123456');
    console.log('  姓名: 王芳');
    console.log('--------------------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 种子数据创建失败:', error);
    process.exit(1);
  }
};

// 执行种子数据创建
seedData();


