import React, { useState } from 'react'

const SalaryPaymentSearch = () => {
  const [payments] = useState([
    { id: 1, month: '2024-01', organizationPath: '总公司 / 技术部 / 前端组', employeeName: '张三', positionName: '前端工程师', salary: 12000, status: 'approved', paymentDate: '2024-01-31' },
    { id: 2, month: '2024-01', organizationPath: '总公司 / 技术部 / 前端组', employeeName: '李四', positionName: '前端工程师', salary: 12000, status: 'approved', paymentDate: '2024-01-31' },
    { id: 3, month: '2023-12', organizationPath: '总公司 / 技术部 / 后端组', employeeName: '王五', positionName: '后端工程师', salary: 13000, status: 'approved', paymentDate: '2023-12-31' },
  ])

  const [searchParams, setSearchParams] = useState({ month: '', employeeName: '', organizationId: '' })
  const [filteredPayments, setFilteredPayments] = useState(payments)

  const handleSearch = () => {
    const filtered = payments.filter(p => {
      const matchMonth = !searchParams.month || p.month === searchParams.month
      const matchName = !searchParams.employeeName || p.employeeName.includes(searchParams.employeeName)
      return matchMonth && matchName
    })
    setFilteredPayments(filtered)
  }

  const handleReset = () => {
    setSearchParams({ month: '', employeeName: '', organizationId: '' })
    setFilteredPayments(payments)
  }

  const getTotalAmount = () => {
    return filteredPayments.reduce((sum, p) => sum + p.salary, 0)
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">薪酬发放查询</h2>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">发放月份</label>
              <input type="month" value={searchParams.month} onChange={(e) => setSearchParams({ ...searchParams, month: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b] cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">员工姓名</label>
              <input type="text" value={searchParams.employeeName} onChange={(e) => setSearchParams({ ...searchParams, employeeName: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b]" placeholder="请输入员工姓名" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属机构</label>
              <select value={searchParams.organizationId} onChange={(e) => setSearchParams({ ...searchParams, organizationId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b] cursor-pointer">
                <option value="">全部</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={handleSearch} className="flex-1 px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer">搜索</button>
              <button onClick={handleReset} className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 cursor-pointer">重置</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">发放记录</p>
                <p className="text-3xl font-semibold text-gray-900">{payments.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">💸</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">查询结果</p>
                <p className="text-3xl font-semibold text-gray-900">{filteredPayments.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">🔍</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">总金额</p>
                <p className="text-2xl font-semibold text-gray-900">¥{getTotalAmount().toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">💰</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">发放月份</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">员工姓名</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">职位</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">所属机构</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">薪酬金额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">发放日期</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500">未找到符合条件的发放记录</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{payment.month}</td>
                    <td className="px-6 py-4 text-gray-900">{payment.employeeName}</td>
                    <td className="px-6 py-4 text-gray-700">{payment.positionName}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.organizationPath}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{payment.salary.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-700">{payment.paymentDate}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ 已发放</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalaryPaymentSearch


