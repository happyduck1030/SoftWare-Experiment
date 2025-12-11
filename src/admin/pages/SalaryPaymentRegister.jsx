import React, { useState } from 'react'

const SalaryPaymentRegister = () => {
  const [payments, setPayments] = useState([])
  const [organizations] = useState([
    { id: 5, name: '前端组', path: '总公司 / 技术部 / 前端组' },
    { id: 6, name: '后端组', path: '总公司 / 技术部 / 后端组' },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ month: '', organizationId: null })
  const [employeeList, setEmployeeList] = useState([])

  const handleAdd = () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    setFormData({ month: currentMonth, organizationId: null })
    setEmployeeList([])
    setIsModalOpen(true)
  }

  const handleLoadEmployees = () => {
    if (!formData.organizationId) {
      alert('请先选择机构')
      return
    }
    const mockEmployees = [
      { id: 1, name: '张三', positionName: '前端工程师', baseSalary: 12000, actualSalary: 12000 },
      { id: 2, name: '李四', positionName: '前端工程师', baseSalary: 12000, actualSalary: 12000 },
    ]
    setEmployeeList(mockEmployees)
  }

  const handleSalaryChange = (empId, value) => {
    setEmployeeList(employeeList.map(emp => emp.id === empId ? { ...emp, actualSalary: Number(value) } : emp))
  }

  const handleSave = () => {
    if (!formData.month || !formData.organizationId || employeeList.length === 0) {
      alert('请填写完整信息并加载员工列表')
      return
    }

    const org = organizations.find(o => o.id === formData.organizationId)
    const newPayment = {
      id: Date.now(),
      month: formData.month,
      organizationId: formData.organizationId,
      organizationName: org.name,
      organizationPath: org.path,
      employeeCount: employeeList.length,
      totalAmount: employeeList.reduce((sum, emp) => sum + emp.actualSalary, 0),
      status: 'pending',
      createTime: new Date().toLocaleString('zh-CN', { hour12: false })
    }

    setPayments([newPayment, ...payments])
    setIsModalOpen(false)
    alert('薪酬发放批次已提交，等待复核')
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">薪酬发放登记</h2>
              <p className="text-gray-500">按月份+机构生成薪酬发放批次</p>
            </div>
            <button onClick={handleAdd} className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl shadow-sm cursor-pointer">+ 登记发放批次</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">发放批次</p>
                <p className="text-3xl font-semibold text-gray-900">{payments.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">💸</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">待复核</p>
                <p className="text-3xl font-semibold text-gray-900">{payments.filter(p => p.status === 'pending').length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">⏳</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">本月发放</p>
                <p className="text-3xl font-semibold text-gray-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">✓</div>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">状态</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">登记时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-500">暂无发放批次数据</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{payment.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.organizationPath}</td>
                    <td className="px-6 py-4 text-gray-700">{payment.employeeCount}人</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{payment.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">⏳ 待复核</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{payment.createTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">登记薪酬发放批次</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">发放月份 *</label>
                  <input type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b] cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">所属机构 *</label>
                  <select value={formData.organizationId || ''} onChange={(e) => setFormData({ ...formData, organizationId: Number(e.target.value) })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b] cursor-pointer">
                    <option value="">请选择机构</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.path}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button onClick={handleLoadEmployees} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl cursor-pointer">加载该机构员工</button>
              </div>

              {employeeList.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">员工薪酬列表</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {employeeList.map(emp => (
                      <div key={emp.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
                        <div>
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.positionName}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">标准薪酬</p>
                            <p className="text-sm font-medium text-gray-700">¥{emp.baseSalary.toLocaleString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">¥</span>
                            <input type="number" value={emp.actualSalary} onChange={(e) => handleSalaryChange(emp.id, e.target.value)} className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#59168b]" min="0" step="100" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-[#59168b]/5 border-2 border-[#59168b] rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">发放总额</span>
                      <span className="text-2xl font-bold text-[#59168b]">¥{employeeList.reduce((sum, emp) => sum + emp.actualSalary, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200 sticky bottom-0">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 cursor-pointer">取消</button>
              <button onClick={handleSave} className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer">提交登记</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryPaymentRegister


