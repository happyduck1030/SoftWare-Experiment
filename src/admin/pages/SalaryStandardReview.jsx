import React, { useState } from 'react'

const SalaryStandardReview = () => {
  const [standards, setStandards] = useState([
    {
      id: 1,
      organizationPath: '总公司 / 技术部 / 前端组',
      positionName: '前端工程师',
      items: { 1: 8000, 2: 3000, 3: 500, 4: 500 },
      total: 12000,
      status: 'pending',
      createTime: '2024-01-20 10:00:00'
    }
  ])

  const [salaryItems] = useState([
    { id: 1, name: '基本工资', type: 'fixed' },
    { id: 2, name: '绩效奖金', type: 'floating' },
    { id: 3, name: '交通补贴', type: 'fixed' },
    { id: 4, name: '餐饮补贴', type: 'fixed' },
  ])

  const [selectedStandard, setSelectedStandard] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleViewDetail = (standard) => {
    setSelectedStandard(standard)
    setIsDetailOpen(true)
  }

  const handleApprove = () => {
    if (window.confirm('确定通过此薪酬标准吗？')) {
      setStandards(standards.filter(s => s.id !== selectedStandard.id))
      setIsDetailOpen(false)
      alert('复核通过')
    }
  }

  const handleReject = () => {
    if (window.confirm('确定驳回此薪酬标准吗？')) {
      setStandards(standards.filter(s => s.id !== selectedStandard.id))
      setIsDetailOpen(false)
      alert('已驳回')
    }
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">薪酬标准复核</h2>
          <p className="text-gray-500">审核待生效的薪酬标准</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">待复核</p>
                <p className="text-3xl font-semibold text-gray-900">{standards.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">⏳</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">今日已审</p>
                <p className="text-3xl font-semibold text-gray-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">✓</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">今日驳回</p>
                <p className="text-3xl font-semibold text-gray-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-3xl">✗</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属机构</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">薪酬总额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">登记时间</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {standards.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-gray-500">暂无待复核标准</p>
                  </td>
                </tr>
              ) : (
                standards.map((standard) => (
                  <tr key={standard.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{standard.positionName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{standard.organizationPath}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{standard.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{standard.createTime}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetail(standard)}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#59168b] hover:bg-[#6d1fa7] rounded-lg cursor-pointer"
                      >
                        复核
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDetailOpen && selectedStandard && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">薪酬标准详情</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">职位</p>
                  <p className="text-sm font-medium text-gray-900">{selectedStandard.positionName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">所属机构</p>
                  <p className="text-sm font-medium text-gray-900">{selectedStandard.organizationPath}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">薪酬项目明细</h4>
                <div className="space-y-2">
                  {salaryItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="font-semibold text-gray-900">¥{selectedStandard.items[item.id]?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-[#59168b]/5 border-2 border-[#59168b] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">薪酬总额</span>
                    <span className="text-2xl font-bold text-[#59168b]">¥{selectedStandard.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button onClick={() => setIsDetailOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 cursor-pointer">取消</button>
              <button onClick={handleReject} className="flex-1 px-4 py-3 bg-white border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 cursor-pointer">驳回</button>
              <button onClick={handleApprove} className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer">通过</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryStandardReview


