import React, { useState } from 'react'

const ArchiveReview = () => {
  const [archives, setArchives] = useState([
    { 
      id: 1, 
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
      emergencyPhone: '13900139000',
      status: 'pending',
      createTime: '2024-01-15 10:30:00'
    },
    { 
      id: 2, 
      name: '王五', 
      gender: '女', 
      idCard: '110101199102021235', 
      phone: '13800138001',
      email: 'wangwu@example.com',
      entryDate: '2024-01-16', 
      organizationPath: '总公司 / 人事部 / 招聘组',
      positionName: '招聘专员',
      education: '硕士',
      address: '北京市海淀区xxx街道xxx号',
      emergencyContact: '赵六',
      emergencyPhone: '13900139001',
      status: 'pending',
      createTime: '2024-01-16 14:20:00'
    }
  ])

  const [selectedArchive, setSelectedArchive] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [reviewNote, setReviewNote] = useState('')

  const handleViewDetail = (archive) => {
    setSelectedArchive(archive)
    setReviewNote('')
    setIsDetailOpen(true)
  }

  const handleApprove = () => {
    if (window.confirm('确定通过此档案的复核吗？')) {
      setArchives(archives.filter(a => a.id !== selectedArchive.id))
      setIsDetailOpen(false)
      alert('复核通过')
    }
  }

  const handleReject = () => {
    if (!reviewNote.trim()) {
      alert('请填写驳回原因')
      return
    }
    if (window.confirm('确定驳回此档案吗？')) {
      setArchives(archives.filter(a => a.id !== selectedArchive.id))
      setIsDetailOpen(false)
      alert('已驳回')
    }
  }

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">档案登记复核</h2>
            <p className="text-gray-500">对待复核的档案进行审核，可执行通过或驳回操作</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">待复核</p>
                <p className="text-3xl font-semibold text-gray-900">{archives.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">
                ⏳
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">今日已审</p>
                <p className="text-3xl font-semibold text-gray-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                ✓
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-red-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">今日驳回</p>
                <p className="text-3xl font-semibold text-gray-900">0</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-3xl">
                ✗
              </div>
            </div>
          </div>
        </div>

        {/* 待复核列表 */}
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">登记时间</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archives.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">✓</div>
                      <p className="text-gray-500">暂无待复核档案</p>
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
                      <td className="px-6 py-4 text-sm text-gray-500">{archive.createTime}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewDetail(archive)}
                            className="px-4 py-2 text-sm font-medium text-white bg-[#59168b] hover:bg-[#6d1fa7] rounded-lg transition-colors duration-150 cursor-pointer"
                          >
                            复核
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-gray-900">档案详细信息</h3>
              <p className="text-sm text-gray-500 mt-1">请仔细核对以下信息后进行审核</p>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  基本信息
                </h4>
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
                    <p className="text-xs text-gray-500 mb-1">电子邮箱</p>
                    <p className="text-sm font-medium text-gray-900">{selectedArchive.email || '-'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">学历</p>
                    <p className="text-sm font-medium text-gray-900">{selectedArchive.education}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">入职日期</p>
                    <p className="text-sm font-medium text-gray-900">{selectedArchive.entryDate}</p>
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

              {/* 其他信息 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-[#59168b] rounded mr-2"></span>
                  其他信息
                </h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">家庭地址</p>
                    <p className="text-sm font-medium text-gray-900">{selectedArchive.address || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">紧急联系人</p>
                      <p className="text-sm font-medium text-gray-900">{selectedArchive.emergencyContact || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">紧急联系电话</p>
                      <p className="text-sm font-medium text-gray-900">{selectedArchive.emergencyPhone || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 驳回原因 */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-4 bg-red-500 rounded mr-2"></span>
                  驳回原因（驳回时必填）
                </h4>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-150 resize-none"
                  placeholder="如需驳回，请填写驳回原因..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200 sticky bottom-0">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-3 bg-white border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors duration-150 cursor-pointer"
              >
                驳回
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 cursor-pointer"
              >
                通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArchiveReview


