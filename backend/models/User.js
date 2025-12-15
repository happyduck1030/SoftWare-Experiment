import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少3个字符'],
    maxlength: [50, '用户名不能超过50个字符']
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6个字符'],
    select: false  // 默认查询时不返回密码
  },
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'employee', 'boss'],
    default: 'employee'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date
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
userSchema.index({ username: 1 });
userSchema.index({ emp_id: 1 });

// 保存前加密密码
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 比对密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 方法：检查用户是否是某个机构的负责人
userSchema.methods.isBossOfOrganization = async function() {
  if (!this.emp_id) return null;
  
  const Organization = mongoose.model('Organization');
  const org = await Organization.findOne({ 
    manager_emp_id: this.emp_id,
    is_deleted: false 
  });
  
  return org;
};

// 方法：获取用户管理的机构ID
userSchema.methods.getManagedOrganizationId = async function() {
  const org = await this.isBossOfOrganization();
  return org ? org._id : null;
};

export default mongoose.model('User', userSchema);


