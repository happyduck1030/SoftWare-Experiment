import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '姓名不能为空'],
    trim: true,
    maxlength: [50, '姓名不能超过50个字符']
  },
  gender: {
    type: String,
    enum: ['男', '女', 'M', 'F'],
    default: '男'
  },
  id_card: {
    type: String,
    required: [true, '身份证号不能为空'],
    unique: true,
    trim: true,
    match: [/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, '身份证号格式不正确']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^1[3-9]\d{9}$/, '手机号格式不正确']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '邮箱格式不正确']
  },
  hire_date: {
    type: Date,
    required: [true, '入职日期不能为空']
  },
  pos_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: [true, '职位不能为空']
  },
  status: {
    type: String,
    enum: ['在职', '离职', '休假', '停职', '待复核'],
    default: '待复核'
  },
  education: {
    type: String,
    enum: ['小学', '初中', '高中', '中专', '大专', '本科', '硕士', '博士'],
    default: '本科'
  },
  address: {
    type: String,
    maxlength: [200, '地址不能超过200个字符']
  },
  emergency_contact: {
    type: String,
    maxlength: [50, '紧急联系人不能超过50个字符']
  },
  emergency_phone: {
    type: String,
    match: [/^1[3-9]\d{9}$/, '紧急联系电话格式不正确']
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
employeeSchema.index({ id_card: 1 });
employeeSchema.index({ pos_id: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ name: 1 });

// 虚拟字段：获取所属机构
employeeSchema.virtual('organization', {
  ref: 'Organization',
  localField: 'pos_id',
  foreignField: '_id',
  justOne: true
});

// 方法：获取完整机构路径
employeeSchema.methods.getOrganizationPath = async function() {
  await this.populate('pos_id');
  if (!this.pos_id || !this.pos_id.org_id) return null;
  
  const Organization = mongoose.model('Organization');
  const org = await Organization.findById(this.pos_id.org_id);
  if (!org) return null;
  
  return await org.getFullPath();
};

// 方法：获取各级上级领导
employeeSchema.methods.getSupervisors = async function() {
  await this.populate('pos_id');
  if (!this.pos_id || !this.pos_id.org_id) return null;
  
  const Organization = mongoose.model('Organization');
  const Employee = mongoose.model('Employee');
  
  const supervisors = {
    level1Boss: null,
    level2Boss: null,
    level3Boss: null
  };
  
  // 获取三级机构
  const level3Org = await Organization.findById(this.pos_id.org_id)
    .populate('manager_emp_id', 'name phone email');
  
  if (level3Org && level3Org.manager_emp_id) {
    const pos = await mongoose.model('Position').findById(level3Org.manager_emp_id.pos_id);
    supervisors.level3Boss = {
      name: level3Org.manager_emp_id.name,
      position: pos?.pos_name || '负责人',
      phone: level3Org.manager_emp_id.phone
    };
  }
  
  // 获取二级机构
  if (level3Org && level3Org.parent_org_id) {
    const level2Org = await Organization.findById(level3Org.parent_org_id)
      .populate('manager_emp_id', 'name phone email');
    
    if (level2Org && level2Org.manager_emp_id) {
      const pos = await mongoose.model('Position').findById(level2Org.manager_emp_id.pos_id);
      supervisors.level2Boss = {
        name: level2Org.manager_emp_id.name,
        position: pos?.pos_name || '负责人',
        phone: level2Org.manager_emp_id.phone
      };
    }
    
    // 获取一级机构
    if (level2Org && level2Org.parent_org_id) {
      const level1Org = await Organization.findById(level2Org.parent_org_id)
        .populate('manager_emp_id', 'name phone email');
      
      if (level1Org && level1Org.manager_emp_id) {
        const pos = await mongoose.model('Position').findById(level1Org.manager_emp_id.pos_id);
        supervisors.level1Boss = {
          name: level1Org.manager_emp_id.name,
          position: pos?.pos_name || '负责人',
          phone: level1Org.manager_emp_id.phone
        };
      }
    }
  }
  
  return supervisors;
};

export default mongoose.model('Employee', employeeSchema);

