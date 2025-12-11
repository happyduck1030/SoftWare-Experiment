import React, { useState } from 'react'

const SalaryPaymentReview = () => {
  const [payments, setPayments] = useState([
    { id: 1, month: '2024-01', organizationPath: '总公司 / 技术部 / 前端组', employeeCount: 2, totalAmount: 24000, status: 'pending', createTime: '2024-01-25 10:00:00' }
  ])

  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [employeeDetails] = useState([
    { id: 1, name: '张三', positionName: '前端工程师', salary: 12000 },
    { id: 2, name: '李四', positionName: '前端工程师', salary: 12000 },
  ])

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment)
    setIsDetailOpen(true)
  }

  const handleApprove = () => {
    if (window.confirm('确定通过此薪酬发放批次吗？')) {
      setPayments(payments.filter(p => p.id !== selectedPayment.id))
      setIsDetailOpen(false)
      alert('复核通过，薪酬发放已批准')
    }
  }

  const handleReject = () => {
    if (window.confirm('确定驳回此薪酬发放批次吗？')) {
      setPayments(payments.filter(p => p.id !== selectedPayment.id))
      setIsDetailOpen(false)
      alert('已驳回')
    }
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">薪酬发放复核</h2>
          <p className="text-gray-500">审核薪酬发放批次</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">待复核</p>
                <p className="text-3xl font-semibold text-gray-900">{payments.length}</p>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">发放月份</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">所属机构</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">员工人数</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">发放总额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">登记时间</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-gray-500">暂无待复核批次</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{payment.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.organizationPath}</td>
                    <td className="px-6 py-4 text-gray-700">{payment.employeeCount}人</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{payment.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.createTime}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleViewDetail(payment)} className="px-4 py-2 text-sm font-medium text-white bg-[#59168b] hover:bg-[#6d1fa7] rounded-lg cursor-pointer">复核</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isDetailOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">薪酬发放批次详情</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedPayment.month} - {selectedPayment.organizationPath}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">发放月份</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPayment.month}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">员工人数</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPayment.employeeCount}人</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">发放总额</p>
                  <p className="text-sm font-medium text-[#59168b]">¥{selectedPayment.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">员工薪酬明细</h4>
                <div className="space-y-2">
                  {employeeDetails.map(emp => (
                    <div key={emp.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
                      <div>
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.positionName}</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">¥{emp.salary.toLocaleString()}</p>
                    </div>
                  ))}
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

export default SalaryPaymentReview


