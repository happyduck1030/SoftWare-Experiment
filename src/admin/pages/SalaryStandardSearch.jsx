import React, { useState } from 'react'

const SalaryStandardSearch = () => {
  const [standards] = useState([
    { id: 1, organizationPath: '总公司 / 技术部 / 前端组', positionName: '前端工程师', total: 12000, status: 'approved', effectiveDate: '2024-01-01' },
    { id: 2, organizationPath: '总公司 / 技术部 / 后端组', positionName: '后端工程师', total: 13000, status: 'approved', effectiveDate: '2024-01-01' },
  ])

  const [searchParams, setSearchParams] = useState({ organizationId: '', positionId: '' })
  const [filteredStandards, setFilteredStandards] = useState(standards)

  const handleSearch = () => {
    setFilteredStandards(standards)
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">薪酬标准查询</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属机构</label>
              <select value={searchParams.organizationId} onChange={(e) => setSearchParams({ ...searchParams, organizationId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b] cursor-pointer">
                <option value="">全部</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">职位</label>
              <select value={searchParams.positionId} onChange={(e) => setSearchParams({ ...searchParams, positionId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#59168b] cursor-pointer">
                <option value="">全部</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleSearch} className="w-full px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl cursor-pointer">搜索</button>
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
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">职位</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">所属机构</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">薪酬总额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">生效日期</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStandards.map((standard) => (
                <tr key={standard.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{standard.positionName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{standard.organizationPath}</td>
                  <td className="px-6 py-4 text-gray-900 font-semibold">¥{standard.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-700">{standard.effectiveDate}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ 已生效</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SalaryStandardSearch


