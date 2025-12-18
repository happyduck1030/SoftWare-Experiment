import React, { useState, useEffect, useMemo } from 'react'
import { getArchives, getOrganizations, getPositions } from '../../services/adminService'
import confirm from '../../lib/confirm'

const ArchiveSearch = () => {
  const [archives, setArchives] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 假数据保留作为注释参考
  // const [archives] = useState([
  //   { id: 1, name: '张三', gender: '男', idCard: '110101199001011234', phone: '13800138000', entryDate: '2024-01-15', organizationPath: '总公司 / 技术部 / 前端组', positionName: '前端工程师', status: 'approved' },
  //   { id: 2, name: '李四', gender: '男', idCard: '110101199102021235', phone: '13800138001', entryDate: '2024-01-10', organizationPath: '总公司 / 技术部 / 后端组', positionName: '后端工程师', status: 'approved' },
  //   { id: 3, name: '王五', gender: '女', idCard: '110101199203031236', phone: '13800138002', entryDate: '2024-01-08', organizationPath: '总公司 / 人事部 / 招聘组', positionName: '招聘专员', status: 'approved' },
  //   { id: 4, name: '赵六', gender: '女', idCard: '110101199304041237', phone: '13800138003', entryDate: '2024-01-05', organizationPath: '总公司 / 财务部 / 会计组', positionName: '会计', status: 'approved' },
  // ])

  const [searchParams, setSearchParams] = useState({
    name: '',
    phone: '',
    organizationId: '',
    positionId: ''
  })

  const [filteredArchives, setFilteredArchives] = useState([])
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const [selectedArchive, setSelectedArchive] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 并行加载所有数据
        const [archivesRes, orgsRes, positionsRes] = await Promise.all([
          getArchives({ reviewed: true }), // 只获取已复核的档案
          getOrganizations(),
          getPositions()
        ])
        
        // 处理机构数据
        const orgsData = (orgsRes.data || []).filter(org => org.org_level === 3)
        const formattedOrgs = orgsData.map(org => {
          const parent = org.parent_org_id?._id || org.parent_org_id || org.parent_id?._id || org.parent_id || org.parent || org.parentId || ''
          return {
            id: String(org._id),
            name: org.org_name,
            level: org.org_level,
            path: org.fullPath || org.org_name,
            parentId: parent ? String(parent) : ''
          }
        })
        setOrganizations(formattedOrgs)
        
        // 处理职位数据
        const positionsData = positionsRes.data || []
        const formattedPositions = positionsData.map(pos => ({
          id: pos._id,
          name: pos.pos_name,
          organizationId: pos.org_id?._id || pos.org_id
        }))
        setPositions(formattedPositions)

        // 构建机构 Map，计算路径
        const orgMap = {}
        formattedOrgs.forEach(o => { orgMap[o.id] = o })

        const buildPath = (orgId) => {
          const names = []
          let cur = orgMap[orgId]
          while (cur) {
            names.unshift(cur.name)
            cur = orgMap[cur.parentId]
          }
          return {
            path: names.join(' / '),
            levels: names
          }
        }

        // 处理档案数据
        const archivesData = archivesRes.data || []
        const formattedArchives = archivesData.map(archive => {
          const orgId = archive.pos_id?.org_id?._id || archive.pos_id?.org_id
          const { path, levels } = orgId ? buildPath(String(orgId)) : { path: '', levels: [] }
          const statusRaw = archive.status || (archive.reviewed ? '已复核' : '待复核')
          const status =
            statusRaw === '已驳回'
              ? '已驳回'
              : archive.reviewed
              ? '已复核'
              : '待复核'
          return {
            id: archive._id,
            name: archive.name,
            gender: archive.gender,
            idCard: archive.id_card,
            phone: archive.phone,
            entryDate: archive.hire_date ? new Date(archive.hire_date).toISOString().split('T')[0] : '',
            organizationPath: path,
            organizationLevels: levels,
            positionName: archive.pos_id?.pos_name || '',
            organizationId: orgId ? String(orgId) : '',
            positionId: archive.pos_id?._id,
            status
          }
        })
        setArchives(formattedArchives)
        setFilteredArchives(formattedArchives)
        
      } catch (error) {
        console.error('加载数据失败:', error)
        // 可以在这里添加错误提示
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleSearch = () => {
    const filtered = archives.filter(archive => {
      const matchName = !searchParams.name || archive.name.includes(searchParams.name)
      const matchPhone = !searchParams.phone || archive.phone.includes(searchParams.phone)
      const matchOrg = !searchParams.organizationId || archive.organizationId === searchParams.organizationId
      const matchPos = !searchParams.positionId || archive.positionId === searchParams.positionId
      return matchName && matchPhone && matchOrg && matchPos
    })
    setFilteredArchives(filtered)
  }

  const handleReset = () => {
    setSearchParams({ name: '', phone: '', organizationId: '', positionId: '' })
    setFilteredArchives(archives)
  }

  const handleViewDetail = (archive) => {
    setSelectedArchive(archive)
    setIsDetailOpen(true)
  }

  return (
    <div className="h-full bg-gradient-to-b from-[#f8f9ff] via-white to-[#f9fbff] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 搜索卡片 */}
        <div className="bg-white/80 backdrop-blur border border-[#e6e9ff] shadow-[0_10px_40px_-24px_rgba(89,22,139,0.35)] rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-[#7c3aed] uppercase tracking-[0.08em] mb-2">档案中心</p>
              <h2 className="text-2xl font-semibold text-gray-900">档案查询</h2>
              <p className="text-sm text-gray-500 mt-1">按姓名、电话、机构、职位快速筛选员工档案</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#eef2ff] text-[#4f46e5] text-xs font-medium">实时过滤</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fef3c7] text-[#d97706] text-xs font-medium">层级标签</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
              <input
                type="text"
                value={searchParams.name}
                onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                placeholder="请输入姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
              <input
                type="text"
                value={searchParams.phone}
                onChange={(e) => setSearchParams({ ...searchParams, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                placeholder="请输入电话"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">所属机构（三级）</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOrgDropdownOpen(prev => !prev)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent bg-white"
                >
                  <span className={searchParams.organizationId ? 'text-gray-900' : 'text-gray-400'}>
                    {searchParams.organizationId
                      ? (organizations.find(o => o.id === searchParams.organizationId)?.path || '全部')
                      : '全部三级机构'}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>
                {orgDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchParams({ ...searchParams, organizationId: '' })
                        setOrgDropdownOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      全部
                    </button>
                    {organizations.map(org => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setSearchParams({ ...searchParams, organizationId: org.id })
                          setOrgDropdownOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {org.path}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">职位</label>
              <select
                value={searchParams.positionId}
                onChange={(e) => setSearchParams({ ...searchParams, positionId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
              >
                <option value="">全部</option>
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>{pos.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-[#6d1fa7] to-[#8b5cf6] hover:from-[#59168b] hover:to-[#7c3aed] text-white font-medium rounded-xl transition-all duration-200 shadow-md cursor-pointer"
            >
              搜索
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-150 cursor-pointer"
            >
              重置
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 hover:border-[#c7d2fe] transition-colors duration-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-[#6b7280] tracking-[0.1em] mb-2">员工总数</p>
                <p className="text-3xl font-semibold text-gray-900">{archives.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#eef2ff] flex items-center justify-center text-2xl text-[#4f46e5]">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 hover:border-[#bae6fd] transition-colors duration-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-[#6b7280] tracking-[0.1em] mb-2">查询结果</p>
                <p className="text-3xl font-semibold text-gray-900">{filteredArchives.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#e0f2fe] flex items-center justify-center text-2xl text-[#0284c7]">
                🔍
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 hover:border-[#bbf7d0] transition-colors duration-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-[#6b7280] tracking-[0.1em] mb-2">本月入职</p>
                <p className="text-3xl font-semibold text-gray-900">4</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] flex items-center justify-center text-2xl text-[#16a34a]">
                📈
              </div>
            </div>
          </div>
        </div>

        {/* 结果列表 */}
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-[#f8fafc] to-[#f4f5ff] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">姓名</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">性别</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">联系电话</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">入职日期</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属机构</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-gray-500">加载中...</p>
                    </td>
                  </tr>
                ) : filteredArchives.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="text-6l mb-4">🔍</div>
                      <p className="text-gray-500">未找到符合条件的档案</p>
                    </td>
                  </tr>
                ) : (
                  filteredArchives.map((archive) => (
                    <tr key={archive.id} className="hover:bg-[#f8fafc] transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-[#59168b]/10 flex items-center justify-center text-sm font-medium text-[#59168b]">
                            {archive.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{archive.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{archive.gender}</td>
                      <td className="px-6 py-4 text-gray-700">{archive.phone}</td>
                      <td className="px-6 py-4 text-gray-700">{archive.entryDate}</td>
                      <td className="px-6 py-4 text-gray-700">{archive.positionName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {archive.organizationLevels && archive.organizationLevels.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {archive.organizationLevels.map((lvl, idx) => (
                              <span
                                key={`${archive.id}-org-${idx}`}
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${
                                  idx === 0
                                    ? 'bg-[#eef2ff] border-[#e0e7ff] text-[#4338ca]'
                                    : idx === 1
                                    ? 'bg-[#ecfeff] border-[#cffafe] text-[#0ea5e9]'
                                    : 'bg-[#fef3c7] border-[#fde68a] text-[#b45309]'
                                }`}
                              >
                                {`L${idx + 1} ${lvl}`}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              archive.status === '已复核'
                                ? 'bg-green-100 text-green-700'
                                : archive.status === '已驳回'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {archive.status === '已复核'
                              ? '已复核'
                              : archive.status === '已驳回'
                              ? '已驳回'
                              : '待复核'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewDetail(archive)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap shadow-sm inline-flex items-center justify-center"
                          >
                            查看详情
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 详情模态框 */}
      {isDetailOpen && selectedArchive && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">员工档案详情</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">姓名</p>
                  <p className="text-sm font-medium text-gray-900">{selectedArchive.name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">性别</p>
                  <p className="text-sm font-medium text-gray-900">{selectedArchive.gender}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-gray-500 mb-1">身份证号</p>
                  <p className="text-sm font-medium text-gray-900">{selectedArchive.idCard}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">联系电话</p>
                  <p className="text-sm font-medium text-gray-900">{selectedArchive.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">入职日期</p>
                  <p className="text-sm font-medium text-gray-900">{selectedArchive.entryDate}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">职位</p>
                  <p className="text-sm font-medium text-gray-900">{selectedArchive.positionName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-gray-500 mb-1">所属机构</p>
                  <p className="text-sm font-medium text-gray-900">{selectedArchive.organizationPath}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArchiveSearch


