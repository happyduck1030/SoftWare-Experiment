import React, { useState, useEffect } from 'react'
import { getArchives, getOrganizations, getPositions } from '../../services/adminService'

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
        
        // 处理档案数据
        const archivesData = archivesRes.data || []
        const formattedArchives = archivesData.map(archive => ({
          id: archive._id,
          name: archive.name,
          gender: archive.gender,
          idCard: archive.id_card,
          phone: archive.phone,
          entryDate: archive.hire_date ? new Date(archive.hire_date).toISOString().split('T')[0] : '',
          organizationPath: archive.organizationPath || '',
          positionName: archive.pos_id?.pos_name || '',
          organizationId: archive.pos_id?.org_id?._id || archive.pos_id?.org_id,
          positionId: archive.pos_id?._id,
          status: archive.reviewed ? 'approved' : 'pending'
        }))
        setArchives(formattedArchives)
        setFilteredArchives(formattedArchives)
        
        // 处理机构数据
        const orgsData = orgsRes.data || []
        const formattedOrgs = orgsData.map(org => ({
          id: org._id,
          name: org.org_name,
          path: org.fullPath || org.org_name
        }))
        setOrganizations(formattedOrgs)
        
        // 处理职位数据
        const positionsData = positionsRes.data || []
        const formattedPositions = positionsData.map(pos => ({
          id: pos._id,
          name: pos.pos_name,
          organizationId: pos.org_id?._id || pos.org_id
        }))
        setPositions(formattedPositions)
        
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
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 搜索卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">档案查询</h2>
          
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
              <label className="block text-sm font-medium text-gray-700 mb-2">所属机构</label>
              <select
                value={searchParams.organizationId}
                onChange={(e) => setSearchParams({ ...searchParams, organizationId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
              >
                <option value="">全部</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.path}</option>
                ))}
              </select>
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
              className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 cursor-pointer"
            >
              搜索
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            >
              重置
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">员工总数</p>
                <p className="text-3xl font-semibold text-gray-900">{archives.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">查询结果</p>
                <p className="text-3xl font-semibold text-gray-900">{filteredArchives.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                🔍
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">本月入职</p>
                <p className="text-3xl font-semibold text-gray-900">4</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                📈
              </div>
            </div>
          </div>
        </div>

        {/* 结果列表 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
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
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-gray-500">加载中...</p>
                    </td>
                  </tr>
                ) : filteredArchives.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-500">未找到符合条件的档案</p>
                    </td>
                  </tr>
                ) : (
                  filteredArchives.map((archive) => (
                    <tr key={archive.id} className="hover:bg-gray-50 transition-colors duration-150">
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
                      <td className="px-6 py-4 text-sm text-gray-500">{archive.organizationPath}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewDetail(archive)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 cursor-pointer"
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


