import React, { useState } from 'react'

const PositionSettings = () => {
  // 模拟机构数据（实际应该从API获取）
  const [organizations] = useState([
    { id: 5, name: '前端组', level: 3, path: '总公司 / 技术部 / 前端组' },
    { id: 6, name: '后端组', level: 3, path: '总公司 / 技术部 / 后端组' },
    { id: 7, name: '招聘组', level: 3, path: '总公司 / 人事部 / 招聘组' },
    { id: 8, name: '培训组', level: 3, path: '总公司 / 人事部 / 培训组' },
    { id: 9, name: '会计组', level: 3, path: '总公司 / 财务部 / 会计组' },
  ])

  const [positions, setPositions] = useState([
    { id: 1, name: '前端工程师', organizationId: 5, organizationName: '前端组', organizationPath: '总公司 / 技术部 / 前端组', createTime: '2024-01-15' },
    { id: 2, name: '后端工程师', organizationId: 6, organizationName: '后端组', organizationPath: '总公司 / 技术部 / 后端组', createTime: '2024-01-15' },
    { id: 3, name: '招聘专员', organizationId: 7, organizationName: '招聘组', organizationPath: '总公司 / 人事部 / 招聘组', createTime: '2024-01-16' },
    { id: 4, name: '培训师', organizationId: 8, organizationName: '培训组', organizationPath: '总公司 / 人事部 / 培训组', createTime: '2024-01-16' },
    { id: 5, name: '会计', organizationId: 9, organizationName: '会计组', organizationPath: '总公司 / 财务部 / 会计组', createTime: '2024-01-17' },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    organizationId: null
  })

  const [searchTerm, setSearchTerm] = useState('')

  const handleAdd = () => {
    setModalMode('add')
    setSelectedPosition(null)
    setFormData({ name: '', organizationId: null })
    setIsModalOpen(true)
  }

  const handleEdit = (position) => {
    setModalMode('edit')
    setSelectedPosition(position)
    setFormData({
      name: position.name,
      organizationId: position.organizationId
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个职位吗？')) {
      setPositions(positions.filter(p => p.id !== id))
    }
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请输入职位名称')
      return
    }
    if (!formData.organizationId) {
      alert('请选择所属机构')
      return
    }

    const org = organizations.find(o => o.id === formData.organizationId)

    if (modalMode === 'add') {
      const newPosition = {
        id: Date.now(),
        name: formData.name,
        organizationId: formData.organizationId,
        organizationName: org.name,
        organizationPath: org.path,
        createTime: new Date().toISOString().split('T')[0]
      }
      setPositions([...positions, newPosition])
    } else {
      setPositions(positions.map(p => 
        p.id === selectedPosition.id 
          ? { ...p, name: formData.name, organizationId: formData.organizationId, organizationName: org.name, organizationPath: org.path }
          : p
      ))
    }

    setIsModalOpen(false)
    setFormData({ name: '', organizationId: null })
  }

  const filteredPositions = positions.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.organizationPath.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">职位设置</h2>
              <p className="text-gray-500">管理职位信息，每个职位必须从属于某个三级机构</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 shadow-sm cursor-pointer"
            >
              + 添加职位
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索职位名称或机构..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
            />
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">职位总数</p>
                <p className="text-3xl font-semibold text-gray-900">{positions.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                💼
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">关联机构</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {new Set(positions.map(p => p.organizationId)).size}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                🏛️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">本月新增</p>
                <p className="text-3xl font-semibold text-gray-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                📈
              </div>
            </div>
          </div>
        </div>

        {/* 职位列表 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位名称</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属机构</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">机构路径</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPositions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500">暂无职位数据</p>
                    </td>
                  </tr>
                ) : (
                  filteredPositions.map((position) => (
                    <tr key={position.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-[#59168b]/10 flex items-center justify-center text-xl">
                            💼
                          </div>
                          <span className="font-medium text-gray-900">{position.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{position.organizationName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{position.organizationPath}</td>
                      <td className="px-6 py-4 text-gray-700">{position.createTime}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(position)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 cursor-pointer"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(position.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150 cursor-pointer"
                          >
                            删除
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

      {/* 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalMode === 'add' ? '添加职位' : '编辑职位'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {modalMode === 'add' ? '创建新的职位信息' : '修改职位信息'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  职位名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                  placeholder="请输入职位名称"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  所属机构（三级机构）
                </label>
                <select
                  value={formData.organizationId || ''}
                  onChange={(e) => setFormData({ ...formData, organizationId: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                >
                  <option value="">请选择机构</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.path}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#59168b]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#59168b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">注意事项</p>
                    <p className="text-gray-500 mt-1">职位必须从属于某个三级机构</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
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
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PositionSettings
