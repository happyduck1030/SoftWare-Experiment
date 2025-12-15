import mongoose from 'mongoose';

const salaryItemSchema = new mongoose.Schema({
  item_name: {
    type: String,
    required: [true, '薪酬项目名称不能为空'],
    unique: true,
    trim: true,
    maxlength: [50, '项目名称不能超过50个字符']
  },
  description: {
    type: String,
    maxlength: [200, '描述不能超过200个字符']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_deleted: {
    type: Boolean,
    default: false
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
salaryItemSchema.index({ item_name: 1 });
salaryItemSchema.index({ is_active: 1 });

export default mongoose.model('SalaryItem', salaryItemSchema);


