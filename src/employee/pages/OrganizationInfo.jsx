import React, { useState, useEffect } from 'react'
import { getOrganizationTree } from '../../services/adminService'

const OrganizationInfo = () => {
  const [organizationTree, setOrganizationTree] = useState([])
  const [loading, setLoading] = useState(true)

  // 加载组织架构数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await getOrganizationTree()
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
        
        const formattedTree = transformOrgData(treeData)
        setOrganizationTree(formattedTree)
      } catch (error) {
        console.error('加载组织架构失败:', error)
        // 可以在这里添加错误提示
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // 递归渲染组织树
  const renderOrgTree = (orgs, depth = 0) => {
    return orgs.map(org => (
      <div key={org.id} style={{ marginLeft: `${depth * 24}px` }} className="mb-3">
        <div className="group bg-white rounded-xl border border-gray-200 hover:border-[#59168b] hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3 flex-1">
              {org.children.length > 0 && (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  org.level === 1 ? 'bg-[#59168b] text-white' :
                  org.level === 2 ? 'bg-blue-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  {org.children.length}
                </div>
              )}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                org.level === 1 ? 'bg-[#59168b]/10' :
                org.level === 2 ? 'bg-blue-50' :
                'bg-green-50'
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
          </div>
        </div>

        {org.children.length > 0 && (
          <div className="mt-3">
            {renderOrgTree(org.children, depth + 1)}
          </div>
        )}
      </div>
    ))
  }

  if (loading) {
    return (
      <div className="h-full bg-[#fafafa] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🌳</div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">组织架构</h2>
              <p className="text-gray-500">查看公司的组织结构图</p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">一级机构</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {organizationTree.length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                🏢
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">二级机构</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {organizationTree.reduce((sum, org) => sum + (org.children?.length || 0), 0)}
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
                <p className="text-sm text-gray-500 mb-2">三级机构</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {organizationTree.reduce((sum, org) =>
                    sum + (org.children?.reduce((s, child) => s + (child.children?.length || 0), 0), 0)
                  )}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                📁
              </div>
            </div>
          </div>
        </div>

        {/* 组织架构树 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌳</span>
              <h3 className="text-lg font-semibold text-gray-900">组织架构树</h3>
            </div>
          </div>

          {organizationTree.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500">暂无组织架构数据</p>
            </div>
          ) : (
            <div>
              {renderOrgTree(organizationTree)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrganizationInfo
