import React, { useState, useEffect, useMemo, useCallback } from 'react'
import confirm from '../../lib/confirm'
import { toast } from '../../lib/toast'
import { getPositions, createPosition, updatePosition, deletePosition, getOrganizations } from '../../services/adminService'

const PositionSettings = () => {
  const Dropdown = ({ label, value, onChange, options, placeholder = '请选择', disabled = false }) => {
    const [open, setOpen] = useState(false)
    const selected = options.find(o => o.value === value)
    const display = selected ? selected.label : placeholder
    const toggle = () => !disabled && setOpen(prev => !prev)

    return (
      <div className="space-y-2">
        {label && <label className="block text-sm font-medium text-gray-900">{label}</label>}
        <div className={`relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
          <button
            type="button"
            onClick={toggle}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent bg-white"
          >
            <span className={selected ? 'text-gray-900' : 'text-gray-400'}>{display}</span>
            <span className="text-gray-400">▾</span>
          </button>
          {open && (
            <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">暂无数据</div>
              ) : (
                options.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false) }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${value === opt.value ? 'bg-[#59168b]/10 text-[#59168b]' : 'text-gray-700'}`}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const [organizations, setOrganizations] = useState([])
  const orgMap = useMemo(() => {
    const m = {}
    organizations.forEach(o => { m[o.id] = o })
    return m
  }, [organizations])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 假数据保留作为注释参考
  // // 模拟机构数据（实际应该从API获取）
  // const [organizations] = useState([
  //   { id: 5, name: '前端组', level: 3, path: '总公司 / 技术部 / 前端组' },
  //   { id: 6, name: '后端组', level: 3, path: '总公司 / 技术部 / 后端组' },
  //   { id: 7, name: '招聘组', level: 3, path: '总公司 / 人事部 / 招聘组' },
  //   { id: 8, name: '培训组', level: 3, path: '总公司 / 人事部 / 培训组' },
  //   { id: 9, name: '会计组', level: 3, path: '总公司 / 财务部 / 会计组' },
  // ])

  // const [positions, setPositions] = useState([
  //   { id: 1, name: '前端工程师', organizationId: 5, organizationName: '前端组', organizationPath: '总公司 / 技术部 / 前端组', createTime: '2024-01-15' },
  //   { id: 2, name: '后端工程师', organizationId: 6, organizationName: '后端组', organizationPath: '总公司 / 技术部 / 后端组', createTime: '2024-01-15' },
  //   { id: 3, name: '招聘专员', organizationId: 7, organizationName: '招聘组', organizationPath: '总公司 / 人事部 / 招聘组', createTime: '2024-01-16' },
  //   { id: 4, name: '培训师', organizationId: 8, organizationName: '培训组', organizationPath: '总公司 / 人事部 / 培训组', createTime: '2024-01-16' },
  //   { id: 5, name: '会计', organizationId: 9, organizationName: '会计组', organizationPath: '总公司 / 财务部 / 会计组', createTime: '2024-01-17' },
  // ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    orgLevel1Id: '',
    orgLevel2Id: '',
    orgLevel3Id: '',
    isBoss: false
  })
  const [submitting, setSubmitting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState({ org1: '', org2: '', org3: '' })

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 并行加载数据
        const [positionsRes, orgsRes] = await Promise.all([
          getPositions(),
          getOrganizations() // 获取全部机构，用于分级选择
        ])
        
        // 处理职位数据
        const positionsData = positionsRes.data || []
        const formattedPositions = positionsData.map(pos => ({
          id: pos._id,
          name: pos.pos_name,
          organizationId: pos.org_id?._id || pos.org_id,
          organizationName: pos.org_id?.org_name || '',
          organizationPath: pos.org_id?.fullPath || pos.org_id?.org_name || '',
          createTime: pos.created_at ? new Date(pos.created_at).toISOString().split('T')[0] : '',
          isBoss: !!pos.is_boss
        }))
        setPositions(formattedPositions)
        
        // 处理机构数据
        const orgsData = orgsRes.data || []
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
        
      } catch (error) {
        console.error('加载数据失败:', error)
        // 可以在这里添加错误提示
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleAdd = () => {
    setModalMode('add')
    setSelectedPosition(null)
    setFormData({ name: '', orgLevel1Id: '', orgLevel2Id: '', orgLevel3Id: '', isBoss: false })
    setIsModalOpen(true)
  }

  const handleEdit = (position) => {
    setModalMode('edit')
    setSelectedPosition(position)
    // 根据三级机构回溯一级二级
    const chain = (() => {
      const lvl3 = orgMap[position.organizationId]
      const lvl2 = lvl3 ? orgMap[lvl3.parentId] : undefined
      const lvl1 = lvl2 ? orgMap[lvl2.parentId] : undefined
      return {
        orgLevel3Id: position.organizationId || '',
        orgLevel2Id: lvl2?.id || '',
        orgLevel1Id: lvl1?.id || ''
      }
    })()
    setFormData({
      name: position.name,
      ...chain,
      isBoss: !!position.isBoss
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    const ok = await confirm({ title: '确认删除', description: '确定要删除这个职位吗？', okText: '确定', cancelText: '取消' })
    if (!ok) return

    try {
      setSubmitting(true)
      await deletePosition(id)
      setPositions(positions.filter(p => p.id !== id))
      toast.success('职位删除成功')
    } catch (error) {
      console.error('删除职位失败:', error)
      toast.error(error.message || '职位删除失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.warning('请输入职位名称')
      return
    }
    if (!formData.orgLevel3Id) {
      toast.warning('请选择三级机构')
      return
    }

    try {
      setSubmitting(true)
      
      const org = organizations.find(o => o.id === formData.orgLevel3Id)
      
      if (modalMode === 'add') {
        // 准备提交给后端的数据
        const createData = {
          pos_name: formData.name,
          org_id: formData.orgLevel3Id,
          is_boss: formData.isBoss
        }
        
        // 调用API创建职位
        const response = await createPosition(createData)
        const newPositionData = response.data
        
        // 转换为前端格式
        const newPosition = {
          id: newPositionData._id,
          name: newPositionData.pos_name,
          organizationId: newPositionData.org_id?._id || newPositionData.org_id,
          organizationName: newPositionData.org_id?.org_name || org?.name || '',
          organizationPath: newPositionData.org_id?.fullPath || org?.path || '',
          createTime: newPositionData.created_at ? new Date(newPositionData.created_at).toISOString().split('T')[0] : '',
          isBoss: newPositionData.is_boss || formData.isBoss
        }
        setPositions([...positions, newPosition])
      } else {
        // 准备提交给后端的数据
        const updateData = {
          pos_name: formData.name,
          is_boss: formData.isBoss
        }
        
        // 调用API更新职位
        await updatePosition(selectedPosition.id, updateData)
        
        // 更新本地状态
        setPositions(positions.map(p =>
          p.id === selectedPosition.id
            ? {
                ...p,
                name: formData.name,
                organizationName: org?.name || '',
                organizationPath: org?.path || '',
                organizationId: formData.orgLevel3Id || p.organizationId,
                isBoss: formData.isBoss
              }
            : p
        ))
      }

      setIsModalOpen(false)
      setFormData({ name: '', organizationId: null })
      toast.success(modalMode === 'add' ? '职位创建成功' : '职位更新成功')
    } catch (error) {
      console.error('保存职位失败:', error)
      toast.error(error.message || '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const asStr = useCallback((v) => (v === undefined || v === null ? '' : String(v)), [])

  const level1All = useMemo(() => organizations.filter(o => o.level === 1), [organizations])
  const level2All = useMemo(() => organizations.filter(o => o.level === 2), [organizations])
  const level3All = useMemo(() => organizations.filter(o => o.level === 3), [organizations])

  const level1Orgs = level1All
  const level2Orgs = useMemo(() => {
    if (!formData.orgLevel1Id) return []
    return level2All.filter(o => asStr(o.parentId) === asStr(formData.orgLevel1Id))
  }, [level2All, formData.orgLevel1Id, asStr])
  const level3Orgs = useMemo(() => {
    if (!formData.orgLevel2Id) return []
    return level3All.filter(o => asStr(o.parentId) === asStr(formData.orgLevel2Id))
  }, [level3All, formData.orgLevel2Id, asStr])

  const filterLevel2 = useMemo(() => {
    if (!selectedFilter.org1) return []
    return level2All.filter(o => asStr(o.parentId) === asStr(selectedFilter.org1))
  }, [level2All, selectedFilter, asStr])
  const filterLevel3 = useMemo(() => {
    if (!selectedFilter.org2) return []
    return level3All.filter(o => asStr(o.parentId) === asStr(selectedFilter.org2))
  }, [level3All, selectedFilter, asStr])

  const isUnderOrg = (orgId, targetId) => {
    let cur = orgMap[asStr(orgId)]
    while (cur) {
      if (asStr(cur.id) === asStr(targetId)) return true
      cur = orgMap[asStr(cur.parentId)]
    }
    return false
  }

  const filteredPositions = positions
    .filter(p => {
      if (selectedFilter.org3) return asStr(p.organizationId) === asStr(selectedFilter.org3)
      if (selectedFilter.org2) return isUnderOrg(p.organizationId, selectedFilter.org2)
      if (selectedFilter.org1) return isUnderOrg(p.organizationId, selectedFilter.org1)
      return true
    })
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.organizationPath || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">职位设置</h2>
              <p className="text-gray-500">管理职位信息，每个职位必须从属于某个三级机构</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 shadow-sm cursor-pointer"
            >
              + 添加职位
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索职位名称或机构..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
            />
          </div>
        </div>

        {/* 机构筛选级联（shadcn 风格下拉） */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">机构筛选</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Dropdown
                label="一级机构"
                value={selectedFilter.org1}
                onChange={(val) => setSelectedFilter({ org1: val, org2: '', org3: '' })}
                options={[{ value: '', label: '全部' }, ...level1Orgs.map(org => ({ value: org.id, label: org.name }))]}
              />
            </div>
            <div>
              <Dropdown
                label="二级机构"
                value={selectedFilter.org2}
                onChange={(val) => setSelectedFilter(prev => ({ ...prev, org2: val, org3: '' }))}
                options={[{ value: '', label: '全部' }, ...filterLevel2.map(org => ({ value: org.id, label: org.name }))]}
                disabled={!selectedFilter.org1}
              />
            </div>
            <div>
              <Dropdown
                label="三级机构"
                value={selectedFilter.org3}
                onChange={(val) => setSelectedFilter(prev => ({ ...prev, org3: val }))}
                options={[{ value: '', label: '全部' }, ...filterLevel3.map(org => ({ value: org.id, label: org.name }))]}
                disabled={!selectedFilter.org2}
              />
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">职位总数</p>
                <p className="text-3xl font-semibold text-gray-900">{positions.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                💼
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">关联机构</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {new Set(positions.map(p => p.organizationId)).size}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                🏛️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">本月新增</p>
                <p className="text-3xl font-semibold text-gray-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                📈
              </div>
            </div>
          </div>
        </div>

        {/* 职位列表 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位名称</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属机构</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">机构路径</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">负责人</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-gray-500">加载中...</p>
                    </td>
                  </tr>
                ) : filteredPositions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500">暂无职位数据</p>
                    </td>
                  </tr>
                ) : (
                  filteredPositions.map((position) => (
                    <tr key={position.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-[#59168b]/10 flex items-center justify-center text-xl">
                            💼
                          </div>
                          <span className="font-medium text-gray-900">{position.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{position.organizationName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{position.organizationPath}</td>
                      <td className="px-6 py-4 text-gray-700">{position.isBoss ? '是' : '否'}</td>
                      <td className="px-6 py-4 text-gray-700">{position.createTime}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(position)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 cursor-pointer"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(position.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150 cursor-pointer"
                          >
                            删除
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

      {/* 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalMode === 'add' ? '添加职位' : '编辑职位'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {modalMode === 'add' ? '创建新的职位信息' : '修改职位信息'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  职位名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                  placeholder="请输入职位名称"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Dropdown
                    label="一级机构"
                    value={formData.orgLevel1Id}
                    onChange={(val) => setFormData({ ...formData, orgLevel1Id: val, orgLevel2Id: '', orgLevel3Id: '' })}
                    options={[{ value: '', label: '请选择一级机构' }, ...level1Orgs.map(org => ({ value: org.id, label: org.name }))]}
                  />
                </div>
                <div>
                  <Dropdown
                    label="二级机构"
                    value={formData.orgLevel2Id}
                    onChange={(val) => setFormData({ ...formData, orgLevel2Id: val, orgLevel3Id: '' })}
                    options={[{ value: '', label: '请选择二级机构' }, ...level2Orgs.map(org => ({ value: org.id, label: org.name }))]}
                    disabled={!formData.orgLevel1Id}
                  />
                </div>
                <div>
                  <Dropdown
                    label="三级机构"
                    value={formData.orgLevel3Id}
                    onChange={(val) => setFormData({ ...formData, orgLevel3Id: val })}
                    options={[{ value: '', label: '请选择三级机构' }, ...level3Orgs.map(org => ({ value: org.id, label: org.name }))]}
                    disabled={!formData.orgLevel2Id}
                  />
                </div>
              </div>

              <label className="flex items-center space-x-3 text-sm font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={formData.isBoss}
                  onChange={(e) => setFormData({ ...formData, isBoss: e.target.checked })}
                  className="w-4 h-4 text-[#59168b] border-gray-300 rounded focus:ring-[#59168b]"
                />
                <span>设为机构负责人（Boss）</span>
              </label>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#59168b]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#59168b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">注意事项</p>
                    <p className="text-gray-500 mt-1">职位必须从属于某个三级机构</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors duration-150 cursor-pointer"
              >
                {submitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PositionSettings
