import React, { useState } from 'react'
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import OrganizationSettings from '../pages/OrganizationSettings'
import PositionSettings from '../pages/PositionSettings'
import SalaryItemSettings from '../pages/SalaryItemSettings'
import ArchiveRegister from '../pages/ArchiveRegister'
import ArchiveReview from '../pages/ArchiveReview'
import ArchiveSearch from '../pages/ArchiveSearch'
import ArchiveUpdate from '../pages/ArchiveUpdate'
import SalaryStandardRegister from '../pages/SalaryStandardRegister'
import SalaryStandardReview from '../pages/SalaryStandardReview'
import SalaryStandardSearch from '../pages/SalaryStandardSearch'
import SalaryStandardUpdate from '../pages/SalaryStandardUpdate'
import SalaryPaymentRegister from '../pages/SalaryPaymentRegister'
import SalaryPaymentReview from '../pages/SalaryPaymentReview'
import SalaryPaymentSearch from '../pages/SalaryPaymentSearch'

const AdminHome = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    {
      title: '系统设置',
      items: [
        { name: '机构关系设置', path: '/admin/organization', icon: '🏢' },
        { name: '职位设置', path: '/admin/position', icon: '💼' },
        { name: '薪酬项目设置', path: '/admin/salary-items', icon: '💰' },
      ]
    },
    {
      title: '档案管理',
      items: [
        { name: '档案登记', path: '/admin/archive-register', icon: '📝' },
        { name: '档案登记复核', path: '/admin/archive-review', icon: '✓' },
        { name: '档案查询', path: '/admin/archive-search', icon: '🔍' },
        { name: '档案变更', path: '/admin/archive-update', icon: '📄' },
      ]
    },
    {
      title: '薪酬管理',
      items: [
        { name: '薪酬标准登记', path: '/admin/salary-standard-register', icon: '💵' },
        { name: '薪酬标准复核', path: '/admin/salary-standard-review', icon: '✓' },
        { name: '薪酬标准查询', path: '/admin/salary-standard-search', icon: '🔎' },
        { name: '薪酬发放登记', path: '/admin/salary-payment-register', icon: '💸' },
        { name: '薪酬发放复核', path: '/admin/salary-payment-review', icon: '✓' },
      ]
    }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    // 清除本地登录信息
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (e) {
      console.error('清除本地登录信息失败', e)
    }
    // 跳转回登录页
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen w-screen bg-[#fafafa] overflow-hidden">
      {/* 侧边栏 - 苹果风格 */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">人力资源系统</h1>
        </div>

        {/* 用户信息 */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#59168b] flex items-center justify-center text-white text-sm font-medium">
              管
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">管理员</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              <div className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </div>
              <ul className="space-y-0.5 px-3">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-150 ${
                        isActive(item.path)
                          ? 'bg-[#59168b] text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* 底部 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
          >
            <span className="text-base">🚪</span>
            <span className="text-sm font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {menuItems.flatMap(s => s.items).find(i => i.path === location.pathname)?.name || '管理后台'}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150">
              通知
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150">
              设置
            </button>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="flex-1 overflow-auto">
          <div className="h-full">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/organization" replace />} />
            <Route path="/organization" element={<OrganizationSettings />} />
            <Route path="/position" element={<PositionSettings />} />
            <Route path="/salary-items" element={<SalaryItemSettings />} />
            <Route path="/archive-register" element={<ArchiveRegister />} />
            <Route path="/archive-review" element={<ArchiveReview />} />
            <Route path="/archive-search" element={<ArchiveSearch />} />
            <Route path="/archive-update" element={<ArchiveUpdate />} />
            <Route path="/salary-standard-register" element={<SalaryStandardRegister />} />
            <Route path="/salary-standard-review" element={<SalaryStandardReview />} />
            <Route path="/salary-standard-search" element={<SalaryStandardSearch />} />
            <Route path="/salary-standard-update" element={<SalaryStandardUpdate />} />
            <Route path="/salary-payment-register" element={<SalaryPaymentRegister />} />
            <Route path="/salary-payment-review" element={<SalaryPaymentReview />} />
            <Route path="/salary-payment-search" element={<SalaryPaymentSearch />} />
          </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminHome