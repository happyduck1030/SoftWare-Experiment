import React, { useEffect, useState, useCallback } from 'react'
import { message, Spin } from 'antd'
import { getOrganizations } from '../../services/adminService'
import { previewSalaryPayments, registerSalaryPayments } from '../../services/adminService'

const SalaryPaymentRegister = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [payments, setPayments] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [level1, setLevel1] = useState([])
  const [level2, setLevel2] = useState([])
  const [level3, setLevel3] = useState([])
  const [selectedOrg, setSelectedOrg] = useState({ l1: '', l2: '', l3: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ month: '', organizationId: null })
  const [employeeList, setEmployeeList] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const loadOrganizations = useCallback(async () => {
    try {
      const res = await getOrganizations({ limit: 500 })
      if (res.success) {
        const list = res.data || []
        setOrganizations(list)
        const l1 = list.filter(o => o.org_level === 1)
        const l2 = list.filter(o => o.org_level === 2)
        const l3 = list.filter(o => o.org_level === 3)
        setLevel1(l1)
        setLevel2(l2)
        setLevel3(l3)
      }
    } catch (error) {
      console.error(error)
      messageApi.error('获取机构列表失败')
    }
  }, [messageApi])

  const handleAdd = () => {
    setEmployeeList([])
    setIsModalOpen(true)
  }

  const handleLoadEmployees = useCallback(async () => {
    if (!formData.organizationId) return
    try {
      const res = await previewSalaryPayments({
        org_id: formData.organizationId,
        month: formData.month
      })
      if (res.success) {
        const list = (res.data?.employees || []).map(emp => ({
          id: emp.empId,
          name: emp.name,
          positionName: emp.positionName,
          baseSalary: emp.baseAmount,
          items: emp.items,
          bonusAmount: 0,
          deductionAmount: 0
        }))
        setEmployeeList(list)
        messageApi.success('已加载员工标准薪酬')
      } else {
        messageApi.error(res.message || '加载员工失败')
      }
    } catch (error) {
      console.error(error)
      messageApi.error(error.message || '加载员工失败')
    }
  }, [formData.month, formData.organizationId, messageApi])

  useEffect(() => {
    // 初始化月份和机构列表
    const currentMonth = new Date().toISOString().slice(0, 7)
    setFormData({ month: currentMonth, organizationId: null })
    loadOrganizations()
  }, [loadOrganizations])

  useEffect(() => {
    if (formData.organizationId) {
      handleLoadEmployees()
    } else {
      setEmployeeList([])
    }
  }, [formData.organizationId, formData.month, handleLoadEmployees])

  const handleLevelChange = (level, value) => {
    if (level === 'l1') {
      setSelectedOrg({ l1: value, l2: '', l3: '' })
      setFormData({ ...formData, organizationId: null })
    } else if (level === 'l2') {
      setSelectedOrg(prev => ({ ...prev, l2: value, l3: '' }))
      setFormData({ ...formData, organizationId: null })
    } else {
      setSelectedOrg(prev => ({ ...prev, l3: value }))
      setFormData({ ...formData, organizationId: value || null })
    }
  }

  const handleBonusChange = (empId, value) => {
    setEmployeeList(prev => prev.map(emp => emp.id === empId ? { ...emp, bonusAmount: Number(value || 0) } : emp))
  }

  const handleDeductionChange = (empId, value) => {
    setEmployeeList(prev => prev.map(emp => emp.id === empId ? { ...emp, deductionAmount: Number(value || 0) } : emp))
  }

  const calcActualSalary = (emp) => {
    return (emp.baseSalary || 0) + (emp.bonusAmount || 0) - (emp.deductionAmount || 0)
  }

  const OrgDropdown = ({ placeholder, value, onChange, options, disabled }) => {
    const [open, setOpen] = useState(false)
    const selected = options.find(o => o.value === value)
    const display = selected ? selected.label : placeholder

    const toggle = () => {
      if (!disabled) setOpen(prev => !prev)
    }

    const handleSelect = (val) => {
      onChange(val)
      setOpen(false)
    }

    return (
      <div className={`relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        <button
          type="button"
          onClick={toggle}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-linear-to-br from-white via-white to-gray-50 shadow-[0_1px_0_rgba(15,23,42,0.02)] flex items-center justify-between text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent"
        >
          <span className={selected ? 'text-gray-900' : 'text-gray-400'}>{display}</span>
          <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#59168b]/10 text-xs text-[#59168b]">
            ▾
          </span>
        </button>
        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl shadow-slate-900/5 max-h-56 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-500">暂无可选机构</div>
            ) : (
              options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    value === opt.value
                      ? 'bg-[#59168b]/10 text-[#59168b] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  const handleSave = async () => {
    if (!formData.month || !formData.organizationId || employeeList.length === 0) {
      messageApi.warning('请填写完整信息并加载员工列表')
      return
    }
    try {
      setSubmitting(true)
      const payload = {
        month: formData.month,
        org_id: formData.organizationId,
        employees: employeeList.map(emp => ({
          empId: emp.id,
          bonusAmount: emp.bonusAmount || 0,
          deductionAmount: emp.deductionAmount || 0
        }))
      }
      const res = await registerSalaryPayments(payload)
      if (res.success) {
        messageApi.success('薪酬发放登记成功')
        // 追加到列表展示
        const org = organizations.find(o => o._id === formData.organizationId)
        const newPayment = {
          id: Date.now(),
          month: formData.month,
          organizationPath: org ? org.org_name : '',
          employeeCount: employeeList.length,
          totalAmount: employeeList.reduce((sum, emp) => sum + calcActualSalary(emp), 0),
          status: 'pending',
          createTime: new Date().toLocaleString('zh-CN', { hour12: false })
        }
        setPayments([newPayment, ...payments])
        setIsModalOpen(false)
      } else {
        messageApi.error(res.message || '登记失败')
      }
    } catch (error) {
      console.error(error)
      messageApi.error(error.message || '登记失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {contextHolder}
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
                  <div className="flex flex-col gap-3">
                    <OrgDropdown
                      placeholder="一级机构"
                      value={selectedOrg.l1}
                      onChange={(val) => handleLevelChange('l1', val)}
                      options={level1.map(org => ({ value: String(org._id), label: org.org_name }))}
                      disabled={false}
                    />
                    <OrgDropdown
                      placeholder="二级机构"
                      value={selectedOrg.l2}
                      onChange={(val) => handleLevelChange('l2', val)}
                      options={level2
                        .filter(o => {
                          const p = o.parent_org_id
                          const pid = typeof p === 'object' ? p?._id : p
                          return String(pid) === String(selectedOrg.l1)
                        })
                        .map(org => ({ value: String(org._id), label: org.org_name }))}
                      disabled={!selectedOrg.l1}
                    />
                    <OrgDropdown
                      placeholder="三级机构"
                      value={selectedOrg.l3}
                      onChange={(val) => handleLevelChange('l3', val)}
                      options={level3
                        .filter(o => {
                          const p = o.parent_org_id
                          const pid = typeof p === 'object' ? p?._id : p
                          return String(pid) === String(selectedOrg.l2)
                        })
                        .map(org => ({ value: String(org._id), label: org.org_name }))}
                      disabled={!selectedOrg.l2}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">员工薪酬列表</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto min-h-[260px]">
                  {employeeList.length === 0 ? (
                    <>
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center text-sm text-gray-500">
                        请选择到 <span className="font-semibold text-[#59168b]">三级机构</span> 后，系统会自动加载该机构的员工名单。
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                        <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                      </div>
                    </>
                  ) : (
                    employeeList.map(emp => (
                      <div key={emp.id} className="space-y-2 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{emp.name}</p>
                            <p className="text-xs text-gray-500">{emp.positionName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">基本薪酬</p>
                            <p className="text-sm font-medium text-gray-700">¥{emp.baseSalary.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          薪酬明细：{emp.items.map(it => `${it.itemName} ¥${it.amount}`).join('； ')}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">奖励金额</label>
                            <input type="number" value={emp.bonusAmount} onChange={(e) => handleBonusChange(emp.id, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#59168b]" min="0" step="100" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">应扣金额</label>
                            <input type="number" value={emp.deductionAmount} onChange={(e) => handleDeductionChange(emp.id, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#59168b]" min="0" step="100" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">实发 = 基本薪酬 + 奖励 - 扣款</span>
                          <span className="text-lg font-semibold text-[#59168b]">¥{(emp.baseSalary + emp.bonusAmount - emp.deductionAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 bg-[#59168b]/5 border-2 border-[#59168b] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">发放总额</span>
                    <span className="text-2xl font-bold text-[#59168b]">
                      ¥{employeeList.reduce((sum, emp) => sum + (emp.baseSalary + emp.bonusAmount - emp.deductionAmount), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200 sticky bottom-0">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 cursor-pointer">取消</button>
              <button onClick={handleSave} className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer" disabled={submitting}>
                {submitting ? '提交中...' : '提交登记'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default SalaryPaymentRegister


