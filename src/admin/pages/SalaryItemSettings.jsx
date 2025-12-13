import React, { useState, useEffect } from 'react'
import { getSalaryItems, createSalaryItem, updateSalaryItem, deleteSalaryItem } from '../../services/adminService'

const SalaryItemSettings = () => {
  const [salaryItems, setSalaryItems] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 假数据保留作为注释参考
  // const [salaryItems, setSalaryItems] = useState([
  //   { id: 1, name: '基本工资', type: 'fixed', description: '员工的基础工资', createTime: '2024-01-10' },
  //   { id: 2, name: '绩效奖金', type: 'floating', description: '根据绩效考核发放', createTime: '2024-01-10' },
  //   { id: 3, name: '交通补贴', type: 'fixed', description: '固定交通补贴', createTime: '2024-01-11' },
  //   { id: 4, name: '餐饮补贴', type: 'fixed', description: '固定餐饮补贴', createTime: '2024-01-11' },
  //   { id: 5, name: '加班费', type: 'floating', description: '加班工时补偿', createTime: '2024-01-12' },
  //   { id: 6, name: '项目奖金', type: 'floating', description: '项目完成奖励', createTime: '2024-01-12' },
  // ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'fixed',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await getSalaryItems()
        const itemsData = response.data || []
        
        // 处理薪酬项目数据
        const formattedItems = itemsData.map(item => ({
          id: item._id,
          name: item.item_name,
          type: item.is_active ? 'fixed' : 'floating', // 假设is_active表示是否为固定项
          description: item.description || '',
          createTime: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : ''
        }))
        setSalaryItems(formattedItems)
      } catch (error) {
        console.error('加载薪酬项目数据失败:', error)
        // 可以在这里添加错误提示
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleAdd = () => {
    setModalMode('add')
    setSelectedItem(null)
    setFormData({ name: '', type: 'fixed', description: '' })
    setIsModalOpen(true)
  }

  const handleEdit = (item) => {
    setModalMode('edit')
    setSelectedItem(item)
    setFormData({
      name: item.name,
      type: item.type,
      description: item.description
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个薪酬项目吗？')) {
      try {
        setSubmitting(true)
        await deleteSalaryItem(id)
        setSalaryItems(salaryItems.filter(item => item.id !== id))
        alert('薪酬项目删除成功')
      } catch (error) {
        console.error('删除薪酬项目失败:', error)
        alert(error.message || '薪酬项目删除失败')
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('请输入薪酬项目名称')
      return
    }

    try {
      setSubmitting(true)
      
      if (modalMode === 'add') {
        // 准备提交给后端的数据
        const createData = {
          item_name: formData.name,
          description: formData.description,
          is_active: formData.type === 'fixed' // 假设is_active表示是否为固定项
        }
        
        // 调用API创建薪酬项目
        const response = await createSalaryItem(createData)
        const newItemData = response.data
        
        // 转换为前端格式
        const newItem = {
          id: newItemData._id,
          name: newItemData.item_name,
          type: newItemData.is_active ? 'fixed' : 'floating',
          description: newItemData.description || '',
          createTime: newItemData.created_at ? new Date(newItemData.created_at).toISOString().split('T')[0] : ''
        }
        setSalaryItems([...salaryItems, newItem])
      } else {
        // 准备提交给后端的数据
        const updateData = {
          item_name: formData.name,
          description: formData.description,
          is_active: formData.type === 'fixed'
        }
        
        // 调用API更新薪酬项目
        await updateSalaryItem(selectedItem.id, updateData)
        
        // 更新本地状态
        setSalaryItems(salaryItems.map(item =>
          item.id === selectedItem.id
            ? { ...item, name: formData.name, type: formData.type, description: formData.description }
            : item
        ))
      }

      setIsModalOpen(false)
      setFormData({ name: '', type: 'fixed', description: '' })
      alert(modalMode === 'add' ? '薪酬项目创建成功' : '薪酬项目更新成功')
    } catch (error) {
      console.error('保存薪酬项目失败:', error)
      alert(error.message || '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredItems = salaryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesType
  })

  const fixedCount = salaryItems.filter(item => item.type === 'fixed').length
  const floatingCount = salaryItems.filter(item => item.type === 'floating').length

  return (
    <div className="h-full bg-[#fafafa] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部卡片 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">薪酬项目设置</h2>
              <p className="text-gray-500">定义薪酬组成项，可标记为固定项或浮动项</p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-[#59168b] hover:bg-[#6d1fa7] text-white font-medium rounded-xl transition-colors duration-150 shadow-sm cursor-pointer"
            >
              + 添加薪酬项目
            </button>
          </div>

          {/* 搜索和筛选栏 */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索薪酬项目名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 cursor-pointer"
            >
              <option value="all">全部类型</option>
              <option value="fixed">固定项</option>
              <option value="floating">浮动项</option>
            </select>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#59168b] transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">项目总数</p>
                <p className="text-3xl font-semibold text-gray-900">{salaryItems.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#59168b]/10 flex items-center justify-center text-3xl">
                💰
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">固定项</p>
                <p className="text-3xl font-semibold text-gray-900">{fixedCount}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">
                📌
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-500 transition-colors duration-200 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">浮动项</p>
                <p className="text-3xl font-semibold text-gray-900">{floatingCount}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">
                📊
              </div>
            </div>
          </div>
        </div>

        {/* 项目列表 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">项目名称</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">描述</th>
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
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500">暂无薪酬项目数据</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-[#59168b]/10 flex items-center justify-center text-xl">
                            💰
                          </div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          item.type === 'fixed' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.type === 'fixed' ? '📌 固定项' : '📊 浮动项'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.description || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{item.createTime}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150 cursor-pointer"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
                {modalMode === 'add' ? '添加薪酬项目' : '编辑薪酬项目'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {modalMode === 'add' ? '创建新的薪酬项目' : '修改薪酬项目信息'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  项目名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150"
                  placeholder="请输入薪酬项目名称"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  项目类型
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'fixed' })}
                    className={`p-4 border-2 rounded-xl transition-all duration-150 cursor-pointer ${
                      formData.type === 'fixed'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📌</div>
                    <div className="font-medium text-gray-900">固定项</div>
                    <div className="text-xs text-gray-500 mt-1">每月固定发放</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'floating' })}
                    className={`p-4 border-2 rounded-xl transition-all duration-150 cursor-pointer ${
                      formData.type === 'floating'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-medium text-gray-900">浮动项</div>
                    <div className="text-xs text-gray-500 mt-1">根据情况调整</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  项目描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59168b] focus:border-transparent transition-all duration-150 resize-none"
                  placeholder="请输入项目描述（可选）"
                />
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

export default SalaryItemSettings


