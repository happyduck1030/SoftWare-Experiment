import React, { useState, useEffect } from 'react'
import { getOrganizationTree, createOrganization, updateOrganization, deleteOrganization } from '../../services/adminService'

const OrganizationSettings = () => {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 假数据保留作为注释参考
  // const [organizations, setOrganizations] = useState([
  //   {
  //     id: 1,
  //     name: '总公司',
  //     level: 1,
  //     parentId: null,
  //     children: [
  //       {
  //         id: 2,
  //         name: '技术部',
  //         level: 2,
  //         parentId: 1,
  //         children: [
  //           { id: 5, name: '前端组', level: 3, parentId: 2, children: [] },
  //           { id: 6, name: '后端组', level: 3, parentId: 2, children: [] },
  //         ]
  //       },
  //       {
  //         id: 3,
  //         name: '人事部',
  //         level: 2,
  //         parentId: 1,
  //         children: [
  //           { id: 7, name: '招聘组', level: 3, parentId: 3, children: [] },
  //           { id: 8, name: '培训组', level: 3, parentId: 3, children: [] },
  //         ]
  //       },
  //       {
  //         id: 4,
  //         name: '财务部',
  //         level: 2,
  //         parentId: 1,
  //         children: [
  //           { id: 9, name: '会计组', level: 3, parentId: 4, children: [] },
  //         ]
  //       },
  //     ]
  //   }
  // ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    level: 1,
    parentId: null
  })
  const [submitting, setSubmitting] = useState(false)

  const [expandedNodes, setExpandedNodes] = useState(new Set())

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await getOrganizationTree()
        console.log('获取组织架构数据成功:', response.data)
        const treeData = response.data || []
        
        // 递归转换数据格式
        const transformOrgData = (orgs) => {
          return orgs.map(org => ({
            id: org._id,
            name: org.org_name,
            level: org.org_level,
            parentId: org.parent_org_id?._id || org.parent_org_id,
            children: org.children ? transformOrgData(org.children) : []
          }))
        }
   
        const formattedOrgs = transformOrgData(treeData)
        console.log('转换后的数据:', transformOrgData)
        setOrganizations(formattedOrgs)
        
        // 默认展开第一级
        if (formattedOrgs.length > 0) {
          setExpandedNodes(new Set([formattedOrgs[0].id]))
        }
      } catch (error) {
        console.error('加载机构数据失败:', error)
        // 可以在这里添加错误提示
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleAdd = (parentOrg = null) => {
    setModalMode('add')
    setSelectedOrg(parentOrg)
    setFormData({
      name: '',
      level: parentOrg ? parentOrg.level + 1 : 1,
      parentId: parentOrg ? parentOrg.id : null
    })
    setIsModalOpen(true)
  }

  const handleEdit = (org) => {
    setModalMode('edit')
    setSelectedOrg(org)
    setFormData({
      name: org.name,
      level: org.level,
      parentId: org.parentId
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (orgId) => {
    if (window.confirm('确定要删除这个机构吗？删除后其下级机构也将被删除。')) {
      try {
        setSubmitting(true)
        await deleteOrganization(orgId)
        
        // 从本地状态中删除
        const deleteRecursive = (orgs, id) => {
          return orgs.filter(org => org.id !== id).map(org => ({
            ...org,
            children: deleteRecursive(org.children, id)
          }))
        }
        setOrganizations(deleteRecursive(organizations, orgId))
        alert('机构删除成功')
      } catch (error) {
        console.error('删除机构失败:', error)
        alert(error.message || '机构删除失败')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('请输入机构名称')
      return
    }

    try {
      setSubmitting(true)
      
      if (modalMode === 'add') {
        // 准备提交给后端的数据
        const createData = {
          org_name: formData.name,
          org_level: formData.level,
          parent_org_id: formData.parentId || null
        }
        
        // 调用API创建机构
        const response = await createOrganization(createData)
        const newOrgData = response.data
        
        // 转换为前端格式
        const newOrg = {
          id: newOrgData._id,
          name: newOrgData.org_name,
          level: newOrgData.org_level,
          parentId: newOrgData.parent_org_id?._id || newOrgData.parent_org_id,
          children: []
        }

        if (formData.parentId === null) {
          setOrganizations([...organizations, newOrg])
        } else {
          const addToParent = (orgs) => {
            return orgs.map(org => {
              if (org.id === formData.parentId) {
                return { ...org, children: [...org.children, newOrg] }
              }
              return { ...org, children: addToParent(org.children) }
            })
          }
          setOrganizations(addToParent(organizations))
        }
      } else {
        // 准备提交给后端的数据
        const updateData = {
          org_name: formData.name,
          manager_emp_id: formData.managerId || null
        }
        
        // 调用API更新机构
        await updateOrganization(selectedOrg.id, updateData)
        
        // 更新本地状态
        const updateOrg = (orgs) => {
          return orgs.map(org => {
            if (org.id === selectedOrg.id) {
              return { ...org, name: formData.name }
            }
            return { ...org, children: updateOrg(org.children) }
          })
        }
        setOrganizations(updateOrg(organizations))
      }

      setIsModalOpen(false)
      setFormData({ name: '', level: 1, parentId: null })
      alert(modalMode === 'add' ? '机构创建成功' : '机构更新成功')
    } catch (error) {
      console.error('保存机构失败:', error)
      alert(error.message || '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleExpand = (orgId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId)
    } else {
      newExpanded.add(orgId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderOrgTree = (orgs, depth = 0) => {
    return orgs.map(org => (
      <div key={org.id} style={{ marginLeft: `${depth * 32}px` }} className="mb-3">
        <div className="group bg-white rounded-xl border border-gray-200 hover:border-[#59168b] hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3 flex-1">
              {org.children.length > 0 && (
                <button
                  onClick={() => toggleExpand(org.id)}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-[#59168b] transition-colors duration-150"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${expandedNodes.has(org.id) ? 'rotate-90' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                org.level === 1 ? 'bg-[#59168b]/10' : org.level === 2 ? 'bg-blue-50' : 'bg-green-50'
              }`}>
                {org.level === 1 ? '🏢' : org.level === 2 ? '🏛️' : '📁'}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{org.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {org.level === 1 ? '一级机构' : org.level === 2 ? '二级机构' : '三级机构'}
                </p>
              </div>
            </div>

            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {org.level < 3 && (
                <button
                  onClick={() => handleAdd(org)}
                  className="px-3 py-1.5 text-xs font-medium text-[#59168b] bg-[#59168b]/5 hover:bg-[#59168b]/10 rounded-lg transition-colors duration-150"
                >
                  添加下级
                </button>
              )}
              <button
                onClick={() => handleEdit(org)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
              >
                编辑
              </button>
              <button
                onClick={() => handleDelete(org.id)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150"
              >
                删除
              </button>
            </div>
          </div>
        </div>

        {expandedNodes.has(org.id) && org.children.length > 0 && (
          <div className="mt-3">
            {renderOrgTree(org.children, depth + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">机构关系设置</h2>
              <p className="text-gray-500">管理公司的组织架构，支持三级机构设置</p>
            </div>
            <button
              onClick={() => handleAdd()}
              className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 shadow-sm"
            >
              + 添加一级机构
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">一级机构</p>
                <p className="text-3xl font-semibold text-gray-900">{organizations.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                🏢
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">二级机构</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {organizations.reduce((sum, org) => sum + org.children.length, 0)}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                🏛️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">三级机构</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {organizations.reduce((sum, org) => 
                    sum + org.children.reduce((s, c) => s + c.children.length, 0), 0
                  )}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                📁
              </div>
            </div>
          </div>
        </div>

        {/* 机构树 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌳</span>
              <h3 className="text-lg font-semibold text-gray-900">组织架构树</h3>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500">暂无机构数据，点击上方按钮添加一级机构</p>
            </div>
          ) : (
            <div>
              {renderOrgTree(organizations)}
            </div>
          )}
        </div>
      </div>

      {/* 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {modalMode === 'add' ? '添加机构' : '编辑机构'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {modalMode === 'add' 
                  ? selectedOrg 
                    ? `添加到「${selectedOrg.name}」下级` 
                    : '添加一级机构'
                  : '修改机构信息'
                }
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  机构名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                  placeholder="请输入机构名称"
                  autoFocus
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#59168b]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-[#59168b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">机构层级：{formData.level === 1 ? '一级' : formData.level === 2 ? '二级' : '三级'}机构</p>
                    {selectedOrg && (
                      <p className="text-gray-500 mt-1">上级机构：{selectedOrg.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-150"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors duration-150"
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

export default OrganizationSettings
