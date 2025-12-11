import React, { useState } from 'react'

const EmployeeSalary = () => {
  const [salaryRecords] = useState([
    {
      id: 1,
      month: '2024-01',
      items: [
        { name: '基本工资', amount: 8000 },
        { name: '绩效奖金', amount: 3000 },
        { name: '交通补贴', amount: 500 },
        { name: '餐饮补贴', amount: 500 }
      ],
      total: 12000,
      paymentDate: '2024-01-31',
      status: 'paid'
    },
    {
      id: 2,
      month: '2023-12',
      items: [
        { name: '基本工资', amount: 8000 },
        { name: '绩效奖金', amount: 2500 },
        { name: '交通补贴', amount: 500 },
        { name: '餐饮补贴', amount: 500 }
      ],
      total: 11500,
      paymentDate: '2023-12-31',
      status: 'paid'
    },
    {
      id: 3,
      month: '2023-11',
      items: [
        { name: '基本工资', amount: 8000 },
        { name: '绩效奖金', amount: 3500 },
        { name: '交通补贴', amount: 500 },
        { name: '餐饮补贴', amount: 500 }
      ],
      total: 12500,
      paymentDate: '2023-11-30',
      status: 'paid'
    }
  ])

  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleViewDetail = (record) => {
    setSelectedRecord(record)
    setIsDetailOpen(true)
  }

  const getTotalSalary = () => {
    return salaryRecords.reduce((sum, record) => sum + record.total, 0)
  }

  const getAverageSalary = () => {
    return salaryRecords.length > 0 ? Math.round(getTotalSalary() / salaryRecords.length) : 0
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">我的薪酬记录</h2>
            <p className="text-gray-500">查看历次薪酬发放明细</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">发放记录</p>
                <p className="text-3xl font-semibold text-gray-900">{salaryRecords.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                💸
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">累计收入</p>
                <p className="text-2xl font-semibold text-gray-900">¥{getTotalSalary().toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                💰
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">月均收入</p>
                <p className="text-2xl font-semibold text-gray-900">¥{getAverageSalary().toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                📊
              </div>
            </div>
          </div>
        </div>

        {/* 薪酬记录列表 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">发放月份</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">薪酬总额</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">发放日期</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salaryRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-[#59168b]/10 flex items-center justify-center">
                          <span className="text-lg">📅</span>
                        </div>
                        <span className="font-medium text-gray-900">{record.month}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold text-[#59168b]">¥{record.total.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{record.paymentDate}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ✓ 已发放
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetail(record)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 cursor-pointer"
                      >
                        查看明细
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-2xl">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">温馨提示</p>
              <p className="mt-1">如对薪酬发放有任何疑问，请联系人事部门或财务部门</p>
            </div>
          </div>
        </div>
      </div>

      {/* 详情模态框 */}
      {isDetailOpen && selectedRecord && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">薪酬明细</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedRecord.month} 月度薪酬</p>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">发放月份</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRecord.month}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">发放日期</p>
                  <p className="text-sm font-medium text-gray-900">{selectedRecord.paymentDate}</p>
                </div>
              </div>

              {/* 薪酬项目明细 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  薪酬项目明细
                </h4>
                <div className="space-y-2">
                  {selectedRecord.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="text-base font-semibold text-gray-900">¥{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* 总额 */}
                <div className="mt-4 bg-[#59168b]/5 border-2 border-[#59168b] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">实发总额</span>
                    <span className="text-2xl font-bold text-[#59168b]">¥{selectedRecord.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeSalary


