import React, { useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import { getMySalary, getOrganizationInfo } from '../../services/employeeService'

const EmployeeSalary = () => {
  const [salaryRecords, setSalaryRecords] = useState([])
  const [orgInfo, setOrgInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [salaryRes, orgRes] = await Promise.all([
        getMySalary(),
        getOrganizationInfo()
      ])

      if (salaryRes.success) {
        setSalaryRecords(salaryRes.data || [])
      } else {
        message.error(salaryRes.message || '获取薪酬记录失败')
      }

      if (orgRes.success) {
        setOrgInfo(orgRes.data || null)
      } else {
        message.error(orgRes.message || '获取组织信息失败')
      }
    } catch (error) {
      console.error('Failed to load salary/organization:', error)
      message.error(error.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const totalSalary = useMemo(
    () => salaryRecords.reduce((sum, r) => sum + (r.total || 0), 0),
    [salaryRecords]
  )
  const avgSalary = useMemo(
    () => (salaryRecords.length ? Math.round(totalSalary / salaryRecords.length) : 0),
    [salaryRecords, totalSalary]
  )

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const renderOrgPath = () => {
    const path = orgInfo?.organizationPath || {}
    const order = ['level1', 'level2', 'level3']
    return order
      .filter(k => path[k])
      .map((key, idx) => (
        <div key={key} className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#0f172a] text-white flex items-center justify-center font-semibold shadow">
            {idx + 1}
          </div>
          <div className="flex-1 bg-[#0f172a]/5 border border-[#0f172a]/20 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">
              {key === 'level1' ? '一级机构' : key === 'level2' ? '二级机构' : '三级机构'}
            </p>
            <p className="text-sm font-semibold text-gray-900">{path[key]}</p>
          </div>
        </div>
      ))
  }

  const renderItems = (items) => {
    if (!items?.length) {
      return <div className="text-gray-400 text-sm">暂无明细</div>
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  item.isBonus
                    ? 'bg-emerald-100 text-emerald-700'
                    : item.isDeduction
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {item.isBonus ? '奖金' : item.isDeduction ? '扣款' : '固定'}
              </span>
              <span className="text-sm text-gray-900">{item.name}</span>
            </div>
            <span
              className={`text-base font-semibold ${
                item.isDeduction ? 'text-amber-700' : 'text-gray-900'
              }`}
            >
              {item.isDeduction ? '-' : ''}¥{(item.amount || 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full bg-[#0b132b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">⏳</div>
          <div className="text-sm opacity-80">薪酬信息加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-white text-gray-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-[#f6f7fb] to-[#eef2ff] border border-gray-100 rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">薪酬自助</p>
              <h1 className="text-3xl font-bold text-gray-900">我的薪酬</h1>
              <p className="text-gray-500 mt-2">查看每月实发、奖金、扣款明细</p>
            </div>
            <div className="flex gap-3">
              <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 text-left shadow-sm">
                <p className="text-xs text-gray-500 mb-1">累计实发</p>
                <p className="text-xl font-semibold text-gray-900">¥{totalSalary.toLocaleString()}</p>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 text-left shadow-sm">
                <p className="text-xs text-gray-500 mb-1">平均实发</p>
                <p className="text-xl font-semibold text-gray-900">¥{avgSalary.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {orgInfo?.organizationPath && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify之间 mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🧭</span>
                <div>
                  <p className="text-sm text-gray-500">我的组织路径</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {orgInfo.organizationPath.level3 || '所在机构'}
                  </p>
                </div>
              </div>
              {orgInfo.isBoss && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                  👑 机构负责人
                </span>
              )}
            </div>
            <div className="space-y-3">
              {renderOrgPath()}
            </div>
          </div>
        )}

        {salaryRecords.length > 0 ? (
          <div className="space-y-4">
            {salaryRecords.map((record) => (
              <div
                key={record.month}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
                      📅
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">发放月份</p>
                      <p className="text-xl font-semibold">{record.month}</p>
                      <p className="text-xs text-gray-400">支付日期：{formatDate(record.paymentDate)}</p>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">基薪</p>
                      <p className="text-lg font-semibold text-gray-900">¥{(record.baseAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3">
                      <p className="text-xs text-emerald-700">奖金</p>
                      <p className="text-lg font-semibold text-emerald-700">+¥{(record.bonusAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3">
                      <p className="text-xs text-amber-700">扣款</p>
                      <p className="text-lg font-semibold text-amber-700">-¥{(record.deductionAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gray-900 text-white px-5 py-4 shadow-sm">
                    <p className="text-xs text-white/80">实发</p>
                    <p className="text-2xl font-bold">¥{(record.total || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3">薪酬项目</p>
                  {renderItems(record.items)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-12 text-center">
            <div className="text-5xl mb-3">💼</div>
            <p className="text-gray-700 text-lg">暂无薪酬记录</p>
            <p className="text-gray-400 text-sm mt-1">等待财务发放后即可查看</p>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6">
          <div className="flex items-start space-x-3">
            <div className="text-xl">ℹ️</div>
            <div className="text-sm text-gray-700">
              <p className="font-medium">温馨提示</p>
              <p className="mt-1">如对薪酬发放有疑问，请联系 HR 或财务。奖金/扣款会以绿色/橙色标识显示。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeSalary

