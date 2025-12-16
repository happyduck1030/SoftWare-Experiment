import React, { useEffect, useMemo, useState } from 'react'
import { message, Spin } from 'antd'
import { getSalaryStandards, getOrganizations, getPositions, getSalaryItems } from '../../services/adminService'

const SalaryStandardSearch = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [standards, setStandards] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [positions, setPositions] = useState([])
  const [salaryItems, setSalaryItems] = useState([])
  const [searchParams, setSearchParams] = useState({ organizationId: '', positionId: '' })
  const [loading, setLoading] = useState(false)
  const [selectedStandard, setSelectedStandard] = useState(null)

  const salaryItemMap = useMemo(() => {
    const m = {}
    salaryItems.forEach(it => { m[it._id] = it.item_name || it.name || it._id })
    return m
  }, [salaryItems])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [stdRes, orgRes, posRes, itemRes] = await Promise.all([
        getSalaryStandards(),
        getOrganizations(),
        getPositions(),
        getSalaryItems()
      ])

      if (stdRes.success) {
        const formatted = (stdRes.data || []).map(s => {
          const org = s.pos_id?.org_id
          const itemsObj = s.items || {}
          const total = Object.values(itemsObj).reduce((sum, v) => sum + Number(v || 0), 0)
          return {
            id: s.id || s._id || s.pos_id?._id,
            organizationId: org?._id || org,
            organizationPath: org?.org_name || '',
            positionId: s.pos_id?._id,
            positionName: s.pos_id?.pos_name || '',
            items: itemsObj,
            total,
            reviewed: s.reviewed,
            effectiveDate: s.created_at || s.createdAt || ''
          }
        })
        setStandards(formatted)
      } else {
        messageApi.error(stdRes.message || '获取薪酬标准失败')
      }

      if (orgRes.success) {
        setOrganizations((orgRes.data || []).map(o => ({ id: o._id, name: o.org_name })))
      }
      if (posRes.success) {
        setPositions((posRes.data || []).map(p => ({ id: p._id, name: p.pos_name, orgId: p.org_id?._id || p.org_id })))
      }
      if (itemRes.success) {
        setSalaryItems(itemRes.data || [])
      }
    } catch (e) {
      console.error(e)
      messageApi.error(e.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredStandards = useMemo(() => {
    return standards.filter(s => {
      const matchOrg = !searchParams.organizationId || s.organizationId === searchParams.organizationId
      const matchPos = !searchParams.positionId || s.positionId === searchParams.positionId
      return matchOrg && matchPos
    })
  }, [standards, searchParams])

  const renderStatusBadge = (reviewed) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${reviewed ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
      {reviewed ? '已复核' : '待复核'}
    </span>
  )

  return (
    <div className="h-full bg-[#fafafa] p-8">
      {contextHolder}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">薪酬标准查询</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属机构</label>
              <select value={searchParams.organizationId} onChange={(e) => setSearchParams({ ...searchParams, organizationId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b] cursor-pointer">
                <option value="">全部</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">职位</label>
              <select value={searchParams.positionId} onChange={(e) => setSearchParams({ ...searchParams, positionId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b] cursor-pointer">
                <option value="">全部</option>
                {positions
                  .filter(p => !searchParams.organizationId || p.orgId === searchParams.organizationId)
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer">筛选</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">标准总数</p>
                <p className="text-3xl font-semibold text-gray-900">{standards.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">💵</div>
            </div>
          </div>
          <div className="bg-[#59168b] rounded-2xl border border-[#3d0a5c] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-100 mb-2">查询结果</p>
                <p className="text-3xl font-semibold text-white">{filteredStandards.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl">🔍</div>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">职位</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">所属机构</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">薪酬总额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">登记时间</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">状态</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStandards.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500">未找到符合条件的标准</p>
                  </td>
                </tr>
              ) : (
                filteredStandards.map((standard) => (
                  <tr key={standard.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{standard.positionName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{standard.organizationPath || '-'}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{(standard.total || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-700">{standard.effectiveDate || ''}</td>
                    <td className="px-6 py-4">{renderStatusBadge(standard.reviewed)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedStandard(standard)}
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

      {/* 像素风详情弹窗 */}
      {selectedStandard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-[#59168b]">薪酬标准详情</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedStandard.positionName || '-'} · {selectedStandard.organizationPath || '-'}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 w-9 h-9 rounded-full border border-transparent hover:border-gray-200 flex items-center justify-center text-lg"
                onClick={() => setSelectedStandard(null)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-[#3d0a5c]/40 rounded-[14px] pointer-events-none" />
                <div className="relative rounded-[14px] border-[3px] border-[#2f0747] bg-gradient-to-br from-[#6f1aa7] via-[#59168b] to-[#2f0747] px-6 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 border border-white/30 rounded-xl flex items-center justify-center text-white text-xl">
                        ￥
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                          STD #{String(selectedStandard.id || '').slice(-4) || '----'}
                        </p>
                        <p className="text-lg font-semibold text-white drop-shadow">
                          {selectedStandard.positionName || '未知职位'} 薪酬标准
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 mb-1">
                        Total
                      </p>
                      <p className="text-3xl font-extrabold text-white drop-shadow-[1px_2px_0_#2f0747]">
                        ¥{(selectedStandard.total || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-[12px] font-mono text-white">
                    <div className="px-3 py-2 rounded-[10px] bg-white/10 border border-white/20">
                      <p className="text-[10px] text-white/70 mb-1">所属机构</p>
                      <p className="text-sm font-semibold text-white">
                        {selectedStandard.organizationPath || '-'}
                      </p>
                    </div>
                    <div className="px-3 py-2 rounded-[10px] bg-white/10 border border-white/20">
                      <p className="text-[10px] text-white/70 mb-1">登记时间</p>
                      <p className="text-sm font-semibold text-white">
                        {selectedStandard.effectiveDate || '-'}
                      </p>
                    </div>
                    <div className="px-3 py-2 rounded-[10px] bg-white/10 border border-white/20">
                      <p className="text-[10px] text-white/70 mb-1">状态</p>
                      <p className="inline-flex items-center gap-2 text-xs font-semibold text-white">
                        <span className="w-2 h-2 bg-[#22c55e] border border-white rounded-[3px]" />
                        {selectedStandard.reviewed ? '已复核' : '待复核'}
                      </p>
                    </div>
                  </div>

                  {/* 项目明细 */}
                  <div className="mt-5 rounded-[12px] bg-white/12 border border-white/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-white">薪酬项目明细</p>
                      <span className="text-[11px] text-white/70">项目数：{Object.keys(selectedStandard.items || {}).length}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedStandard.items || {}).map(([itemId, amount], idx) => {
                        const name = salaryItemMap[itemId] || `项目 ${idx + 1}`
                        return (
                          <div key={itemId || idx} className="flex justify-between items-center px-3 py-2 rounded-lg bg-white/15 border border-white/15 text-white text-sm">
                            <span className="font-medium">{name}</span>
                            <span className="font-semibold">¥{Number(amount || 0).toLocaleString()}</span>
                          </div>
                        )
                      })}
                      {(!selectedStandard.items || Object.keys(selectedStandard.items).length === 0) && (
                        <div className="text-white/70 text-sm">暂无项目明细</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-white/80">
                    <span className="uppercase tracking-[0.18em]">
                      Pixel Salary Standard
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#ef4444] border border-white rounded-[3px]" />
                      <span className="w-1.5 h-1.5 bg-[#facc15] border border-white rounded-[3px]" />
                      <span className="w-1.5 h-1.5 bg-[#22c55e] border border-white rounded-[3px]" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryStandardSearch


