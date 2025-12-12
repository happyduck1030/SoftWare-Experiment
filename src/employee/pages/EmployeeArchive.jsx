import React, { useState, useEffect } from 'react'
import { message, Spin } from 'antd'
import { getMyArchive } from '../../services/employeeService'

const EmployeeArchive = () => {
  const [archiveData, setArchiveData] = useState(null)
  const [loading, setLoading] = useState(true)

  // 获取个人档案数据
  useEffect(() => {
    fetchArchiveData()
  }, [])

  const fetchArchiveData = async () => {
    try {
      setLoading(true)
      const response = await getMyArchive()
      if (response.success) {
        setArchiveData(response.data)
      } else {
        message.error(response.message || '获取档案信息失败')
      }
    } catch (error) {
      console.error('Failed to fetch archive:', error)
      message.error(error.message || '获取档案信息失败')
    } finally {
      setLoading(false)
    }
  }

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="h-full bg-[#fafafa] p-8 flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!archiveData) {
    return (
      <div className="h-full bg-[#fafafa] p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <div className="text-gray-600">暂无档案信息</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 rounded-2xl bg-[#59168b] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {archiveData.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{archiveData.name}</h2>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="flex items-center space-x-2">
                  <span className="text-lg">💼</span>
                  <span>{archiveData.positionName}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <span className="text-lg">🏛️</span>
                  <span>{archiveData.organizationPath}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-1 h-5 bg-[#59168b] rounded mr-3"></span>
            基本信息
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">姓名</p>
              <p className="text-base font-medium text-gray-900">{archiveData.name}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">性别</p>
              <p className="text-base font-medium text-gray-900">{archiveData.gender}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 col-span-2">
              <p className="text-sm text-gray-500 mb-2">身份证号</p>
              <p className="text-base font-medium text-gray-900">{archiveData.idCard || '未填写'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">联系电话</p>
              <p className="text-base font-medium text-gray-900">{archiveData.phone || '未填写'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">电子邮箱</p>
              <p className="text-base font-medium text-gray-900">{archiveData.email || '未填写'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">学历</p>
              <p className="text-base font-medium text-gray-900">{archiveData.education || '未填写'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">入职日期</p>
              <p className="text-base font-medium text-gray-900">{formatDate(archiveData.hireDate)}</p>
            </div>
          </div>
        </div>

        {/* 职位信息 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-1 h-5 bg-[#59168b] rounded mr-3"></span>
            职位信息
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">职位</p>
              <p className="text-base font-medium text-gray-900">{archiveData.positionName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">入职日期</p>
              <p className="text-base font-medium text-gray-900">{formatDate(archiveData.hireDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 col-span-2">
              <p className="text-sm text-gray-500 mb-2">所属机构</p>
              <p className="text-base font-medium text-gray-900">{archiveData.organizationPath}</p>
            </div>
          </div>
        </div>

        {/* 直接上级信息 */}
        {archiveData.directBoss && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-1 h-5 bg-[#59168b] rounded mr-3"></span>
              直接上级
            </h3>
            <div className="bg-gradient-to-br from-[#59168b]/5 to-white border border-[#59168b]/30 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-[#59168b] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {archiveData.directBoss.name?.charAt(0) || 'B'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="text-lg font-semibold text-gray-900">{archiveData.directBoss.name}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#59168b] text-white">
                      直接上级
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{archiveData.directBoss.position}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-base">📞</span>
                    <span>{archiveData.directBoss.phone}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-800">
                💡 <strong>提示：</strong>如有工作问题或需要请假、调休等，请优先联系直接上级。更多上级信息请查看"组织架构"页面。
              </p>
            </div>
          </div>
        )}

        {/* 其他信息 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-1 h-5 bg-[#59168b] rounded mr-3"></span>
            其他信息
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">家庭地址</p>
              <p className="text-base font-medium text-gray-900">{archiveData.address || '未填写'}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">紧急联系人</p>
                <p className="text-base font-medium text-gray-900">{archiveData.emergencyContact || '未填写'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">紧急联系电话</p>
                <p className="text-base font-medium text-gray-900">{archiveData.emergencyPhone || '未填写'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-2xl">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">温馨提示</p>
              <p className="mt-1">如需修改个人档案信息，请联系人事部门进行变更申请</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeArchive
