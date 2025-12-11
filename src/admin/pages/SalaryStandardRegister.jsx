import React, { useState } from 'react'

const SalaryStandardRegister = () => {
  const [standards, setStandards] = useState([])
  
  const [organizations] = useState([
    { id: 5, name: '前端组', path: '总公司 / 技术部 / 前端组' },
    { id: 6, name: '后端组', path: '总公司 / 技术部 / 后端组' },
  ])

  const [positions] = useState([
    { id: 1, name: '前端工程师', organizationId: 5 },
    { id: 2, name: '后端工程师', organizationId: 6 },
  ])

  const [salaryItems] = useState([
    { id: 1, name: '基本工资', type: 'fixed' },
    { id: 2, name: '绩效奖金', type: 'floating' },
    { id: 3, name: '交通补贴', type: 'fixed' },
    { id: 4, name: '餐饮补贴', type: 'fixed' },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    organizationId: null,
    positionId: null,
    items: {}
  })
  const [availablePositions, setAvailablePositions] = useState([])

  const handleAdd = () => {
    const initialItems = {}
    salaryItems.forEach(item => {
      initialItems[item.id] = 0
    })
    setFormData({ organizationId: null, positionId: null, items: initialItems })
    setAvailablePositions([])
    setIsModalOpen(true)
  }

  const handleOrganizationChange = (orgId) => {
    const filtered = positions.filter(p => p.organizationId === Number(orgId))
    setAvailablePositions(filtered)
    setFormData({ ...formData, organizationId: Number(orgId), positionId: null })
  }

  const handleItemChange = (itemId, value) => {
    setFormData({
      ...formData,
      items: { ...formData.items, [itemId]: Number(value) }
    })
  }

  const handleSave = () => {
    if (!formData.organizationId || !formData.positionId) {
      alert('请选择机构和职位')
      return
    }

    const org = organizations.find(o => o.id === formData.organizationId)
    const pos = positions.find(p => p.id === formData.positionId)
    const total = Object.values(formData.items).reduce((sum, val) => sum + val, 0)

    const newStandard = {
      id: Date.now(),
      organizationId: formData.organizationId,
      organizationName: org.name,
      organizationPath: org.path,
      positionId: formData.positionId,
      positionName: pos.name,
      items: formData.items,
      total,
      status: 'pending',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false })
    }

    setStandards([newStandard, ...standards])
    setIsModalOpen(false)
    alert('薪酬标准已提交，等待复核')
  }

  const getTotalAmount = () => {
    return Object.values(formData.items).reduce((sum, val) => sum + val, 0)
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">薪酬标准登记</h2>
              <p className="text-gray-500">为指定职位+机构组合设置薪酬标准</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 shadow-sm cursor-pointer"
            >
              + 登记薪酬标准
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">标准总数</p>
                <p className="text-3xl font-semibold text-gray-900">{standards.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                💵
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">待复核</p>
                <p className="text-3xl font-semibold text-gray-900">{standards.filter(s => s.status === 'pending').length}</p>
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
                <p className="text-3xl font-semibold text-gray-900">{standards.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                📈
              </div>
            </div>
          </div>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属机构</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">薪酬总额</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">登记时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {standards.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500">暂无薪酬标准数据</p>
                    </td>
                  </tr>
                ) : (
                  standards.map((standard) => (
                    <tr key={standard.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 font-medium text-gray-900">{standard.positionName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{standard.organizationPath}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">¥{standard.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          ⏳ 待复核
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{standard.createTime}</td>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">登记薪酬标准</h3>
              <p className="text-sm text-gray-500 mt-1">为职位设置薪酬标准</p>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
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
                    onChange={(e) => setFormData({ ...formData, positionId: Number(e.target.value) })}
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

              {/* 薪酬项目 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  薪酬项目设置
                </h4>
                <div className="space-y-3">
                  {salaryItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{item.type === 'fixed' ? '📌' : '📊'}</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.type === 'fixed' ? '固定项' : '浮动项'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">¥</span>
                        <input
                          type="number"
                          value={formData.items[item.id] || 0}
                          onChange={(e) => handleItemChange(item.id, e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                          min="0"
                          step="100"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 总额显示 */}
                <div className="mt-4 bg-[#59168b]/5 border-2 border-[#59168b] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">薪酬总额</span>
                    <span className="text-2xl font-bold text-[#59168b]">¥{getTotalAmount().toLocaleString()}</span>
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
                提交登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryStandardRegister


