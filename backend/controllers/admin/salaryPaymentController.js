import mongoose from 'mongoose';
import SalaryPayment from '../../models/SalaryPayment.js';
import SalaryStandard from '../../models/SalaryStandard.js';
import SalaryItem from '../../models/SalaryItem.js';
import Employee from '../../models/Employee.js';
import Position from '../../models/Position.js';
import Organization from '../../models/Organization.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/responseFormatter.js';

// 帮助方法：获取某职位的最新已审核薪酬标准（按生效日期排序）
const getReviewedStandardsByPosition = async (positionId) => {
  return await SalaryStandard.find({
    pos_id: positionId,
    reviewed: true,
    is_deleted: false
  })
    .populate('item_id', 'item_name description')
    .sort({ effective_date: -1 });
};

// @desc  预览某机构员工的标准薪酬（含项目明细）
// @route GET /api/admin/salary-payments/preview
// query: org_id, month (可选)
export const previewPayments = async (req, res) => {
  try {
    const { org_id } = req.query;
    if (!org_id) {
      return errorResponse(res, '请提供机构ID', 400);
    }

    const org = await Organization.findById(org_id);
    if (!org) {
      return errorResponse(res, '机构不存在', 404);
    }

    // 找到该机构下的职位
    const positions = await Position.find({ org_id, is_deleted: false });
    const positionMap = {};
    positions.forEach(p => { positionMap[p._id.toString()] = p; });

    // 找到该机构的员工
    const employees = await Employee.find({
      pos_id: { $in: positions.map(p => p._id) },
      is_deleted: false
    }).populate('pos_id');

    // 获取标准
    const employeesWithSalary = [];
    for (const emp of employees) {
      const standards = await getReviewedStandardsByPosition(emp.pos_id._id);
      const latestStandards = standards; // 已按时间倒序
      const items = latestStandards.map(s => ({
        itemId: s.item_id._id,
        itemName: s.item_id.item_name,
        amount: s.amount
      }));
      const baseAmount = items.reduce((sum, it) => sum + it.amount, 0);
      employeesWithSalary.push({
        empId: emp._id,
        name: emp.name,
        positionName: emp.pos_id.pos_name,
        baseAmount,
        items
      });
    }

    successResponse(res, {
      organization: {
        id: org._id,
        name: org.org_name
      },
      employees: employeesWithSalary
    }, '预览成功');
  } catch (error) {
    console.error('Preview payments error:', error);
    errorResponse(res, error.message || '预览失败', 500);
  }
};

// @desc  登记薪酬发放（含奖金和扣款）
// @route POST /api/admin/salary-payments/register
// body: { month, org_id, employees:[{empId, bonusAmount, deductionAmount}] }
export const registerPayments = async (req, res) => {
  try {
    const { month, org_id, employees } = req.body;
    if (!month || !org_id || !Array.isArray(employees) || employees.length === 0) {
      return errorResponse(res, '请提供月份、机构以及员工列表', 400);
    }

    const payMonth = new Date(`${month}-01`);
    const org = await Organization.findById(org_id);
    if (!org) {
      return errorResponse(res, '机构不存在', 404);
    }

    // 获取奖金/扣款的薪酬项目
    const bonusItem = await SalaryItem.findOne({ item_name: '项目奖金', is_deleted: false });
    const deductionItem = await SalaryItem.findOne({ item_name: '扣款', is_deleted: false });
    if (!bonusItem || !deductionItem) {
      return errorResponse(res, '缺少“项目奖金”或“扣款”薪酬项目，请先在薪酬项目中创建', 400);
    }

    const batchId = `BATCH_${month.replace('-', '')}_${org_id}`;
    const paymentDocs = [];

    for (const empInput of employees) {
      const emp = await Employee.findById(empInput.empId).populate('pos_id');
      if (!emp) continue;

      // 标准薪酬
      const standards = await getReviewedStandardsByPosition(emp.pos_id._id);
      for (const s of standards) {
        paymentDocs.push({
          emp_id: emp._id,
          item_id: s.item_id._id,
          amount: s.amount,
          pay_month: payMonth,
          batch_id: batchId,
          reviewed: false,
          created_by: req.user?._id
        });
      }

      // 奖金
      const bonus = Number(empInput.bonusAmount || 0);
      if (bonus > 0) {
        paymentDocs.push({
          emp_id: emp._id,
          item_id: bonusItem._id,
          amount: bonus,
          pay_month: payMonth,
          batch_id: batchId,
          reviewed: false,
          created_by: req.user?._id,
          is_bonus: true
        });
      }

      // 扣款
      const deduction = Number(empInput.deductionAmount || 0);
      if (deduction > 0) {
        paymentDocs.push({
          emp_id: emp._id,
          item_id: deductionItem._id,
          amount: deduction,
          pay_month: payMonth,
          batch_id: batchId,
          reviewed: false,
          created_by: req.user?._id,
          is_deduction: true
        });
      }
    }

    if (paymentDocs.length === 0) {
      return errorResponse(res, '没有可登记的薪酬记录', 400);
    }

    await SalaryPayment.insertMany(paymentDocs);

    successResponse(res, { batchId, count: paymentDocs.length }, '薪酬发放登记成功');
  } catch (error) {
    console.error('Register payments error:', error);
    errorResponse(res, error.message || '薪酬发放登记失败', 500);
  }
};

