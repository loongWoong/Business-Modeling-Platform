import { useState, useEffect } from 'react';

/**
 * usePermission Hook - 权限检查
 * 
 * 参考 Palantir Foundry 的权限控制模式
 * 解析 Domain 的 permissions JSON，检查用户权限
 */
const usePermission = (domain) => {
  const [permissions, setPermissions] = useState(null);
  const [hasPermission, setHasPermission] = useState({});

  useEffect(() => {
    if (domain && domain.permissions) {
      try {
        const parsed = typeof domain.permissions === 'string' 
          ? JSON.parse(domain.permissions) 
          : domain.permissions;
        setPermissions(parsed);
        
        // 初始化权限检查结果
        const permissionMap = {};
        if (parsed.read) permissionMap.read = true;
        if (parsed.write) permissionMap.write = true;
        if (parsed.delete) permissionMap.delete = true;
        if (parsed.admin) permissionMap.admin = true;
        
        setHasPermission(permissionMap);
      } catch (error) {
        console.error('Failed to parse permissions:', error);
        setPermissions(null);
      }
    } else {
      setPermissions(null);
      // 如果没有权限配置，默认允许所有操作（向后兼容）
      setHasPermission({
        read: true,
        write: true,
        delete: true,
        admin: true
      });
    }
  }, [domain]);

  /**
   * 检查是否有特定权限
   * @param {string} action - 操作类型：'read', 'write', 'delete', 'admin'
   * @returns {boolean}
   */
  const checkPermission = (action) => {
    if (!permissions) {
      // 如果没有权限配置，默认允许（向后兼容）
      return true;
    }
    return hasPermission[action] === true;
  };

  /**
   * 获取权限提示信息
   * @param {string} action - 操作类型
   * @returns {string}
   */
  const getPermissionMessage = (action) => {
    if (checkPermission(action)) {
      return '';
    }
    const actionMap = {
      read: '查看',
      write: '编辑',
      delete: '删除',
      admin: '管理'
    };
    return `您没有${actionMap[action] || action}权限`;
  };

  return {
    permissions,
    hasPermission,
    checkPermission,
    getPermissionMessage
  };
};

export default usePermission;
