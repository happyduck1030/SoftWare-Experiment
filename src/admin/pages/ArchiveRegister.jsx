import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { message } from 'antd'
import { getArchives, createArchive, getOrganizations, getPositions } from '../../services/adminService'

const ArchiveRegister = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [archives, setArchives] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 假数据保留作为注释参考
  // const [archives, setArchives] = useState([
  //   {
  //     id: 1,
  //     name: '张三',
  //     gender: '男',
  //     idCard: '110101199001011234',
  //     phone: '13800138000',
  //     entryDate: '2024-01-15',
  //     organizationId: 5,
  //     organizationName: '前端组',
  //     organizationPath: '总公司 / 技术部 / 前端组',
  //     positionId: 1,
  //     positionName: '前端工程师',
  //     status: 'pending',
  //     createTime: '2024-01-15 10:30:00'
  //   }
  // ])

  // // 模拟数据
  // const [organizations] = useState([
  //   { id: 5, name: '前端组', path: '总公司 / 技术部 / 前端组' },
  //   { id: 6, name: '后端组', path: '总公司 / 技术部 / 后端组' },
  //   { id: 7, name: '招聘组', path: '总公司 / 人事部 / 招聘组' },
  //   { id: 8, name: '培训组', path: '总公司 / 人事部 / 培训组' },
  //   { id: 9, name: '会计组', path: '总公司 / 财务部 / 会计组' },
  // ])

  // const [positions] = useState([
  //   { id: 1, name: '前端工程师', organizationId: 5 },
  //   { id: 2, name: '后端工程师', organizationId: 6 },
  //   { id: 3, name: '招聘专员', organizationId: 7 },
  //   { id: 4, name: '培训师', organizationId: 8 },
  //   { id: 5, name: '会计', organizationId: 9 },
  // ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    gender: '男',
    idCard: '',
    phone: '',
    email: '',
    entryDate: '',
    orgLevel1Id: '',
    orgLevel2Id: '',
    orgLevel3Id: '',
    positionId: null,
    education: '本科',
    address: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

  const [availablePositions, setAvailablePositions] = useState([])
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
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-linear-to-br from-white via-white to-gray-50 shadow-[0_1px_0_rgba(15,23,42,0.02)] flex items-center justify-between text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent"
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
        const [archivesRes, orgsRes, positionsRes] = await Promise.all([
          getArchives({ reviewed: false }), // 只获取未复核的档案
          getOrganizations(),
          getPositions()
        ])
        
        // 处理档案数据
        const archivesData = archivesRes.data || []
        const formattedArchives = archivesData.map(archive => {
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
            email: archive.email,
            entryDate: archive.hire_date ? new Date(archive.hire_date).toISOString().split('T')[0] : '',
            organizationId: archive.pos_id?.org_id?._id || archive.pos_id?.org_id,
            organizationName: archive.pos_id?.org_id?.org_name || '',
            organizationPath: archive.organizationPath || '',
            positionId: archive.pos_id?._id,
            positionName: archive.pos_id?.pos_name || '',
            status,
            createTime: archive.created_at ? new Date(archive.created_at).toLocaleString('zh-CN', { hour12: false }) : ''
          }
        })
        setArchives(formattedArchives)
        
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

  const handleAdd = () => {
    setFormData({
      name: '',
      gender: '男',
      idCard: '',
      phone: '',
      email: '',
      entryDate: '',
      orgLevel1Id: '',
      orgLevel2Id: '',
      orgLevel3Id: '',
      positionId: null,
      education: '本科',
      address: '',
      emergencyContact: '',
      emergencyPhone: ''
    })
    setAvailablePositions([])
    setIsModalOpen(true)
  }

  const level1Orgs = useMemo(
    () => organizations.filter(o => o.level === 1),
    [organizations]
  )
  const level2Orgs = useMemo(
    () => organizations.filter(o => o.level === 2),
    [organizations]
  )
  const level3Orgs = useMemo(
    () => organizations.filter(o => o.level === 3),
    [organizations]
  )

  const level2Options = useMemo(() => {
    if (!formData.orgLevel1Id) return []
    return level2Orgs.filter(o => asStr(o.parentId) === asStr(formData.orgLevel1Id))
  }, [level2Orgs, formData.orgLevel1Id, asStr])

  const level3Options = useMemo(() => {
    if (!formData.orgLevel2Id) return []
    return level3Orgs.filter(o => asStr(o.parentId) === asStr(formData.orgLevel2Id))
  }, [level3Orgs, formData.orgLevel2Id, asStr])

  const handleOrgLevelChange = (level, value) => {
    if (level === 1) {
      setFormData(prev => ({
        ...prev,
        orgLevel1Id: value,
        orgLevel2Id: '',
        orgLevel3Id: '',
        positionId: null
      }))
      setAvailablePositions([])
    } else if (level === 2) {
      setFormData(prev => ({
        ...prev,
        orgLevel2Id: value,
        orgLevel3Id: '',
        positionId: null
      }))
      setAvailablePositions([])
    } else {
      setFormData(prev => ({
        ...prev,
        orgLevel3Id: value,
        positionId: null
      }))
      const filtered = positions.filter(p => asStr(p.organizationId) === asStr(value))
      setAvailablePositions(filtered)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      messageApi.warning('请输入姓名')
      return
    }
    if (!formData.idCard.trim()) {
      messageApi.warning('请输入身份证号')
      return
    }
    if (!formData.phone.trim()) {
      messageApi.warning('请输入联系电话')
      return
    }
    if (!formData.entryDate) {
      messageApi.warning('请选择入职日期')
      return
    }
    if (!formData.orgLevel3Id) {
      messageApi.warning('请选择所属机构（三级机构）')
      return
    }
    if (!formData.positionId) {
      messageApi.warning('请选择职位')
      return
    }

    try {
      setSubmitting(true)
      
      // 准备提交给后端的数据
      const createData = {
        name: formData.name,
        gender: formData.gender,
        id_card: formData.idCard,
        phone: formData.phone,
        email: formData.email,
        hire_date: formData.entryDate,
        pos_id: formData.positionId,
        education: formData.education,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone
      }
      
      // 调用API创建档案
      const response = await createArchive(createData)
      
      // 处理返回的档案数据
      const newArchive = response.data
      const formattedArchive = {
        id: newArchive._id,
        name: newArchive.name,
        gender: newArchive.gender,
        idCard: newArchive.id_card,
        phone: newArchive.phone,
        email: newArchive.email,
        entryDate: newArchive.hire_date ? new Date(newArchive.hire_date).toISOString().split('T')[0] : '',
        organizationId: newArchive.pos_id?.org_id?._id || newArchive.pos_id?.org_id,
        organizationName: newArchive.pos_id?.org_id?.org_name || '',
        organizationPath: newArchive.organizationPath || '',
        positionId: newArchive.pos_id?._id,
        positionName: newArchive.pos_id?.pos_name || '',
        status: newArchive.reviewed ? '已复核' : '待复核',
        createTime: newArchive.created_at ? new Date(newArchive.created_at).toLocaleString('zh-CN', { hour12: false }) : ''
      }
      
      setArchives([formattedArchive, ...archives])
      setIsModalOpen(false)
      messageApi.success('档案登记成功，等待复核')
    } catch (error) {
      console.error('创建档案失败:', error)
      messageApi.error(error.message || '档案登记失败')
    } finally {
      setSubmitting(false)
    }
  }

  const pendingCount = archives.filter(a => a.status === '待复核').length

  return (
    <div className="h-full bg-[#fafafa] p-8">
      {contextHolder}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">档案登记</h2>
              <p className="text-gray-500">录入新员工基本信息，提交后等待复核</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 shadow-sm cursor-pointer"
            >
              + 登记新员工
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">档案总数</p>
                <p className="text-3xl font-semibold text-gray-900">{archives.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                📝
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">待复核</p>
                <p className="text-3xl font-semibold text-gray-900">{pendingCount}</p>
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
                <p className="text-3xl font-semibold text-gray-900">1</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                📈
              </div>
            </div>
          </div>
        </div>

        {/* 档案列表 */}
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">登记时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-gray-500">加载中...</p>
                    </td>
                  </tr>
                ) : archives.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500">暂无档案数据</p>
                    </td>
                  </tr>
                ) : (
                  archives.map((archive) => (
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
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            archive.status === '已复核'
                              ? 'bg-green-100 text-green-700'
                              : archive.status === '已驳回'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {archive.status === '已复核'
                            ? '✓ 已复核'
                            : archive.status === '已驳回'
                            ? '✗ 已驳回'
                            : '⏳ 待复核'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{archive.createTime}</td>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">登记新员工</h3>
              <p className="text-sm text-gray-500 mt-1">请填写员工的基本信息</p>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  基本信息
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">姓名 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">性别 *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">身份证号 *</label>
                    <input
                      type="text"
                      value={formData.idCard}
                      onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入身份证号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">联系电话 *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入联系电话"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">电子邮箱</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入电子邮箱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">学历</label>
                    <select
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                    >
                      <option value="高中">高中</option>
                      <option value="大专">大专</option>
                      <option value="本科">本科</option>
                      <option value="硕士">硕士</option>
                      <option value="博士">博士</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 职位信息 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  职位信息
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">入职日期 *</label>
                    <input
                      type="date"
                      value={formData.entryDate}
                      onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">所属机构 *</label>
                    <div className="flex flex-col gap-3">
                      <OrgDropdown
                        placeholder="一级机构"
                        value={formData.orgLevel1Id}
                        onChange={(val) => handleOrgLevelChange(1, val)}
                        options={level1Orgs.map(org => ({ value: org.id, label: org.name }))}
                        disabled={false}
                      />
                      <OrgDropdown
                        placeholder="二级机构"
                        value={formData.orgLevel2Id}
                        onChange={(val) => handleOrgLevelChange(2, val)}
                        options={level2Options.map(org => ({ value: org.id, label: org.name }))}
                        disabled={!formData.orgLevel1Id}
                      />
                      <OrgDropdown
                        placeholder="三级机构"
                        value={formData.orgLevel3Id}
                        onChange={(val) => handleOrgLevelChange(3, val)}
                        options={level3Options.map(org => ({ value: org.id, label: org.name }))}
                        disabled={!formData.orgLevel2Id}
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">职位 *</label>
                    <OrgDropdown
                      placeholder={formData.orgLevel3Id ? '请选择职位' : '请先选择三级机构'}
                      value={formData.positionId || ''}
                      onChange={(val) => setFormData({ ...formData, positionId: val })}
                      options={availablePositions.map(pos => ({ value: pos.id, label: pos.name }))}
                      disabled={!formData.orgLevel3Id}
                    />
                  </div>
                </div>
              </div>

              {/* 其他信息 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  其他信息
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">家庭地址</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                      placeholder="请输入家庭地址"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">紧急联系人</label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                        placeholder="请输入紧急联系人"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">紧急联系电话</label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                        placeholder="请输入紧急联系电话"
                      />
                    </div>
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

export default ArchiveRegister


