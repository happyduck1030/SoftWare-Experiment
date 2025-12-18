import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import EmployeeArchive from '../pages/EmployeeArchive'
import EmployeeSalary from '../pages/EmployeeSalary'
import OrganizationInfo from '../pages/OrganizationInfo'
import SubordinateManagement from '../pages/SubordinateManagement'
import Pixel404 from '../pages/Pixel404'

const EmployeeHome = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState(null)

  // 从localStorage获取用户信息
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setUserInfo(user)
      } catch (error) {
        console.error('Failed to parse user info:', error)
        message.error('用户信息无效，请重新登录')
        navigate('/')
      }
    } else {
      message.error('未登录，请先登录')
      navigate('/')
    }
  }, [])

  // 根据用户角色动态生成菜单：通过 role === 'boss' 判断是否为机构负责人
  const isBoss = userInfo?.role === 'boss'
  const menuItems = userInfo
    ? [
        { name: '个人档案', path: '/employee/archive', icon: '📝' },
        { name: '组织架构', path: '/employee/organization', icon: '🏢' },
        { name: '薪酬记录', path: '/employee/salary', icon: '💰' },
        ...(isBoss ? [{ name: '下属管理', path: '/employee/subordinates', icon: '👥' }] : [])
      ]
    : []

  const isActive = (path) => location.pathname === path

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    message.success('已退出登录')
    navigate('/')
  }

  // 如果没有用户信息，显示加载中
  if (!userInfo) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen bg-[#fafafa] overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">员工自助系统</h1>
        </div>

        {/* 用户信息 */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#59168b] flex items-center justify-center text-white text-sm font-medium shadow-md">
              {userInfo.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{userInfo.name || '用户'}</div>
              <div className="text-xs text-gray-500">{userInfo.position || '员工'}</div>
            </div>
          </div>
          {/* 机构信息 */}
              {userInfo.organizationPath && (
            <div className="bg-gray-50 rounded-lg p-2 mt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs">🏛️</span>
                <span className="text-xs text-gray-600 truncate" title={userInfo.organizationPath.level3}>
                  {userInfo.organizationPath.level3}
                </span>
              </div>
              {isBoss && (
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs">👑</span>
                  <span className="text-xs text-[#59168b] font-medium">负责人</span>
                </div>
              )}
            </div>
          )}
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
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150"
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
              <Route path="/organization" element={<OrganizationInfo />} />
              <Route path="/salary" element={<EmployeeSalary />} />
              <Route
                path="/subordinates"
                element={isBoss ? <SubordinateManagement /> : <Pixel404 reason="forbidden" />}
              />
              <Route path="*" element={<Pixel404 />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeeHome


