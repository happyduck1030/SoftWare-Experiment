import React, { useMemo, useState, useEffect } from 'react'
import { getOrganizationTreeEmployee, getOrganizationInfo } from '../../services/employeeService'

const OrganizationInfo = () => {
  const [tree, setTree] = useState([])
  const [orgInfo, setOrgInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [treeRes, infoRes] = await Promise.all([
          getOrganizationTreeEmployee(),
          getOrganizationInfo()
        ])

        if (infoRes.success) setOrgInfo(infoRes.data)
        if (treeRes.success) setTree(treeRes.data || [])
      } catch (e) {
        console.error('加载组织架构失败', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredTree = useMemo(() => {
    if (!orgInfo) return []
    const allowedIds = new Set(
      [orgInfo.organizationPath?.level1Id, orgInfo.organizationPath?.level2Id, orgInfo.organizationPath?.level3Id]
        .filter(Boolean)
        .map(id => id?.toString())
    )
    const filter = (nodes) => nodes
      .map(n => {
        const children = filter(n.children || [])
        const keep = allowedIds.has(n._id?.toString()) || children.length > 0
        return keep ? { ...n, children } : null
      })
      .filter(Boolean)
    return filter(tree)
  }, [tree, orgInfo])

  const levelCounts = useMemo(() => {
    let l1 = 0, l2 = 0, l3 = 0
    const walk = (nodes) => {
      nodes.forEach(n => {
        if (n.org_level === 1) l1++
        else if (n.org_level === 2) l2++
        else if (n.org_level === 3) l3++
        walk(n.children || [])
      })
    }
    walk(filteredTree)
    return { l1, l2, l3 }
  }, [filteredTree])

  const renderPyramid = () => {
    const level3 = orgInfo?.organizationPath?.level3
    const level2 = orgInfo?.organizationPath?.level2
    const level1 = orgInfo?.organizationPath?.level1
    return (
      <div className="w-full flex flex-col items-center space-y-4">
        <div className="w-72 h-16 bg-linear-to-r from-[#ffd166] to-[#f4a261] rounded-2xl border-4 border-black shadow-[8px_8px_0_#000] flex items-center justify-center text-base font-black text-black uppercase tracking-wide">
          {level1 || '一级机构'}
        </div>
        <div className="w-64 h-16 bg-linear-to-r from-[#9ae6b4] to-[#48bb78] rounded-2xl border-4 border-black shadow-[8px_8px_0_#000] flex items-center justify-center text-base font-black text-black uppercase tracking-wide">
          {level2 || '二级机构'}
        </div>
        <div className="w-56 h-16 bg-linear-to-r from-[#a0c4ff] to-[#4c6fff] rounded-2xl border-4 border-black shadow-[8px_8px_0_#000] flex items-center justify-center text-base font-black text-black uppercase tracking-wide">
          {level3 || '三级机构'}
        </div>
        <div className="text-xs text-gray-500">* 仅展示与您相关的机构路径</div>
      </div>
    )
  }

  const renderPixelNode = (node, depth = 0) => (
    <div key={node._id} className="relative pl-4">
      <div
        className={`flex items-center space-x-3 rounded-xl border-2 border-black px-3 py-2 shadow-[4px_4px_0_#000] bg-white`}
        style={{ marginLeft: depth * 16 }}
      >
        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-lg">
          {node.org_level === 1 ? '🏢' : node.org_level === 2 ? '🏛️' : '📁'}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{node.org_name}</p>
          <p className="text-[11px] text-gray-500">
            {node.org_level === 1 ? '一级机构' : node.org_level === 2 ? '二级机构' : '三级机构'}
          </p>
        </div>
      </div>
      {(node.children || []).length > 0 && (
        <div className="ml-4 mt-3 space-y-2">
          {node.children.map(child => renderPixelNode(child, depth + 1))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="h-full bg-[#0b132b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2 animate-pulse">⏳</div>
          <div className="text-sm opacity-80">组织架构加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-white text-gray-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#0f172a] text-white border-4 border-black rounded-3xl shadow-[10px_10px_0_#05080f] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Pixel Pyramid</p>
              <h1 className="text-2xl font-black text-white mt-1">我的组织架构</h1>
              <p className="text-sm text-white/70 mt-1">仅展示与你相关的机构链路</p>
            </div>
            <div className="flex space-x-2">
              <div className="px-3 py-2 bg-white text-black rounded-xl border-2 border-black shadow-[4px_4px_0_#000]">
                <p className="text-[11px] uppercase text-gray-600">一级</p>
                <p className="text-xl font-black">{levelCounts.l1}</p>
              </div>
              <div className="px-3 py-2 bg-white text-black rounded-xl border-2 border-black shadow-[4px_4px_0_#000]">
                <p className="text-[11px] uppercase text-gray-600">二级</p>
                <p className="text-xl font-black">{levelCounts.l2}</p>
              </div>
              <div className="px-3 py-2 bg-white text-black rounded-xl border-2 border-black shadow-[4px_4px_0_#000]">
                <p className="text-[11px] uppercase text-gray-600">三级</p>
                <p className="text-xl font-black">{levelCounts.l3}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white text-gray-900 rounded-3xl border-4 border-black shadow-[10px_10px_0_#05080f] p-6">
          <h3 className="text-lg font-black mb-4 flex items-center space-x-2">
            <span>🧱</span><span>机构路径</span>
          </h3>
          {renderPyramid()}
        </div>

        <div className="bg-white text-gray-900 rounded-3xl border-4 border-black shadow-[10px_10px_0_#05080f] p-6">
          <h3 className="text-lg font-black mb-4 flex items-center space-x-2">
            <span>🗺️</span><span>机构链路</span>
          </h3>
          {filteredTree.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-600">暂无可见机构</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTree.map(n => renderPixelNode(n))}
            </div>
          )}
        </div>

        <div className="bg-[#0f172a] text-white rounded-3xl border-4 border-black shadow-[10px_10px_0_#05080f] p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_25%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.07),transparent_22%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.06),transparent_20%)] pointer-events-none" />
          <div className="relative space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Quote of the day</p>
            <p className="text-2xl md:text-3xl font-black leading-snug drop-shadow-[3px_3px_0_#000] bg-clip-text text-transparent bg-linear-to-r from-[#facc15] via-[#f97316] to-[#22d3ee] animate-[pulse_3s_ease-in-out_infinite]">
              “道路是曲折的，前途是光明的.”
            </p>
            <p className="text-sm text-white/70">—— 毛泽东</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationInfo
