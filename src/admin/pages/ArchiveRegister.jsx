import React, { useState, useEffect } from 'react'
import { getArchives, createArchive, getOrganizations, getPositions } from '../../services/adminService'

const ArchiveRegister = () => {
  const [archives, setArchives] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 假数据保留作为注释参考
  // const [archives, setArchives] = useState([
  //   {
  //     id: 1,
  //     name: '张三',
  //     gender: '男',
  //     idCard: '110101199001011234',
  //     phone: '13800138000',
  //     entryDate: '2024-01-15',
  //     organizationId: 5,
  //     organizationName: '前端组',
  //     organizationPath: '总公司 / 技术部 / 前端组',
  //     positionId: 1,
  //     positionName: '前端工程师',
  //     status: 'pending',
  //     createTime: '2024-01-15 10:30:00'
  //   }
  // ])

  // // 模拟数据
  // const [organizations] = useState([
  //   { id: 5, name: '前端组', path: '总公司 / 技术部 / 前端组' },
  //   { id: 6, name: '后端组', path: '总公司 / 技术部 / 后端组' },
  //   { id: 7, name: '招聘组', path: '总公司 / 人事部 / 招聘组' },
  //   { id: 8, name: '培训组', path: '总公司 / 人事部 / 培训组' },
  //   { id: 9, name: '会计组', path: '总公司 / 财务部 / 会计组' },
  // ])

  // const [positions] = useState([
  //   { id: 1, name: '前端工程师', organizationId: 5 },
  //   { id: 2, name: '后端工程师', organizationId: 6 },
  //   { id: 3, name: '招聘专员', organizationId: 7 },
  //   { id: 4, name: '培训师', organizationId: 8 },
  //   { id: 5, name: '会计', organizationId: 9 },
  // ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    idCard: '',
    phone: '',
    email: '',
    entryDate: '',
    organizationId: null,
    positionId: null,
    education: '本科',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  const [availablePositions, setAvailablePositions] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 并行加载所有数据
        const [archivesRes, orgsRes, positionsRes] = await Promise.all([
          getArchives({ reviewed: false }), // 只获取未复核的档案
          getOrganizations(),
          getPositions()
        ])
        
        // 处理档案数据
        const archivesData = archivesRes.data || []
        const formattedArchives = archivesData.map(archive => ({
          id: archive._id,
          name: archive.name,
          gender: archive.gender,
          idCard: archive.id_card,
          phone: archive.phone,
          email: archive.email,
          entryDate: archive.hire_date ? new Date(archive.hire_date).toISOString().split('T')[0] : '',
          organizationId: archive.pos_id?.org_id?._id || archive.pos_id?.org_id,
          organizationName: archive.pos_id?.org_id?.org_name || '',
          organizationPath: archive.organizationPath || '',
          positionId: archive.pos_id?._id,
          positionName: archive.pos_id?.pos_name || '',
          status: archive.reviewed ? '已复核' : '待复核',
          createTime: archive.created_at ? new Date(archive.created_at).toLocaleString('zh-CN', { hour12: false }) : ''
        }))
        setArchives(formattedArchives)
        
        // 处理机构数据
        const orgsData = orgsRes.data || []
        const formattedOrgs = orgsData.map(org => ({
          id: org._id,
          name: org.org_name,
          path: org.fullPath || org.org_name // 如果后端没有fullPath，使用org_name
        }))
        setOrganizations(formattedOrgs)
        
        // 处理职位数据
        const positionsData = positionsRes.data || []
        const formattedPositions = positionsData.map(pos => ({
          id: pos._id,
          name: pos.pos_name,
          organizationId: pos.org_id?._id || pos.org_id
        }))
        setPositions(formattedPositions)
        
      } catch (error) {
        console.error('加载数据失败:', error)
        // 可以在这里添加错误提示
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleAdd = () => {
    setFormData({
      name: '',
      gender: '男',
      idCard: '',
      phone: '',
      email: '',
      entryDate: '',
      organizationId: null,
      positionId: null,
      education: '本科',
      address: '',
      emergencyContact: '',
      emergencyPhone: ''
    })
    setAvailablePositions([])
    setIsModalOpen(true)
  }

  const handleOrganizationChange = (orgId) => {
    const filtered = positions.filter(p => p.organizationId === orgId)
    setAvailablePositions(filtered)
    setFormData({ ...formData, organizationId: orgId, positionId: null })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('请输入姓名')
      return
    }
    if (!formData.idCard.trim()) {
      alert('请输入身份证号')
      return
    }
    if (!formData.phone.trim()) {
      alert('请输入联系电话')
      return
    }
    if (!formData.entryDate) {
      alert('请选择入职日期')
      return
    }
    if (!formData.organizationId) {
      alert('请选择所属机构')
      return
    }
    if (!formData.positionId) {
      alert('请选择职位')
      return
    }

    try {
      setSubmitting(true)
      
      // 准备提交给后端的数据
      const createData = {
        name: formData.name,
        gender: formData.gender,
        id_card: formData.idCard,
        phone: formData.phone,
        email: formData.email,
        hire_date: formData.entryDate,
        pos_id: formData.positionId,
        education: formData.education,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone
      }
      
      // 调用API创建档案
      const response = await createArchive(createData)
      
      // 处理返回的档案数据
      const newArchive = response.data
      const formattedArchive = {
        id: newArchive._id,
        name: newArchive.name,
        gender: newArchive.gender,
        idCard: newArchive.id_card,
        phone: newArchive.phone,
        email: newArchive.email,
        entryDate: newArchive.hire_date ? new Date(newArchive.hire_date).toISOString().split('T')[0] : '',
        organizationId: newArchive.pos_id?.org_id?._id || newArchive.pos_id?.org_id,
        organizationName: newArchive.pos_id?.org_id?.org_name || '',
        organizationPath: newArchive.organizationPath || '',
        positionId: newArchive.pos_id?._id,
        positionName: newArchive.pos_id?.pos_name || '',
        status: newArchive.reviewed ? '已复核' : '待复核',
        createTime: newArchive.created_at ? new Date(newArchive.created_at).toLocaleString('zh-CN', { hour12: false }) : ''
      }
      
      setArchives([formattedArchive, ...archives])
      setIsModalOpen(false)
      alert('档案登记成功，等待复核')
    } catch (error) {
      console.error('创建档案失败:', error)
      alert(error.message || '档案登记失败')
    } finally {
      setSubmitting(false)
    }
  }

  const pendingCount = archives.filter(a => a.status === 'pending').length

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">档案登记</h2>
              <p className="text-gray-500">录入新员工基本信息，提交后等待复核</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 shadow-sm cursor-pointer"
            >
              + 登记新员工
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">档案总数</p>
                <p className="text-3xl font-semibold text-gray-900">{archives.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                📝
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">待复核</p>
                <p className="text-3xl font-semibold text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">
                ⏳
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">本月新增</p>
                <p className="text-3xl font-semibold text-gray-900">1</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                📈
              </div>
            </div>
          </div>
        </div>

        {/* 档案列表 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">性别</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">联系电话</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">入职日期</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属机构</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">登记时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-gray-500">加载中...</p>
                    </td>
                  </tr>
                ) : archives.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500">暂无档案数据</p>
                    </td>
                  </tr>
                ) : (
                  archives.map((archive) => (
                    <tr key={archive.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-[#59168b]/10 flex items-center justify-center text-sm font-medium text-[#59168b]">
                            {archive.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{archive.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{archive.gender}</td>
                      <td className="px-6 py-4 text-gray-700">{archive.phone}</td>
                      <td className="px-6 py-4 text-gray-700">{archive.entryDate}</td>
                      <td className="px-6 py-4 text-gray-700">{archive.positionName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{archive.organizationPath}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          archive.status === '已复核' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                           {archive.status === '已复核' ? '✓ 已复核' : '⏳ 待复核'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{archive.createTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">登记新员工</h3>
              <p className="text-sm text-gray-500 mt-1">请填写员工的基本信息</p>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  基本信息
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">姓名 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">性别 *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">身份证号 *</label>
                    <input
                      type="text"
                      value={formData.idCard}
                      onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入身份证号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">联系电话 *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入联系电话"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">电子邮箱</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入电子邮箱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">学历</label>
                    <select
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                    >
                      <option value="高中">高中</option>
                      <option value="大专">大专</option>
                      <option value="本科">本科</option>
                      <option value="硕士">硕士</option>
                      <option value="博士">博士</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 职位信息 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  职位信息
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">入职日期 *</label>
                    <input
                      type="date"
                      value={formData.entryDate}
                      onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">所属机构 *</label>
                    <select
                      value={formData.organizationId || ''}
                      onChange={(e) => handleOrganizationChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                    >
                      <option value="">请选择机构</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.path}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">职位 *</label>
                    <select
                      value={formData.positionId || ''}
                      onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                      disabled={!formData.organizationId}
                    >
                      <option value="">请先选择机构</option>
                      {availablePositions.map(pos => (
                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 其他信息 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  其他信息
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">家庭地址</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入家庭地址"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">紧急联系人</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                        placeholder="请输入紧急联系人"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">紧急联系电话</label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                        placeholder="请输入紧急联系电话"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200 sticky bottom-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors duration-150 cursor-pointer"
              >
                {submitting ? '提交中...' : '提交登记'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArchiveRegister


