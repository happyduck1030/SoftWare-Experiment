import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { message, Modal, Spin } from 'antd'
import { getSalaryPayments, getSalaryPaymentDetail, reviewSalaryPayment } from '../../services/adminService'

const SalaryPaymentReview = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [payments, setPayments] = useState([])
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [employeeDetails, setEmployeeDetails] = useState([])
  const [confirmState, setConfirmState] = useState(null) // { approved: boolean }

  const pendingCount = useMemo(() => payments.filter(p => !p.reviewed).length, [payments])

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getSalaryPayments()
      if (res.success) {
        const list = res.data || res.list || []
        const normalized = list.map(p => ({
          id: p.batchId || p._id || p.batch_id,
          month: p.month,
          employeeCount: undefined, // 初始不信任列表返回的员工数，后续用详情覆盖
          totalAmount: p.totalAmount || 0,
          reviewed: !!p.reviewed
        }))
        setPayments(normalized)
        // 逐个批次获取详情以获得真实员工人数
        normalized.forEach(item => fetchAndSetCount(item.id))
      } else {
        messageApi.error(res.message || '获取薪酬发放列表失败')
      }
    } catch (e) {
      console.error(e)
      messageApi.error(e.message || '获取失败')
    } finally {
      setLoading(false)
    }
  }, [messageApi])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const handleViewDetail = async (payment) => {
    setSelectedPayment(payment)
    setDetailLoading(true)
    try {
      const res = await getSalaryPaymentDetail(payment.id)
      if (res.success) {
        const data = res.data
        const detailEmployees = (data?.employees || []).map(emp => ({
          id: emp.empId,
          name: emp.name,
          positionName: emp.positionName,
          baseAmount: emp.baseAmount,
          bonusAmount: emp.bonusAmount,
          deductionAmount: emp.deductionAmount,
          actualAmount: emp.actualAmount,
          items: emp.items || []
        }))
        setEmployeeDetails(detailEmployees)
        setSelectedPayment(prev => ({
          ...prev,
          month: data?.month || prev.month,
          totalAmount: data?.totalAmount ?? prev.totalAmount,
          employeeCount: detailEmployees.length > 0 ? detailEmployees.length : data?.employees?.length ?? prev.employeeCount
        }))
        // 同步列表显示人数为详情返回的实际人数
        const actualCount = detailEmployees.length || data?.employees?.length || 0
        setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, employeeCount: actualCount || p.employeeCount } : p))
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

  // 单独拉取批次详情以覆盖人数
  const fetchAndSetCount = async (batchId) => {
    try {
      const res = await getSalaryPaymentDetail(batchId)
      if (res.success) {
        const count = res.data?.employees?.length || 0
        setPayments(prev => prev.map(p => p.id === batchId ? { ...p, employeeCount: count } : p))
      }
    } catch (e) {
      console.error('fetch count fail', e)
    }
  }

  const handleApproveReject = (approved) => {
    if (!selectedPayment) return
    setConfirmState({ approved })
  }

  const doConfirm = async () => {
    if (!confirmState || !selectedPayment) return
    const approved = confirmState.approved
    try {
      setSubmitting(true)
      const res = await reviewSalaryPayment(selectedPayment.id, approved)
      if (res.success) {
        messageApi.success(approved ? '复核通过' : '已驳回')
        setPayments(prev => prev.filter(p => p.id !== selectedPayment.id))
        setSelectedPayment(null)
        setEmployeeDetails([])
        setConfirmState(null)
      } else {
        messageApi.error(res.message || '操作失败')
      }
    } catch (e) {
      console.error(e)
      messageApi.error(e.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStatusBadge = (reviewed) => {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${reviewed
        ? 'bg-green-50 text-green-700 border-green-100'
        : 'bg-orange-50 text-orange-700 border-orange-100'
      }`}>
        {reviewed ? '已复核' : '待复核'}
      </span>
    )
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      {contextHolder}
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
                <p className="text-3xl font-semibold text-gray-900">{pendingCount}</p>
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
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spin tip="加载中..." /></div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">发放月份</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">员工人数</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">发放总额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">审核状态</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-gray-500">暂无待复核批次</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{payment.month || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{payment.employeeCount}人</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{(payment.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{renderStatusBadge(payment.reviewed)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetail(payment)}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#59168b] hover:bg-[#6d1fa7] rounded-lg cursor-pointer whitespace-nowrap"
                      >
                        复核
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

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">薪酬发放批次详情</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedPayment.month || ''}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => { setSelectedPayment(null); setEmployeeDetails([]) }}>✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">发放月份</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPayment.month || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">员工人数</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPayment.employeeCount || employeeDetails.length}人</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">发放总额</p>
                  <p className="text-sm font-medium text-[#59168b]">¥{(selectedPayment.totalAmount || 0).toLocaleString()}</p>
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

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button onClick={() => { setSelectedPayment(null); setEmployeeDetails([]) }} className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 cursor-pointer">取消</button>
              <button onClick={() => handleApproveReject(false)} className="flex-1 px-4 py-3 bg-white border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 cursor-pointer" disabled={submitting}>驳回</button>
              <button onClick={() => handleApproveReject(true)} className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer" disabled={submitting}>通过</button>
            </div>
          </div>
        </div>
      )}

      {confirmState && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm">
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {confirmState.approved ? '确认通过' : '确认驳回'}
              </h3>
              <p className="text-sm text-gray-600">
                {confirmState.approved ? '确定通过此薪酬发放批次吗？' : '确定驳回此薪酬发放批次吗？'}
              </p>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setConfirmState(null)}
                disabled={submitting}
              >
                取消
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-lg text-white ${confirmState.approved ? 'bg-[#59168b] hover:bg-[#6d1fa7]' : 'bg-red-500 hover:bg-red-600'}`}
                onClick={doConfirm}
                disabled={submitting}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryPaymentReview


