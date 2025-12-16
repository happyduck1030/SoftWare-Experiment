import React, { useEffect, useMemo, useState } from 'react'
import { message, Spin } from 'antd'
import { getSalaryPayments, getSalaryPaymentDetail } from '../../services/adminService'

const SalaryPaymentSearch = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [payments, setPayments] = useState([])
  const [searchParams, setSearchParams] = useState({ month: '' })
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [employeeDetails, setEmployeeDetails] = useState([])

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const res = await getSalaryPayments()
      if (res.success) {
        const list = res.data || res.list || []
        const normalized = list.map(p => ({
          id: p.batchId || p._id || p.batch_id,
          month: p.month,
          totalAmount: p.totalAmount || 0,
          employeeCount: p.employeeCount || p.count || 0,
          reviewed: !!p.reviewed
        }))
        setPayments(normalized)
      } else {
        messageApi.error(res.message || '获取薪酬发放列表失败')
      }
    } catch (e) {
      console.error(e)
      messageApi.error(e.message || '获取失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchMonth = !searchParams.month || p.month === searchParams.month
      return matchMonth
    })
  }, [payments, searchParams])

  const getTotalAmount = () => filteredPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0)

  const renderStatusBadge = (reviewed) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${reviewed ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
      {reviewed ? '已复核' : '待复核'}
    </span>
  )

  const handleView = async (batch) => {
    setSelectedBatch(batch)
    setDetailLoading(true)
    try {
      const res = await getSalaryPaymentDetail(batch.id)
      if (res.success) {
        const data = res.data
        setEmployeeDetails((data?.employees || []).map(emp => ({
          id: emp.empId,
          name: emp.name,
          positionName: emp.positionName,
          baseAmount: emp.baseAmount,
          bonusAmount: emp.bonusAmount,
          deductionAmount: emp.deductionAmount,
          actualAmount: emp.actualAmount,
          items: emp.items || []
        })))
        setSelectedBatch(prev => ({
          ...prev,
          month: data?.month || prev.month,
          totalAmount: data?.totalAmount ?? prev.totalAmount,
          employeeCount: data?.employees?.length ?? prev.employeeCount
        }))
      } else {
        messageApi.error(res.message || '获取批次详情失败')
      }
    } catch (e) {
      console.error(e)
      messageApi.error(e.message || '获取批次详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      {contextHolder}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">薪酬发放查询</h2>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">发放月份</label>
              <input type="month" value={searchParams.month} onChange={(e) => setSearchParams({ ...searchParams, month: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b] cursor-pointer" />
            </div>
            <div className="flex items-end gap-2 col-span-3 justify-end">
              <button onClick={loadPayments} className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer">刷新</button>
              <button onClick={() => setSearchParams({ month: '' })} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 cursor-pointer">重置</button>
            </div>
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
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spin tip="加载中..." /></div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">发放月份</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">员工人数</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">发放总额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">状态</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500">未找到符合条件的发放批次</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{payment.month}</td>
                    <td className="px-6 py-4 text-gray-700">{payment.employeeCount}人</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{(payment.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{renderStatusBadge(payment.reviewed)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleView(payment)}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#59168b] hover:bg-[#6d1fa7] rounded-lg cursor-pointer"
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {selectedBatch && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">批次详情</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedBatch.month}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => { setSelectedBatch(null); setEmployeeDetails([]) }}>✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* 像素风批次信息卡片（MotherDuck 风格） */}
              <div className="relative">
                <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black/60 rounded-[10px] pointer-events-none" />
                <div className="relative rounded-[10px] border-[3px] border-black bg-[radial-gradient(circle_at_0_0,#fef9c3,transparent_55%),radial-gradient(circle_at_100%_100%,#bfdbfe,transparent_55%)] px-6 py-5 shadow-[0_0_0_3px_#facc15]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black rounded-[4px] flex items-center justify-center text-yellow-300 text-xl">
                        ★
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-700">
                          Batch #{selectedBatch.id?.slice?.(-4) || '----'}
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedBatch.month || '未知月份'} 薪酬发放批次
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-700 mb-1">Total</p>
                      <p className="text-2xl font-extrabold text-[#1f2933] drop-shadow-[1px_1px_0_#facc15]">
                        ¥{(selectedBatch.totalAmount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-[12px] font-mono">
                    <div className="px-3 py-2 rounded-[6px] bg-white/70 border border-black/10">
                      <p className="text-[10px] text-gray-600 mb-1">发放月份</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedBatch.month || '-'}
                      </p>
                    </div>
                    <div className="px-3 py-2 rounded-[6px] bg-white/70 border border-black/10">
                      <p className="text-[10px] text-gray-600 mb-1">员工人数</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedBatch.employeeCount || employeeDetails.length} 人
                      </p>
                    </div>
                    <div className="px-3 py-2 rounded-[6px] bg-[#22c55e]/10 border border-black/10">
                      <p className="text-[10px] text-gray-700 mb-1">状态</p>
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534]">
                        <span className="w-2 h-2 bg-[#22c55e] border border-black rounded-[3px]" />
                        已复核
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-700">
                    <span className="uppercase tracking-[0.18em]">
                      Pixel Payroll Engine
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#ef4444] border border-black rounded-[3px]" />
                      <span className="w-1.5 h-1.5 bg-[#facc15] border border-black rounded-[3px]" />
                      <span className="w-1.5 h-1.5 bg-[#22c55e] border border-black rounded-[3px]" />
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">员工薪酬明细</h4>
                {detailLoading ? (
                  <div className="flex items-center justify-center py-8"><Spin tip="加载中..." /></div>
                ) : (
                <div className="space-y-2">
                  {employeeDetails.map(emp => (
                    <div key={emp.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.positionName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">实发</p>
                          <p className="text-lg font-semibold text-gray-900">¥{(emp.actualAmount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 space-x-3">
                        <span>基础: ¥{(emp.baseAmount || 0).toLocaleString()}</span>
                        <span>奖金: ¥{(emp.bonusAmount || 0).toLocaleString()}</span>
                        <span>扣款: ¥{(emp.deductionAmount || 0).toLocaleString()}</span>
                      </div>
                      {emp.items?.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                          {emp.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between bg-white rounded-md px-3 py-2 border border-gray-100">
                              <span>{it.itemName}</span>
                              <span className={`${it.isBonus ? 'text-green-600' : it.isDeduction ? 'text-red-600' : 'text-gray-900'} font-semibold`}>¥{(it.amount || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryPaymentSearch


