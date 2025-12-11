import React, { useState } from 'react'

const ArchiveUpdate = () => {
  const [archives, setArchives] = useState([
    { id: 1, name: '张三', gender: '男', idCard: '110101199001011234', phone: '13800138000', email: 'zhangsan@example.com', entryDate: '2024-01-15', organizationId: 5, organizationPath: '总公司 / 技术部 / 前端组', positionId: 1, positionName: '前端工程师', education: '本科' },
    { id: 2, name: '李四', gender: '男', idCard: '110101199102021235', phone: '13800138001', email: 'lisi@example.com', entryDate: '2024-01-10', organizationId: 6, organizationPath: '总公司 / 技术部 / 后端组', positionId: 2, positionName: '后端工程师', education: '硕士' },
  ])

  const [organizations] = useState([
    { id: 5, name: '前端组', path: '总公司 / 技术部 / 前端组' },
    { id: 6, name: '后端组', path: '总公司 / 技术部 / 后端组' },
    { id: 7, name: '招聘组', path: '总公司 / 人事部 / 招聘组' },
  ])

  const [positions] = useState([
    { id: 1, name: '前端工程师', organizationId: 5 },
    { id: 2, name: '后端工程师', organizationId: 6 },
    { id: 3, name: '招聘专员', organizationId: 7 },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArchive, setSelectedArchive] = useState(null)
  const [formData, setFormData] = useState({})
  const [availablePositions, setAvailablePositions] = useState([])

  const handleEdit = (archive) => {
    setSelectedArchive(archive)
    setFormData(archive)
    const filtered = positions.filter(p => p.organizationId === archive.organizationId)
    setAvailablePositions(filtered)
    setIsModalOpen(true)
  }

  const handleOrganizationChange = (orgId) => {
    const filtered = positions.filter(p => p.organizationId === Number(orgId))
    setAvailablePositions(filtered)
    setFormData({ ...formData, organizationId: Number(orgId), positionId: null })
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('请填写必填项')
      return
    }

    const org = organizations.find(o => o.id === formData.organizationId)
    const pos = positions.find(p => p.id === formData.positionId)

    setArchives(archives.map(a => 
      a.id === selectedArchive.id 
        ? { ...formData, organizationPath: org.path, positionName: pos.name }
        : a
    ))
    setIsModalOpen(false)
    alert('档案更新成功，需等待复核')
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
                {archives.map((archive) => (
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
                ))}
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
                    value={formData.organizationId}
                    onChange={(e) => handleOrganizationChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                  >
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.path}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">职位 *</label>
                  <select
                    value={formData.positionId}
                    onChange={(e) => setFormData({ ...formData, positionId: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                  >
                    {availablePositions.map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.name}</option>
                    ))}
                  </select>
                </div>
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
                className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 cursor-pointer"
              >
                提交变更
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArchiveUpdate


