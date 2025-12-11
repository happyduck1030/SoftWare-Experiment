import React, { useState } from 'react'

const SalaryStandardUpdate = () => {
  const [standards, setStandards] = useState([
    { id: 1, organizationId: 5, organizationPath: '总公司 / 技术部 / 前端组', positionId: 1, positionName: '前端工程师', items: { 1: 8000, 2: 3000, 3: 500, 4: 500 }, total: 12000 },
  ])

  const [salaryItems] = useState([
    { id: 1, name: '基本工资', type: 'fixed' },
    { id: 2, name: '绩效奖金', type: 'floating' },
    { id: 3, name: '交通补贴', type: 'fixed' },
    { id: 4, name: '餐饮补贴', type: 'fixed' },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStandard, setSelectedStandard] = useState(null)
  const [formData, setFormData] = useState({})

  const handleEdit = (standard) => {
    setSelectedStandard(standard)
    setFormData(standard)
    setIsModalOpen(true)
  }

  const handleItemChange = (itemId, value) => {
    setFormData({ ...formData, items: { ...formData.items, [itemId]: Number(value) } })
  }

  const handleSave = () => {
    const total = Object.values(formData.items).reduce((sum, val) => sum + val, 0)
    setStandards(standards.map(s => s.id === selectedStandard.id ? { ...formData, total } : s))
    setIsModalOpen(false)
    alert('薪酬标准已更新，需重新复核')
  }

  const getTotalAmount = () => {
    return Object.values(formData.items).reduce((sum, val) => sum + val, 0)
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">薪酬标准变更</h2>
          <p className="text-gray-500">修改现有薪酬标准，修改后需重新走复核流程</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">职位</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">所属机构</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">薪酬总额</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {standards.map((standard) => (
                <tr key={standard.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{standard.positionName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{standard.organizationPath}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">¥{standard.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleEdit(standard)} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">变更</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">变更薪酬标准</h3>
              <p className="text-sm text-gray-500 mt-1">{formData.positionName} - {formData.organizationPath}</p>
            </div>

            <div className="p-6 space-y-4">
              {salaryItems.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.type === 'fixed' ? '📌' : '📊'}</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.type === 'fixed' ? '固定项' : '浮动项'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">¥</span>
                    <input type="number" value={formData.items[item.id] || 0} onChange={(e) => handleItemChange(item.id, e.target.value)} className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#59168b]" min="0" step="100" />
                  </div>
                </div>
              ))}

              <div className="bg-[#59168b]/5 border-2 border-[#59168b] rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">薪酬总额</span>
                  <span className="text-2xl font-bold text-[#59168b]">¥{getTotalAmount().toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600 text-xl">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">注意</p>
                    <p className="mt-1">薪酬标准变更后需要重新提交复核流程</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 cursor-pointer">取消</button>
              <button onClick={handleSave} className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer">提交变更</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryStandardUpdate


