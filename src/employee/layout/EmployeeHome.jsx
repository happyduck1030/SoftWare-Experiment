import React from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import EmployeeArchive from '../pages/EmployeeArchive'
import EmployeeSalary from '../pages/EmployeeSalary'

const EmployeeHome = () => {
  const location = useLocation()

  const menuItems = [
    { name: '个人档案', path: '/employee/archive', icon: '📝' },
    { name: '薪酬记录', path: '/employee/salary', icon: '💰' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen w-screen bg-[#fafafa] overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">员工自助系统</h1>
        </div>

        {/* 用户信息 */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#59168b] flex items-center justify-center text-white text-sm font-medium">
              张
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">张三</div>
              <div className="text-xs text-gray-500">前端工程师</div>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-4">
          <ul className="space-y-0.5 px-3">
            {menuItems.map((item) => (
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
        </nav>

        {/* 底部 */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150">
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
              {menuItems.find(i => i.path === location.pathname)?.name || '员工自助'}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-150">
              帮助
            </button>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="flex-1 overflow-auto">
          <div className="h-full">
            <Routes>
              <Route path="/" element={<Navigate to="/employee/archive" replace />} />
              <Route path="/archive" element={<EmployeeArchive />} />
              <Route path="/salary" element={<EmployeeSalary />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeeHome


