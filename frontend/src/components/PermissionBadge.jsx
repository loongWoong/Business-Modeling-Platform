import React from 'react';
import { Tag, Tooltip } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';

/**
 * PermissionBadge - 权限标识组件
 * 
 * 参考 Palantir Foundry 的权限标识
 * 显示操作所需的权限要求
 */
const PermissionBadge = ({ requiredPermission, hasPermission, children }) => {
  if (!requiredPermission) {
    return children;
  }

  if (hasPermission) {
    return (
      <Tooltip title="您有权限执行此操作">
        <span>
          {children}
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`需要 ${requiredPermission} 权限`}>
      <span style={{ opacity: 0.5, cursor: 'not-allowed' }}>
        {children}
        <Tag 
          icon={<LockOutlined />} 
          color="red" 
          style={{ marginLeft: '4px' }}
        >
          无权限
        </Tag>
      </span>
    </Tooltip>
  );
};

export default PermissionBadge;
