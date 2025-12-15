import mongoose from 'mongoose';

const salaryPaymentSchema = new mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, '员工不能为空']
  },
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryItem',
    required: [true, '薪酬项目不能为空']
  },
  amount: {
    type: Number,
    required: [true, '金额不能为空'],
    min: [0, '金额不能为负数']
  },
  pay_month: {
    type: Date,
    required: [true, '发放月份不能为空']
  },
  batch_id: {
    type: String,
    required: [true, '批次ID不能为空'],
    index: true
  },
  reviewed: {
    type: Boolean,
    default: false
  },
  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewed_at: {
    type: Date
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  // 新增：是否为奖金
  is_bonus: {
    type: Boolean,
    default: false
  },
  // 新增：是否为扣款
  is_deduction: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// 索引
salaryPaymentSchema.index({ emp_id: 1, pay_month: 1 });
salaryPaymentSchema.index({ pay_month: 1 });
salaryPaymentSchema.index({ batch_id: 1 });
salaryPaymentSchema.index({ reviewed: 1 });

// 静态方法：获取某员工的薪酬记录
salaryPaymentSchema.statics.getEmployeePayments = async function(employeeId, startMonth, endMonth) {
  const query = {
    emp_id: employeeId,
    reviewed: true,
    is_deleted: false
  };
  
  if (startMonth) query.pay_month = { $gte: new Date(startMonth) };
  if (endMonth) query.pay_month = { ...query.pay_month, $lte: new Date(endMonth) };
  
  return await this.find(query)
    .populate('item_id', 'item_name')
    .sort({ pay_month: -1, item_id: 1 });
};

// 静态方法：按月汇总员工薪酬
salaryPaymentSchema.statics.getSummaryByMonth = async function(employeeId) {
  return await this.aggregate([
    {
      $match: {
        emp_id: new mongoose.Types.ObjectId(employeeId),
        reviewed: true,
        is_deleted: false
      }
    },
    {
      $group: {
        _id: '$pay_month',
        total: { $sum: '$amount' },
        items: { $push: { item_id: '$item_id', amount: '$amount' } }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
};

export default mongoose.model('SalaryPayment', salaryPaymentSchema);


