import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { message, Spin } from 'antd'
import { getSalaryStandards, reviewSalaryStandard, getSalaryItems } from '../../services/adminService'

const SalaryStandardReview = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [standards, setStandards] = useState([])
  const [salaryItems, setSalaryItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [confirmState, setConfirmState] = useState(null) // { approved: boolean }

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
          return {
            ...s,
            id,
            total,
            positionName,
            organizationName,
            organizationPath,
            createTime,
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
    s => s.reviewed === false || s.status === 'pending' || s.status === '待复核'
  ).length

  const renderItems = (itemsObj) => {
    if (!itemsObj) return '—'
    return Object.entries(itemsObj).map(([itemId, amount]) => {
      const name = salaryItemMap[itemId]?.item_name || salaryItemMap[itemId]?.name || '项目'
      return `${name} ¥${amount}`
    }).join('； ')
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
              {standards.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-gray-500">暂无待复核标准</p>
                  </td>
                </tr>
              ) : (
                standards.map((standard) => (
                  <tr key={standard.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{standard.positionName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{standard.organizationName || standard.organizationPath || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{renderItems(standard.items)}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{(standard.total || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {standard.reviewed ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-semibold whitespace-nowrap">
                          已复核
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-semibold whitespace-nowrap">
                          待复核
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{standard.createTime || ''}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleView(standard)}
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
                    <p className="text-sm font-medium text-gray-900">{selected.reviewed ? '已复核' : '待复核'}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    selected.reviewed ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                  }`}>
                    {selected.reviewed ? '已复核' : '待复核'}
                  </span>
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

