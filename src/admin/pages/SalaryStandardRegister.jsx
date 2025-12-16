import React, { useState, useEffect, useMemo, useCallback } from 'react'
import confirm from '../../lib/confirm'
import { toast } from '../../lib/toast'
import { getSalaryStandards, createSalaryStandard, getOrganizations, getPositions, getSalaryItems, withdrawSalaryStandard } from '../../services/adminService'

const SalaryStandardRegister = () => {
  const [standards, setStandards] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [level1, setLevel1] = useState([])
  const [level2, setLevel2] = useState([])
  const [level3, setLevel3] = useState([])
  const [positions, setPositions] = useState([])
  const [salaryItems, setSalaryItems] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 假数据保留作为注释参考
  // const [organizations] = useState([
  //   { id: 5, name: '前端组', path: '总公司 / 技术部 / 前端组' },
  //   { id: 6, name: '后端组', path: '总公司 / 技术部 / 后端组' },
  // ])

  // const [positions] = useState([
  //   { id: 1, name: '前端工程师', organizationId: 5 },
  //   { id: 2, name: '后端工程师', organizationId: 6 },
  // ])

  // const [salaryItems] = useState([
  //   { id: 1, name: '基本工资', type: 'fixed' },
  //   { id: 2, name: '绩效奖金', type: 'floating' },
  //   { id: 3, name: '交通补贴', type: 'fixed' },
  //   { id: 4, name: '餐饮补贴', type: 'fixed' },
  // ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStandard, setEditingStandard] = useState(null) // 被驳回后重新登记
  const [formData, setFormData] = useState({
    organizationId: null,
    positionId: null,
    items: {}
  })
  const [availablePositions, setAvailablePositions] = useState([])
  const [selectedOrg, setSelectedOrg] = useState({ l1: '', l2: '', l3: '' })
  const [submitting, setSubmitting] = useState(false)
  const asStr = useCallback((v) => (v === undefined || v === null ? '' : String(v)), [])

  const OrgDropdown = ({ placeholder, value, onChange, options, disabled }) => {
    const [open, setOpen] = useState(false)
    const selected = options.find(o => o.value === value)
    const display = selected ? selected.label : placeholder

    const toggle = () => {
      if (!disabled) setOpen(prev => !prev)
    }

    const handleSelect = (val) => {
      onChange(val)
      setOpen(false)
    }

    return (
      <div className={`relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        <button
          type="button"
          onClick={toggle}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-linear-to-br from-white via-white to-gray-50 shadow-[0_1px_0_rgba(15,23,42,0.02)] flex items-center justify-between text-left text-sm focus:outline-none కానీ focus:ring-2 focus:ring-[#59168b] focus:border-transparent"
        >
          <span className={selected ? 'text-gray-900' : 'text-gray-400'}>{display}</span>
          <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#59168b]/10 text-xs text-[#59168b]">
            ▾
          </span>
        </button>
        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl shadow-slate-900/5 max-h-56 overflow-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-gray-500">暂无可选项</div>
            ) : (
              options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    value === opt.value
                      ? 'bg-[#59168b]/10 text-[#59168b] font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // 并行加载所有数据
        const [standardsRes, orgsRes, positionsRes, itemsRes] = await Promise.all([
          getSalaryStandards(),
          getOrganizations({ limit: 500 }),
          getPositions(),
          getSalaryItems()
        ])
        
        // 处理薪酬标准数据
        const standardsData = standardsRes.data || []
        const formattedStandards = standardsData.map(standard => {
          const org = standard.pos_id?.org_id
          const itemsObj = standard.items || {}
          const total = Object.values(itemsObj).reduce((sum, v) => sum + v, 0)
          const status =
            standard.status ||
            (standard.reviewed ? '已复核' : standard.reviewed === false && standard.reviewed_by ? '已驳回' : '待复核')
          return {
            id: standard._id || standard.id,
            organizationId: org?._id || org,
            organizationName: org?.org_name || '',
            organizationPath: org?.org_name || '',
            positionId: standard.pos_id?._id,
            positionName: standard.pos_id?.pos_name || '',
            items: itemsObj,
            total,
            status,
            createTime: standard.created_at ? new Date(standard.created_at).toLocaleString('zh-CN', { hour12: false }) : ''
          }
        })
        setStandards(formattedStandards)
        
        // 处理机构数据
        const orgsData = orgsRes.data || []
        setOrganizations(orgsData)
        const l1 = orgsData.filter(o => o.org_level === 1)
        const l2 = orgsData.filter(o => o.org_level === 2)
        const l3 = orgsData.filter(o => o.org_level === 3)
        setLevel1(l1)
        setLevel2(l2)
        setLevel3(l3)
        
        // 处理职位数据
        const positionsData = positionsRes.data || []
        const formattedPositions = positionsData.map(pos => ({
          id: pos._id,
          name: pos.pos_name,
          organizationId: pos.org_id?._id || pos.org_id
        }))
        setPositions(formattedPositions)
        
        // 处理薪酬项目数据
        const itemsData = itemsRes.data || []
        const formattedItems = itemsData.map(item => ({
          id: item._id,
          name: item.item_name,
          type: item.is_active ? 'fixed' : 'floating'
        }))
        setSalaryItems(formattedItems)
        
      } catch (error) {
        console.error('加载数据失败:', error)
        toast.error(error.message || '加载薪酬标准相关数据失败')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // 标准设置中不需要配置“项目奖金”和“扣款”，只保留基础工资、补贴等项目
  const standardItems = useMemo(
    () => salaryItems.filter(item => !['项目奖金', '扣款'].includes(item.name)),
    [salaryItems]
  )

  const handleAdd = () => {
    setEditingStandard(null)
    const initialItems = {}
    standardItems.forEach(item => {
      initialItems[item.id] = 0
    })
    setFormData({ organizationId: null, positionId: null, items: initialItems })
    setAvailablePositions([])
    setSelectedOrg({ l1: '', l2: '', l3: '' })
    setIsModalOpen(true)
  }

  const handleOrgLevelChange = (level, value) => {
    if (level === 'l1') {
      setSelectedOrg({ l1: value, l2: '', l3: '' })
      setFormData(prev => ({ ...prev, organizationId: null, positionId: null }))
      setAvailablePositions([])
    } else if (level === 'l2') {
      setSelectedOrg(prev => ({ ...prev, l2: value, l3: '' }))
      setFormData(prev => ({ ...prev, organizationId: null, positionId: null }))
      setAvailablePositions([])
    } else {
      setSelectedOrg(prev => ({ ...prev, l3: value }))
      const orgId = value || null
      setFormData(prev => ({ ...prev, organizationId: orgId, positionId: null }))
      if (orgId) {
        const filtered = positions.filter(p => asStr(p.organizationId) === asStr(orgId))
        setAvailablePositions(filtered)
      } else {
        setAvailablePositions([])
      }
    }
  }

  const handleItemChange = (itemId, value) => {
    setFormData({
      ...formData,
      items: { ...formData.items, [itemId]: Number(value) }
    })
  }

  const handleSave = async () => {
    if (!formData.organizationId || !formData.positionId) {
      toast.warning('请选择机构和职位')
      return
    }

    try {
      setSubmitting(true)
      
      const org = organizations.find(o => o.id === formData.organizationId)
      const pos = positions.find(p => p.id === formData.positionId)
      
      // 准备提交给后端的数据
      const createData = {
        pos_id: formData.positionId,
        items: formData.items
      }
      
      const response = await createSalaryStandard(createData)
      const newStandardData = response.data

      const newStandard = {
        id: newStandardData._id,
        organizationId: org?.id,
        organizationName: org?.name || '',
        organizationPath: org?.path || '',
        positionId: pos?.id,
        positionName: pos?.name || '',
        items: newStandardData.items || formData.items,
        total: Object.values(newStandardData.items || formData.items).reduce((sum, val) => sum + val, 0),
        status: newStandardData.reviewed ? '已复核' : '待复核',
        createTime: newStandardData.created_at ? new Date(newStandardData.created_at).toLocaleString('zh-CN', { hour12: false }) : ''
      }

      setStandards(prev => {
        // 如果是从“已驳回”重新登记，则用新标准覆盖同职位旧记录
        if (editingStandard) {
          return prev.map(s =>
            s.id === editingStandard.id ? newStandard : s
          )
        }
        return [newStandard, ...prev]
      })
      setIsModalOpen(false)
      setEditingStandard(null)
      toast.success('薪酬标准已提交，等待复核')
    } catch (error) {
      console.error('创建薪酬标准失败:', error)
      toast.error(error.message || '薪酬标准创建失败')
    }
  }

  const getTotalAmount = () => {
    return Object.values(formData.items).reduce((sum, val) => sum + val, 0)
  }

  const renderStatusBadge = (status) => {
    const isReviewed = status === '已复核'
    const isRejected = status === '已驳回'
    const isWithdrawn = status === '已撤回'
    const base = 'inline-flex items-center justify-center min-w-[88px] px-4 py-1.5 rounded-full text-xs font-semibold border'
    return (
      <span
        className={`${base} ${
          isReviewed
            ? 'bg-green-50 text-green-700 border-green-100'
            : isRejected
            ? 'bg-red-50 text-red-700 border-red-100'
            : isWithdrawn
            ? 'bg-gray-50 text-gray-600 border-gray-200'
            : 'bg-orange-50 text-orange-700 border-orange-100'
        }`}
      >
        {status || '待复核'}
      </span>
    )
  }

  const handleWithdraw = async (standard) => {
    const ok = await confirm({ title: '确认撤回该薪酬标准？', description: '撤回后可重新登记，需重新复核。', okText: '撤回', cancelText: '取消' })
    if (!ok) return

    try {
      const res = await withdrawSalaryStandard(standard.id)
      if (res.success) {
        toast.success('已撤回')
        setStandards(prev =>
          prev.map(s => s.id === standard.id ? { ...s, status: '已撤回', reviewed: false } : s)
        )
      } else {
        toast.error(res.message || '撤回失败')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message || '撤回失败')
    }
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">薪酬标准登记</h2>
              <p className="text-gray-500">为指定职位+机构组合设置薪酬标准</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 shadow-sm cursor-pointer"
            >
              + 登记薪酬标准
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">标准总数</p>
                <p className="text-3xl font-semibold text-gray-900">{standards.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                💵
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">待复核</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {standards.filter(s => s.status === '待复核' || !s.status).length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">
                ⏳
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">本月新增</p>
                <p className="text-3xl font-semibold text-gray-900">{standards.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                📈
              </div>
            </div>
          </div>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">所属机构</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">薪酬总额</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">登记时间</th>
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
                ) : standards.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500">暂无薪酬标准数据</p>
                    </td>
                  </tr>
                ) : (
                  standards.map((standard) => (
                    <tr key={standard.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 font-medium text-gray-900">{standard.positionName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{standard.organizationPath}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">¥{standard.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {renderStatusBadge(standard.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{standard.createTime}</td>
                    <td className="px-6 py-4 text-center space-x-2">
                      {(standard.status === '已驳回' || standard.status === '已撤回') ? (
                        <button
                          onClick={() => {
                            // 以被驳回/撤回标准为基础重新打开表单
                            setEditingStandard(standard)
                            setFormData({
                              organizationId: standard.organizationId,
                              positionId: standard.positionId,
                              items: { ...standard.items }
                            })
                            setSelectedOrg(prev => ({ ...prev, l3: standard.organizationId }))
                            setIsModalOpen(true)
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-[#59168b] hover:bg-[#6d1fa7] rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          重新登记
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                      <button
                        onClick={() => handleWithdraw(standard)}
                        className="px-3 py-1.5 text-xs font-medium text-[#59168b] bg-white border border-[#59168b]/50 hover:bg-[#59168b]/10 rounded-lg cursor-pointer"
                      >
                        撤回
                      </button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">登记薪酬标准</h3>
              <p className="text-sm text-gray-500 mt-1">为职位设置薪酬标准</p>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">所属机构 *</label>
                  <div className="flex flex-col gap-3">
                    <OrgDropdown
                      placeholder="一级机构"
                      value={selectedOrg.l1}
                      onChange={(val) => handleOrgLevelChange('l1', val)}
                      options={level1.map(org => ({ value: String(org._id), label: org.org_name }))}
                      disabled={false}
                    />
                    <OrgDropdown
                      placeholder="二级机构"
                      value={selectedOrg.l2}
                      onChange={(val) => handleOrgLevelChange('l2', val)}
                      options={level2
                        .filter(o => {
                          const p = o.parent_org_id
                          const pid = typeof p === 'object' ? p?._id : p
                          return String(pid) === String(selectedOrg.l1)
                        })
                        .map(org => ({ value: String(org._id), label: org.org_name }))}
                      disabled={!selectedOrg.l1}
                    />
                    <OrgDropdown
                      placeholder="三级机构"
                      value={selectedOrg.l3}
                      onChange={(val) => handleOrgLevelChange('l3', val)}
                      options={level3
                        .filter(o => {
                          const p = o.parent_org_id
                          const pid = typeof p === 'object' ? p?._id : p
                          return String(pid) === String(selectedOrg.l2)
                        })
                        .map(org => ({ value: String(org._id), label: org.org_name }))}
                      disabled={!selectedOrg.l2}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">职位 *</label>
                  <OrgDropdown
                    placeholder={selectedOrg.l3 ? '请选择职位' : '请先选择三级机构'}
                    value={formData.positionId || ''}
                    onChange={(val) => setFormData({ ...formData, positionId: val })}
                    options={availablePositions.map(pos => ({ value: pos.id, label: pos.name }))}
                    disabled={!selectedOrg.l3}
                  />
                </div>
              </div>

              {/* 薪酬项目（不包含项目奖金/扣款，这两项在发放登记阶段设置） */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  薪酬项目设置
                </h4>
                <div className="space-y-3">
                  {standardItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{item.type === 'fixed' ? '📌' : '📊'}</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.type === 'fixed' ? '固定项' : '浮动项'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">¥</span>
                        <input
                          type="number"
                          value={formData.items[item.id] || 0}
                          onChange={(e) => handleItemChange(item.id, e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                          min="0"
                          step="100"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 总额显示 */}
                <div className="mt-4 bg-[#59168b]/5 border-2 border-[#59168b] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">薪酬总额</span>
                    <span className="text-2xl font-bold text-[#59168b]">¥{getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200 sticky bottom-0">
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
                {submitting ? '提交中...' : '提交登记'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryStandardRegister


