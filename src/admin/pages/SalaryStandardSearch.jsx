import React, { useEffect, useMemo, useState } from 'react'
import { message, Spin } from 'antd'
import { getSalaryStandards, getOrganizations, getPositions } from '../../services/adminService'

const SalaryStandardSearch = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [standards, setStandards] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [positions, setPositions] = useState([])
  const [searchParams, setSearchParams] = useState({ organizationId: '', positionId: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [stdRes, orgRes, posRes] = await Promise.all([
        getSalaryStandards(),
        getOrganizations(),
        getPositions()
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">查询结果</p>
                <p className="text-3xl font-semibold text-gray-900">{filteredStandards.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">🔍</div>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default SalaryStandardSearch

