import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { message, Spin } from 'antd'
import confirm from '../../lib/confirm'
import { getSalaryStandards, reviewSalaryStandard, getSalaryItems, withdrawSalaryStandard } from '../../services/adminService'

const SalaryStandardReview = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [standards, setStandards] = useState([])
  const [salaryItems, setSalaryItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirmState, setConfirmState] = useState(null) // { approved: boolean }
  const [activeStatus, setActiveStatus] = useState('all') // all | 已复核 | 待复核 | 已驳回

  const salaryItemMap = useMemo(() => {
    const m = {}
    salaryItems.forEach(it => { m[it._id] = it })
    return m
  }, [salaryItems])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [stdRes, itemRes] = await Promise.all([
        getSalaryStandards(),
        getSalaryItems()
      ])
      if (stdRes.success) {
        const normalized = (stdRes.data || []).map(s => {
          const id = s.id || s._id || s.pos_id?._id
          const itemsObj = s.items || {}
          const total = Object.values(itemsObj).reduce((sum, v) => sum + Number(v || 0), 0)
          const positionName = s.positionName || s.pos_id?.pos_name || s.pos_id?.name || s.pos_name || s.name
          const organizationName = s.organizationName || s.organizationPath || s.pos_id?.org_id?.org_name || s.pos_id?.org_id?.name
          const organizationPath = s.organizationPath || s.pos_id?.org_id?.fullPath || organizationName
          const createTime = s.createTime || s.created_at || s.createdAt
          const status =
            s.status ||
            (s.reviewed ? '已复核' : s.reviewed === false && s.reviewed_by ? '已驳回' : '待复核')
          return {
            ...s,
            id,
            total,
            positionName,
            organizationName,
            organizationPath,
            createTime,
            status
          }
        })
        setStandards(normalized)
      }
      else messageApi.error(stdRes.message || '获取薪酬标准失败')

      if (itemRes.success) setSalaryItems(itemRes.data || [])
      else messageApi.error(itemRes.message || '获取薪酬项目失败')
    } catch (e) {
      console.error(e)
      messageApi.error(e.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }, [messageApi])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleView = (record) => {
    setSelected(record)
    setDetailOpen(true)
  }

  const handleWithdraw = async (standard) => {
    const ok = await confirm({
      title: '确认撤回该薪酬标准？',
      description: '撤回后可重新登记，仍需重新复核。'
    })
    if (!ok) return
    try {
      const targetId = standard.id || standard._id || standard.pos_id?._id
      const res = await withdrawSalaryStandard(targetId)
      if (res.success) {
        messageApi.success('已撤回')
        setStandards(prev =>
          prev.map(s =>
            s.id === standard.id ? { ...s, status: '已撤回', reviewed: false } : s
          )
        )
      } else {
        messageApi.error(res.message || '撤回失败')
      }
    } catch (e) {
      console.error(e)
      messageApi.error(e.message || '撤回失败')
    }
  }

  const doReview = async () => {
    if (!selected || !confirmState) return
    const approved = confirmState.approved
    try {
      setSubmitting(true)
      const targetId = selected.id || selected._id || selected.pos_id?._id
      const res = await reviewSalaryStandard(targetId, approved)
      if (res.success) {
        messageApi.success(approved ? '复核通过' : '已驳回')
        // 不从列表中删除，只更新状态
        setStandards(prev =>
          prev.map(s =>
            s.id === selected.id
              ? { ...s, reviewed: approved, status: approved ? '已复核' : '已驳回' }
              : s
          )
        )
        setDetailOpen(false)
        setSelected(null)
      } else {
        messageApi.error(res.message || '操作失败')
      }
    } catch (e) {
      console.error(e)
      messageApi.error(e.message || '操作失败')
    } finally {
      setSubmitting(false)
      setConfirmState(null)
    }
  }

  const pendingCount = standards.filter(
    s => s.status === '待复核' || (!s.status && s.reviewed === false)
  ).length
  const approvedCount = standards.filter(
    s => s.status === '已复核' || (s.status === undefined && s.reviewed === true)
  ).length
  const rejectedCount = standards.filter(s => s.status === '已驳回').length

  const filteredStandards = useMemo(() => {
    if (activeStatus === 'all') return standards
    return standards.filter(s => s.status === activeStatus)
  }, [activeStatus, standards])

  const renderItems = (itemsObj) => {
    if (!itemsObj) return '—'
    return Object.entries(itemsObj).map(([itemId, amount]) => {
      const name = salaryItemMap[itemId]?.item_name || salaryItemMap[itemId]?.name || '项目'
      return `${name} ¥${amount}`
    }).join('； ')
  }

  const renderStatusBadge = (status) => {
    const s = status || '待复核'
    const cls =
      s === '已复核'
        ? 'bg-green-50 text-green-700 border-green-100'
        : s === '已驳回'
        ? 'bg-red-50 text-red-700 border-red-100'
        : s === '已撤回'
        ? 'bg-gray-50 text-gray-600 border-gray-200'
        : 'bg-orange-50 text-orange-700 border-orange-100'
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${cls}`}>
        {s}
      </span>
    )
  }

  const renderCard = (title, count, color, statusKey) => {
    const active = activeStatus === statusKey
    const base = 'bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer'
    const activeCls = active ? 'ring-2 ring-offset-2 ring-[#59168b] shadow-xl' : ''
    return (
      <div
        className={`${base} ${activeCls}`}
        onClick={() => setActiveStatus(statusKey)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-2">{title}</p>
            <p className="text-3xl font-semibold text-gray-900">{count}</p>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${color}`}>
            {statusKey === '待复核' ? '⏳' : statusKey === '已复核' ? '✓' : '✗'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      {contextHolder}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">薪酬标准复核</h2>
          <p className="text-gray-500">审核待生效的薪酬标准</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {renderCard('待复核', pendingCount, 'bg-orange-50 text-orange-500', '待复核')}
          {renderCard('已复核', approvedCount, 'bg-green-50 text-green-600', '已复核')}
          {renderCard('已驳回', rejectedCount, 'bg-red-50 text-red-500', '已驳回')}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spin tip="加载中..." /></div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属机构</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">薪酬项目</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">薪酬总额</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">审核状态</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">登记时间</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStandards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-gray-500">暂无符合条件的标准</p>
                  </td>
                </tr>
              ) : (
                filteredStandards.map((standard) => (
                  <tr key={standard.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{standard.positionName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{standard.organizationName || standard.organizationPath || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{renderItems(standard.items)}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{(standard.total || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">{renderStatusBadge(standard.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{standard.createTime || ''}</td>
                    <td className="px-6 py-4 text-center">
                      {standard.status === '已撤回' ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : standard.status === '已复核' ? (
                        <button
                          onClick={() => handleWithdraw(standard)}
                          className="px-4 py-2 text-sm font-medium text-[#59168b] bg-white border border-[#59168b]/50 hover:bg-[#59168b]/10 rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          撤回
                        </button>
                      ) : (
                        <button
                          onClick={() => handleView(standard)}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#59168b] hover:bg-[#6d1fa7] rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          复核
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {detailOpen && selected && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 py-8">
          <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">薪酬标准详情</p>
                <p className="text-lg font-semibold text-gray-900">{selected.positionName || ''}</p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => { setDetailOpen(false); setSelected(null) }}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">职位</p>
                  <p className="text-sm font-medium text-gray-900">{selected.positionName || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">所属机构</p>
                  <p className="text-sm font-medium text-gray-900">{selected.organizationName || selected.organizationPath || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">审核状态</p>
                    <p className="text-sm font-medium text-gray-900">{selected.status || (selected.reviewed ? '已复核' : '待复核')}</p>
                  </div>
                  {renderStatusBadge(selected.status || (selected.reviewed ? '已复核' : '待复核'))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">薪酬项目明细</h4>
                <div className="space-y-2">
                  {Object.entries(selected.items || {}).map(([itemId, amount]) => (
                    <div key={itemId} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-sm text-gray-700">{salaryItemMap[itemId]?.item_name || salaryItemMap[itemId]?.name || '项目'}</span>
                      <span className="font-semibold text-gray-900">¥{amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-[#59168b]/5 border-2 border-[#59168b] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">薪酬总额</span>
                    <span className="text-2xl font-bold text-[#59168b]">¥{(selected.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => { setDetailOpen(false); setSelected(null) }}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  关闭
                </button>
                <button
                  onClick={() => setConfirmState({ approved: false })}
                  className="flex-1 px-4 py-3 bg-white border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 cursor-pointer"
                  disabled={submitting}
                >
                  驳回
                </button>
                <button
                  onClick={() => setConfirmState({ approved: true })}
                  className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer"
                  disabled={submitting}
                >
                  通过
                </button>
              </div>
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
                {confirmState.approved ? '确定通过此薪酬标准吗？' : '确定驳回此薪酬标准吗？'}
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
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  confirmState.approved ? 'bg-[#59168b] hover:bg-[#6d1fa7]' : 'bg-red-500 hover:bg-red-600'
                }`}
                onClick={doReview}
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

export default SalaryStandardReview

