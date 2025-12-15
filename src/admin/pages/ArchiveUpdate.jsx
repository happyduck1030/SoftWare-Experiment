import React, { useState, useEffect } from 'react'
import { getArchives, updateArchive, getOrganizations, getPositions, updateOrganization } from '../../services/adminService'

const ArchiveUpdate = () => {
  const [archives, setArchives] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 假数据保留作为注释参考
  // const [archives, setArchives] = useState([
  //   { id: 1, name: '张三', gender: '男', idCard: '110101199001011234', phone: '13800138000', email: 'zhangsan@example.com', entryDate: '2024-01-15', organizationId: 5, organizationPath: '总公司 / 技术部 / 前端组', positionId: 1, positionName: '前端工程师', education: '本科' },
  //   { id: 2, name: '李四', gender: '男', idCard: '110101199102021235', phone: '13800138001', email: 'lisi@example.com', entryDate: '2024-01-10', organizationId: 6, organizationPath: '总公司 / 技术部 / 后端组', positionId: 2, positionName: '后端工程师', education: '硕士' },
  // ])

  // const [organizations] = useState([
  //   { id: 5, name: '前端组', path: '总公司 / 技术部 / 前端组' },
  //   { id: 6, name: '后端组', path: '总公司 / 技术部 / 后端组' },
  //   { id: 7, name: '招聘组', path: '总公司 / 人事部 / 招聘组' },
  // ])

  // const [positions] = useState([
  //   { id: 1, name: '前端工程师', organizationId: 5 },
  //   { id: 2, name: '后端工程师', organizationId: 6 },
  //   { id: 3, name: '招聘专员', organizationId: 7 },
  // ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArchive, setSelectedArchive] = useState(null)
  const [formData, setFormData] = useState({})
  const [availablePositions, setAvailablePositions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [managerAction, setManagerAction] = useState('keep') // keep | set | unset
  const [isCurrentManager, setIsCurrentManager] = useState(false)

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 并行加载所有数据
        const [archivesRes, orgsRes, positionsRes] = await Promise.all([
          getArchives(),
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
          organizationPath: archive.organizationPath || '',
          positionId: archive.pos_id?._id,
          positionName: archive.pos_id?.pos_name || '',
          education: archive.education
        }))
        setArchives(formattedArchives)
        
        // 处理机构数据
        const orgsData = orgsRes.data || []
        const formattedOrgs = orgsData.map(org => ({
          id: org._id,
          name: org.org_name,
          path: org.fullPath || org.org_name, // 如果后端没有fullPath，使用org_name
          managerId: org.manager_emp_id?._id || org.manager_emp_id || null
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

  const computeManagerState = (orgId, empId) => {
    const org = organizations.find(o => o.id === orgId)
    const isMgr = org ? org.managerId === empId : false
    setIsCurrentManager(isMgr)
    setManagerAction('keep')
  }

  const handleEdit = (archive) => {
    setSelectedArchive(archive)
    setFormData(archive)
    const filtered = positions.filter(p => p.organizationId === archive.organizationId)
    setAvailablePositions(filtered)
    computeManagerState(archive.organizationId, archive.id)
    setIsModalOpen(true)
  }

  const handleOrganizationChange = (orgId) => {
    const filtered = positions.filter(p => p.organizationId === orgId)
    setAvailablePositions(filtered)
    setFormData({ ...formData, organizationId: orgId, positionId: null })
    computeManagerState(orgId, formData.id || selectedArchive?.id)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('请填写必填项')
      return
    }

    try {
      setSubmitting(true)
      
      // 准备提交给后端的数据
      const updateData = {
        name: formData.name,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        pos_id: formData.positionId,
        education: formData.education
      }
      
      // 调用API更新档案
      await updateArchive(selectedArchive.id, updateData)

      // 根据操作更新机构负责人
      if (formData.organizationId && managerAction !== 'keep') {
        try {
          await updateOrganization(formData.organizationId, {
            manager_emp_id: managerAction === 'set' ? selectedArchive.id : null
          })
        } catch (e) {
          console.error('设置机构负责人失败', e)
        }
      }
      
      // 更新本地数据
      const org = organizations.find(o => o.id === formData.organizationId)
      const pos = positions.find(p => p.id === formData.positionId)
      
      setArchives(archives.map(a =>
        a.id === selectedArchive.id
          ? { ...formData, organizationPath: org?.path || '', positionName: pos?.name || '' }
          : a
      ))
      
      setIsModalOpen(false)
      setManagerAction('keep')
      alert('档案更新成功，需等待复核')
    } catch (error) {
      console.error('更新档案失败:', error)
      alert(error.message || '档案更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">档案变更</h2>
            <p className="text-gray-500">修改已有员工的档案信息，修改后需重新复核</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">员工总数</p>
                <p className="text-3xl font-semibold text-gray-900">{archives.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">本月变更</p>
                <p className="text-3xl font-semibold text-gray-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                📝
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">待复核</p>
                <p className="text-3xl font-semibold text-gray-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">
                ⏳
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属机构</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-gray-500">加载中...</p>
                    </td>
                  </tr>
                ) : archives.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
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
                      <td className="px-6 py-4 text-gray-700">{archive.positionName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{archive.organizationPath}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleEdit(archive)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 cursor-pointer"
                          >
                            变更
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 编辑模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">变更档案信息</h3>
              <p className="text-sm text-gray-500 mt-1">修改后需重新提交复核</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
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
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">身份证号 *</label>
                  <input
                    type="text"
                    value={formData.idCard}
                    onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">联系电话 *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">电子邮箱</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
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
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">职位 *</label>
                  <select
                    value={formData.positionId || ''}
                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                  >
                    <option value="">请选择职位</option>
                    {availablePositions.map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">机构负责人状态</p>
                    <p className="text-xs text-gray-500 mt-1">
                      当前：{isCurrentManager ? '该员工是此机构负责人' : '非负责人'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-2 text-sm rounded-lg border border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-60"
                      onClick={() => setManagerAction('set')}
                      disabled={!formData.organizationId || managerAction === 'set'}
                    >
                      设为负责人
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm rounded-lg border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60"
                      onClick={() => setManagerAction('unset')}
                      disabled={!formData.organizationId || managerAction === 'unset' || (!isCurrentManager && managerAction !== 'set')}
                    >
                      取消负责人
                    </button>
                  </div>
                </div>
                {managerAction !== 'keep' && (
                  <p className="mt-2 text-xs text-[#59168b]">
                    待提交操作：{managerAction === 'set' ? '设为负责人' : '取消负责人'}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600 text-xl">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">注意</p>
                    <p className="mt-1">档案信息变更后需要重新提交复核流程</p>
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
                {submitting ? '提交中...' : '提交变更'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArchiveUpdate


