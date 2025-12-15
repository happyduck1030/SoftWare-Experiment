import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  org_name: {
    type: String,
    required: [true, '机构名称不能为空'],
    trim: true,
    maxlength: [100, '机构名称不能超过100个字符']
  },
  org_level: {
    type: Number,
    required: [true, '机构层级不能为空'],
    enum: [1, 2, 3],
    message: '机构层级必须是1、2或3'
  },
  parent_org_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  manager_emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
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
organizationSchema.index({ org_level: 1 });
organizationSchema.index({ parent_org_id: 1 });
organizationSchema.index({ manager_emp_id: 1 });

// 虚拟字段：获取下级机构
organizationSchema.virtual('children', {
  ref: 'Organization',
  localField: '_id',
  foreignField: 'parent_org_id'
});

// 方法：获取完整路径
organizationSchema.methods.getFullPath = async function() {
  const path = [this.org_name];
  let current = this;
  
  while (current.parent_org_id) {
    current = await mongoose.model('Organization').findById(current.parent_org_id);
    if (current) {
      path.unshift(current.org_name);
    } else {
      break;
    }
  }
  
  return path.join(' / ');
};

// 静态方法：获取机构树
organizationSchema.statics.getOrganizationTree = async function() {
  const orgs = await this.find({ is_deleted: false })
    .populate('manager_emp_id', 'name position')
    .lean();
  
  const buildTree = (parentId = null) => {
    return orgs
      .filter(org => {
        if (parentId === null) return org.parent_org_id === null;
        return org.parent_org_id?.toString() === parentId.toString();
      })
      .map(org => ({
        ...org,
        children: buildTree(org._id)
      }));
  };
  
  return buildTree();
};

export default mongoose.model('Organization', organizationSchema);