// @desc 获取薪酬发放批次列表（简化）
// @route GET /api/admin/salary-payments
export const listPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const pipeline = [
      { $match: { is_deleted: false } },
      { $group: {
          _id: '$batch_id',
          totalAmount: { $sum: '$amount' },
          pay_month: { $first: '$pay_month' },
          reviewed: { $min: '$reviewed' },
          count: { $sum: 1 }
        }
      },
      { $sort: { pay_month: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];

    const raw = await SalaryPayment.aggregate(pipeline);
    const data = raw.map(item => ({
      batchId: item._id,
      month: item.pay_month ? item.pay_month.toISOString().slice(0, 7) : '',
      totalAmount: item.totalAmount,
      employeeCount: item.count,
      reviewed: item.reviewed
    }));
    const total = (await SalaryPayment.aggregate([
      { $match: { is_deleted: false } },
      { $group: { _id: '$batch_id' } },
      { $count: 'total' }
    ]))[0]?.total || 0;

    paginatedResponse(res, data, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('List payments error:', error);
    errorResponse(res, error.message || '获取薪酬发放列表失败', 500);
  }
};

// @desc 获取某个批次的详细薪酬信息（按员工+项目拆分）
// @route GET /api/admin/salary-payments/:batchId
export const getPaymentDetail = async (req, res) => {
  try {
    const { batchId } = req.params;
    if (!batchId) {
      return errorResponse(res, '缺少批次ID', 400);
    }

    const payments = await SalaryPayment.find({
      batch_id: batchId,
      is_deleted: false
    })
      .populate({
        path: 'emp_id',
        populate: { path: 'pos_id', select: 'pos_name' },
        select: 'name pos_id'
      })
      .populate('item_id', 'item_name');

    if (!payments.length) {
      return errorResponse(res, '未找到该批次的薪酬记录', 404);
    }

    const employeesMap = {};
    let totalAmount = 0;
    let payMonth = payments[0].pay_month;

    payments.forEach(p => {
      const empKey = p.emp_id._id.toString();
      if (!employeesMap[empKey]) {
        employeesMap[empKey] = {
          empId: p.emp_id._id,
          name: p.emp_id.name,
          positionName: p.emp_id.pos_id?.pos_name || '',
          baseAmount: 0,
          bonusAmount: 0,
          deductionAmount: 0,
          items: []
        };
      }
      const emp = employeesMap[empKey];
      const item = {
        itemName: p.item_id?.item_name || '',
        amount: p.amount,
        isBonus: !!p.is_bonus,
        isDeduction: !!p.is_deduction
      };
      emp.items.push(item);

      if (p.is_bonus) {
        emp.bonusAmount += p.amount;
      } else if (p.is_deduction) {
        emp.deductionAmount += p.amount;
      } else {
        emp.baseAmount += p.amount;
      }

      totalAmount += p.amount;
    });

    const employees = Object.values(employeesMap).map(emp => ({
      ...emp,
      actualAmount: emp.baseAmount + emp.bonusAmount - emp.deductionAmount
    }));

    successResponse(res, {
      batchId,
      month: payMonth ? payMonth.toISOString().slice(0, 7) : '',
      totalAmount,
      employees
    }, '获取批次详情成功');
  } catch (error) {
    console.error('Get payment detail error:', error);
    errorResponse(res, error.message || '获取批次详情失败', 500);
  }
};

// @desc  复核整批薪酬发放
// @route PUT /api/admin/salary-payments/batch/:batchId/review
// body: { approved: boolean }
export const reviewPaymentBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { approved } = req.body;

    if (!batchId) {
      return errorResponse(res, '缺少批次ID', 400);
    }

    const exists = await SalaryPayment.exists({ batch_id: batchId, is_deleted: false });
    if (!exists) {
      return errorResponse(res, `未找到批次 ${batchId} 的薪酬记录`, 404);
    }

    await SalaryPayment.updateMany(
      { batch_id: batchId, is_deleted: false },
      { $set: { reviewed: !!approved, reviewed_at: new Date(), reviewed_by: req.user?._id } }
    );

    return successResponse(res, { batchId, approved: !!approved }, approved ? '薪酬发放批次复核通过' : '薪酬发放批次已驳回');
  } catch (error) {
    console.error('Review payment batch error:', error);
    return errorResponse(res, error.message || '复核薪酬发放失败', 500);
  }
};

export default {
  previewPayments,
  registerPayments,
  listPayments,
  getPaymentDetail,
  reviewPaymentBatch
};

