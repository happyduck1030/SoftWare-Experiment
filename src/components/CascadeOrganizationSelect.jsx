import React, { useState, useEffect } from 'react'
import { message } from 'antd'
import { getOrganizations } from '../services/adminService'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * 分级机构选择组件
 * 支持三级联动选择：一级机构 → 二级机构 → 三级机构
 */
const CascadeOrganizationSelect = ({ 
  value, // 当前选中的机构ID（三级机构）
  onChange, // 变更回调
  level = 3, // 需要选择到第几级（1-3）
  disabled = false,
  placeholder = '请选择机构'
}) => {
  const [level1Orgs, setLevel1Orgs] = useState([])
  const [level2Orgs, setLevel2Orgs] = useState([])
  const [level3Orgs, setLevel3Orgs] = useState([])
  
  const [selectedLevel1, setSelectedLevel1] = useState('')
  const [selectedLevel2, setSelectedLevel2] = useState('')
  const [selectedLevel3, setSelectedLevel3] = useState('')
  
  const [loading, setLoading] = useState(false)

  // 初始化加载一级机构
  useEffect(() => {
    fetchLevel1Organizations()
  }, [])

  // 根据value回显选中的机构
  useEffect(() => {
    if (value && level === 3) {
      // 如果有初始值，需要反向查找其父级机构
      loadOrgHierarchy(value)
    }
  }, [value])

  // 加载机构层级关系
  const loadOrgHierarchy = async (orgId) => {
    try {
      const response = await getOrganizations({ limit: 1000 })
      if (response.success) {
        const allOrgs = response.data
        const targetOrg = allOrgs.find(o => o._id === orgId)
        
        if (targetOrg && targetOrg.org_level === 3) {
          setSelectedLevel3(targetOrg._id)
          
          if (targetOrg.parent_org_id) {
            const level2 = allOrgs.find(o => o._id === targetOrg.parent_org_id)
            if (level2) {
              setSelectedLevel2(level2._id)
              fetchLevel3Organizations(level2._id)
              
              if (level2.parent_org_id) {
                const level1 = allOrgs.find(o => o._id === level2.parent_org_id)
                if (level1) {
                  setSelectedLevel1(level1._id)
                  fetchLevel2Organizations(level1._id)
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('加载机构层级失败:', error)
    }
  }

  // 获取一级机构
  const fetchLevel1Organizations = async () => {
    try {
      setLoading(true)
      const response = await getOrganizations({ level: 1, limit: 100 })
      if (response.success) {
        setLevel1Orgs(response.data || [])
      }
    } catch (error) {
      console.error('获取一级机构失败:', error)
      message.error('获取一级机构失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取二级机构
  const fetchLevel2Organizations = async (parentId) => {
    try {
      setLoading(true)
      const response = await getOrganizations({ 
        level: 2, 
        parent_org_id: parentId,
        limit: 100 
      })
      if (response.success) {
        setLevel2Orgs(response.data || [])
      }
    } catch (error) {
      console.error('获取二级机构失败:', error)
      message.error('获取二级机构失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取三级机构
  const fetchLevel3Organizations = async (parentId) => {
    try {
      setLoading(true)
      const response = await getOrganizations({ 
        level: 3, 
        parent_org_id: parentId,
        limit: 100 
      })
      if (response.success) {
        setLevel3Orgs(response.data || [])
      }
    } catch (error) {
      console.error('获取三级机构失败:', error)
      message.error('获取三级机构失败')
    } finally {
      setLoading(false)
    }
  }

  // 选择一级机构
  const handleLevel1Change = (value) => {
    console.log('选择一级机构:', value)
    setSelectedLevel1(value)
    setSelectedLevel2('')
    setSelectedLevel3('')
    setLevel2Orgs([])
    setLevel3Orgs([])
    
    if (value) {
      fetchLevel2Organizations(value)
      if (level === 1) {
        onChange?.(value)
      }
    } else {
      onChange?.('')
    }
  }

  // 选择二级机构
  const handleLevel2Change = (value) => {
    console.log('选择二级机构:', value)
    setSelectedLevel2(value)
    setSelectedLevel3('')
    setLevel3Orgs([])
    
    if (value) {
      fetchLevel3Organizations(value)
      if (level === 2) {
        onChange?.(value)
      }
    } else {
      onChange?.('')
    }
  }

  // 选择三级机构
  const handleLevel3Change = (value) => {
    console.log('选择三级机构:', value)
    setSelectedLevel3(value)
    onChange?.(value)
  }

  return (
    <div className="space-y-4">
      {/* 一级机构选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          一级机构 <span className="text-red-500">*</span>
        </label>
        <Select 
          value={selectedLevel1} 
          onValueChange={handleLevel1Change}
          disabled={disabled || loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="请选择一级机构" />
          </SelectTrigger>
          <SelectContent>
            {level1Orgs.map(org => (
              <SelectItem key={org._id} value={org._id}>
                {org.org_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 二级机构选择 */}
      {level >= 2 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            二级机构 {level >= 2 && <span className="text-red-500">*</span>}
          </label>
          <Select 
            value={selectedLevel2} 
            onValueChange={handleLevel2Change}
            disabled={disabled || loading || !selectedLevel1 || level2Orgs.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedLevel1 ? "请选择二级机构" : "请先选择一级机构"} />
            </SelectTrigger>
            <SelectContent>
              {level2Orgs.map(org => (
                <SelectItem key={org._id} value={org._id}>
                  {org.org_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 三级机构选择 */}
      {level === 3 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            三级机构 <span className="text-red-500">*</span>
          </label>
          <Select 
            value={selectedLevel3} 
            onValueChange={handleLevel3Change}
            disabled={disabled || loading || !selectedLevel2 || level3Orgs.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedLevel2 ? "请选择三级机构" : "请先选择二级机构"} />
            </SelectTrigger>
            <SelectContent>
              {level3Orgs.map(org => (
                <SelectItem key={org._id} value={org._id}>
                  {org.org_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

export default CascadeOrganizationSelect


