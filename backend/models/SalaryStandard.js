import mongoose from 'mongoose';

const salaryStandardSchema = new mongoose.Schema({
  pos_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: [true, '职位不能为空']
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
  effective_date: {
    type: Date,
    required: [true, '生效日期不能为空'],
    default: Date.now
  },
  // 审核状态：待复核 / 已复核 / 已驳回 / 已撤回
  status: {
    type: String,
    enum: ['待复核', '已复核', '已驳回', '已撤回'],
    default: '待复核'
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
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// 索引
salaryStandardSchema.index({ pos_id: 1, item_id: 1 });
salaryStandardSchema.index({ effective_date: 1 });
salaryStandardSchema.index({ reviewed: 1 });

// 静态方法：获取某职位的完整薪酬标准
salaryStandardSchema.statics.getStandardsByPosition = async function(positionId) {
  return await this.find({
    pos_id: positionId,
    reviewed: true,
    is_deleted: false
  })
  .populate('item_id', 'item_name description')
  .sort({ effective_date: -1 });
};

export default mongoose.model('SalaryStandard', salaryStandardSchema);


