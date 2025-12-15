import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  pos_name: {
    type: String,
    required: [true, '职位名称不能为空'],
    trim: true,
    maxlength: [100, '职位名称不能超过100个字符']
  },
  org_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, '所属机构不能为空']
  },
  description: {
    type: String,
    maxlength: [500, '描述不能超过500个字符']
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
positionSchema.index({ org_id: 1 });
positionSchema.index({ pos_name: 1, org_id: 1 });

export default mongoose.model('Position', positionSchema);


