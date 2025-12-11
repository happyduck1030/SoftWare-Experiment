import React from 'react'

const EmployeeArchive = () => {
  const archiveData = {
    name: '张三',
    gender: '男',
    idCard: '110101199001011234',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    entryDate: '2024-01-15',
    organizationPath: '总公司 / 技术部 / 前端组',
    positionName: '前端工程师',
    education: '本科',
    address: '北京市朝阳区xxx街道xxx号',
    emergencyContact: '李四',
    emergencyPhone: '13900139000'
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 rounded-2xl bg-[#59168b] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {archiveData.name.charAt(0)}
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
              <p className="text-base font-medium text-gray-900">{archiveData.idCard}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">联系电话</p>
              <p className="text-base font-medium text-gray-900">{archiveData.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">电子邮箱</p>
              <p className="text-base font-medium text-gray-900">{archiveData.email}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">学历</p>
              <p className="text-base font-medium text-gray-900">{archiveData.education}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">入职日期</p>
              <p className="text-base font-medium text-gray-900">{archiveData.entryDate}</p>
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
              <p className="text-base font-medium text-gray-900">{archiveData.entryDate}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 col-span-2">
              <p className="text-sm text-gray-500 mb-2">所属机构</p>
              <p className="text-base font-medium text-gray-900">{archiveData.organizationPath}</p>
            </div>
          </div>
        </div>

        {/* 其他信息 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-1 h-5 bg-[#59168b] rounded mr-3"></span>
            其他信息
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">家庭地址</p>
              <p className="text-base font-medium text-gray-900">{archiveData.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">紧急联系人</p>
                <p className="text-base font-medium text-gray-900">{archiveData.emergencyContact}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">紧急联系电话</p>
                <p className="text-base font-medium text-gray-900">{archiveData.emergencyPhone}</p>
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


