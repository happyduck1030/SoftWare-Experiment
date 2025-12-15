import React, { useState, useEffect } from 'react'
import { message, Spin, Modal } from 'antd'
import {
  getSubordinates,
  getSubordinateDetail,
  updateSubordinate,
  getSubordinateSalary
} from '../../services/employeeService'

const SubordinateManagement = () => {
  const [subordinates, setSubordinates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false)
  const [salaryData, setSalaryData] = useState([])
  const [editForm, setEditForm] = useState({})
  const [updating, setUpdating] = useState(false)

  // 获取下属列表
  useEffect(() => {
    fetchSubordinates()
  }, [])

  const fetchSubordinates = async () => {
    try {
      setLoading(true)
      const response = await getSubordinates()
      if (response.success) {
        setSubordinates(response.data || [])
      } else {
        message.error(response.message || '获取下属列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch subordinates:', error)
      message.error(error.message || '获取下属列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 查看详情
  const handleViewDetail = async (employee) => {
    try {
      const response = await getSubordinateDetail(employee.id)
      if (response.success) {
        setSelectedEmployee(response.data)
        setIsDetailModalOpen(true)
      } else {
        message.error(response.message || '获取员工详情失败')
      }
    } catch (error) {
      console.error('Failed to fetch employee detail:', error)
      message.error(error.message || '获取员工详情失败')
    }
  }

  // 编辑员工
  const handleEdit = (employee) => {
    setSelectedEmployee(employee)
    setEditForm({
      phone: employee.phone || '',
      email: employee.email || '',
      status: employee.status || '在职'
    })
    setIsEditModalOpen(true)
  }

  // 保存修改
  const handleSaveEdit = async () => {
    try {
      setUpdating(true)
      const response = await updateSubordinate(selectedEmployee.id, editForm)
      if (response.success) {
        message.success('更新成功')
        setIsEditModalOpen(false)
        setSelectedEmployee(null)
        // 刷新列表
        fetchSubordinates()
      } else {
        message.error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('Failed to update employee:', error)
      message.error(error.message || '更新失败')
    } finally {
      setUpdating(false)
    }
  }

  // 查看薪酬
  const handleViewSalary = async (employee) => {
    try {
      setSelectedEmployee(employee)
      const response = await getSubordinateSalary(employee.id)
      if (response.success) {
        setSalaryData(response.data || [])
        setIsSalaryModalOpen(true)
      } else {
        message.error(response.message || '获取薪酬信息失败')
      }
    } catch (error) {
      console.error('Failed to fetch salary:', error)
      message.error(error.message || '获取薪酬信息失败')
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

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部标题 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">下属员工管理</h2>
              <p className="text-gray-500">管理您所负责机构的员工信息</p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#59168b]/10 rounded-xl">
              <span className="text-2xl">👑</span>
              <span className="text-sm font-medium text-[#59168b]">机构负责人权限</span>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">下属总数</p>
                <p className="text-3xl font-semibold text-gray-900">{subordinates.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500 transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">在职人数</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {subordinates.filter(e => e.status === '在职').length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">本年新入职</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {subordinates.filter(e => {
                    const year = new Date(e.entryDate).getFullYear()
                    return year === new Date().getFullYear()
                  }).length}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                🆕
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-500 transition-all duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">平均薪酬</p>
                <p className="text-xl font-semibold text-gray-900">
                  ¥{subordinates.length > 0 
                    ? Math.round(subordinates.reduce((sum, e) => sum + (e.recentSalary || 0), 0) / subordinates.length).toLocaleString()
                    : 0}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-3xl">
                💰
              </div>
            </div>
          </div>
        </div>

        {/* 员工列表 */}
        {subordinates.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-1 h-5 bg-[#59168b] rounded mr-3"></span>
                员工列表
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">员工姓名</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">职位</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">联系电话</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">入职日期</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subordinates.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-[#59168b] flex items-center justify-center text-white font-semibold">
                            {employee.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{employee.position}</td>
                      <td className="px-6 py-4 text-gray-700">{employee.phone || '未填写'}</td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(employee.entryDate)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          employee.status === '在职' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewDetail(employee)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                          >
                            查看
                          </button>
                          <button
                            onClick={() => handleEdit(employee)}
                            className="px-3 py-1.5 text-xs font-medium text-[#59168b] bg-[#59168b]/10 hover:bg-[#59168b]/20 rounded-lg transition-colors duration-150"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleViewSalary(employee)}
                            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors duration-150"
                          >
                            薪酬
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-gray-600 text-lg">暂无下属员工</p>
          </div>
        )}

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-2xl">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">权限说明</p>
              <p className="mt-1">作为机构负责人，您可以查看和更新下属员工的基本信息（如联系方式、工作状态等），但不能修改核心信息（如身份证号、薪酬标准等）。如需修改核心信息，请联系人事部门。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 详情模态框 */}
      <Modal
        title={`员工详情 - ${selectedEmployee?.name}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedEmployee && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">姓名</p>
                <p className="text-sm font-medium text-gray-900">{selectedEmployee.name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">性别</p>
                <p className="text-sm font-medium text-gray-900">{selectedEmployee.gender}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                <p className="text-xs text-gray-500 mb-1">职位</p>
                <p className="text-sm font-medium text-gray-900">{selectedEmployee.position}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">联系电话</p>
                <p className="text-sm font-medium text-gray-900">{selectedEmployee.phone || '未填写'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">电子邮箱</p>
                <p className="text-sm font-medium text-gray-900">{selectedEmployee.email || '未填写'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">入职日期</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(selectedEmployee.entryDate)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">状态</p>
                <p className="text-sm font-medium text-gray-900">{selectedEmployee.status}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 编辑模态框 */}
      <Modal
        title={`编辑员工信息 - ${selectedEmployee?.name}`}
        open={isEditModalOpen}
        onOk={handleSaveEdit}
        onCancel={() => setIsEditModalOpen(false)}
        confirmLoading={updating}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent"
              placeholder="请输入联系电话"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">电子邮箱</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent"
              placeholder="请输入电子邮箱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">工作状态</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent"
            >
              <option value="在职">在职</option>
              <option value="休假">休假</option>
              <option value="停职">停职</option>
            </select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800">
              <strong>提示：</strong>您只能修改员工的联系方式和工作状态等非核心信息
            </p>
          </div>
        </div>
      </Modal>

      {/* 薪酬查看模态框 */}
      <Modal
        title={`薪酬记录 - ${selectedEmployee?.name}`}
        open={isSalaryModalOpen}
        onCancel={() => setIsSalaryModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-amber-800">
              <strong>权限说明：</strong>作为机构负责人，您只能查看下属的薪酬总额，不能查看详细薪酬项目明细
            </p>
          </div>

          {salaryData.length > 0 ? (
            <div className="space-y-4">
              {salaryData.map((record, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-[#59168b]/10 flex items-center justify-center">
                        <span className="text-lg">📅</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{record.month}</p>
                        <p className="text-xs text-gray-500">发放日期：{formatDate(record.paymentDate)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <div className="rounded-xl bg-gray-50 border border-gray-100 p-2">
                        <p className="text-[11px] text-gray-500">基薪</p>
                        <p className="font-semibold text-gray-900">¥{(record.baseAmount || 0).toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2">
                        <p className="text-[11px] text-emerald-700">奖金</p>
                        <p className="font-semibold text-emerald-700">+¥{(record.bonusAmount || 0).toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 border border-amber-100 p-2">
                        <p className="text-[11px] text-amber-700">扣款</p>
                        <p className="font-semibold text-amber-700">-¥{(record.deductionAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#59168b] text-white px-3 py-2">
                      <p className="text-[11px] text-white/80">实发</p>
                      <p className="text-lg font-bold">¥{(record.total || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">项目明细</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(record.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                              item.isBonus ? 'bg-emerald-100 text-emerald-700' :
                              item.isDeduction ? 'bg-amber-100 text-amber-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {item.isBonus ? '奖金' : item.isDeduction ? '扣款' : '固定'}
                            </span>
                            <span className="text-sm text-gray-800">{item.name}</span>
                          </div>
                          <span className={`text-sm font-semibold ${item.isDeduction ? 'text-amber-700' : 'text-gray-900'}`}>
                            {item.isDeduction ? '-' : ''}¥{(item.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {(!record.items || record.items.length === 0) && (
                        <div className="text-sm text-gray-400">暂无明细</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💼</div>
              <p className="text-gray-600">暂无薪酬记录</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default SubordinateManagement
