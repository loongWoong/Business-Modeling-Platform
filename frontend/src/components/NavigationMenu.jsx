import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import {
  HomeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ApiOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

/**
 * 全局导航菜单组件（Ant Design风格）
 * 
 * 基于DDD聚合边界组织导航：
 * - Domain（分类维度）
 * - Model聚合
 * - Datasource聚合
 * - ETL聚合
 */
const NavigationMenu = ({ onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);

  // 处理折叠状态变化
  const handleCollapse = (value) => {
    setCollapsed(value);
    if (onCollapse) {
      onCollapse(value);
    }
  };

  // 菜单项配置
  const menuItems = [
    {
      key: 'domain',
      icon: <HomeOutlined />,
      label: '业务域',
      path: '/',
      description: ''
    },
    {
      key: 'model',
      icon: <DatabaseOutlined />,
      label: '模型管理',
      path: '/models',
      description: ''
    },
    {
      key: 'datasource',
      icon: <FileTextOutlined />,
      label: '数据源管理',
      path: '/datasources',
      description: ''
    },
    {
      key: 'etl',
      icon: <ApiOutlined />,
      label: 'ETL管理',
      path: '/etl',
      description: ''
    }
  ];

  // 根据当前路径确定选中的菜单项
  useEffect(() => {
    const currentPath = location.pathname;
    let activeKey = '';

    if (currentPath === '/') {
      activeKey = 'domain';
    } else if (currentPath === '/models' || currentPath.startsWith('/model/')) {
      activeKey = 'model';
    } else if (currentPath === '/datasources' || currentPath.startsWith('/datasource/')) {
      activeKey = 'datasource';
    } else if (currentPath === '/etl' || currentPath.startsWith('/etl/')) {
      activeKey = 'etl';
    }

    setSelectedKeys(activeKey ? [activeKey] : []);
  }, [location.pathname]);

  // 处理菜单点击
  const handleMenuClick = ({ key }) => {
    const menuItem = menuItems.find(item => item.key === key);
    if (menuItem && menuItem.path) {
      navigate(menuItem.path);
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={handleCollapse}
      width={240}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
      }}
      theme="dark"
      trigger={null}
    >
      {/* Logo区域 */}
      <div
        style={{
          height: 64,
          padding: collapsed ? '16px' : '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              业务建模平台
            </div>
            <Text type="secondary" style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
            </Text>
          </div>
        )}
        {collapsed && (
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
            DDD
          </div>
        )}
      </div>

      {/* 折叠按钮 */}
      <div
        style={{
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          cursor: 'pointer'
        }}
        onClick={() => handleCollapse(!collapsed)}
      >
        {collapsed ? (
          <MenuUnfoldOutlined style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '16px' }} />
        ) : (
          <MenuFoldOutlined style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '16px' }} />
        )}
      </div>

      {/* 菜单 */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems.map(item => ({
          key: item.key,
          icon: item.icon,
          label: (
            <div>
              <div>{item.label}</div>
              {!collapsed && item.description && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.45)',
                    display: 'block',
                    marginTop: '2px',
                    lineHeight: '1.2'
                  }}
                >
                  {item.description}
                </Text>
              )}
            </div>
          )
        }))}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
          padding: '8px 0'
        }}
      />

      {/* 聚合说明 */}
      {!collapsed && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }}
        >
  
        </div>
      )}
    </Sider>
  );
};

export default NavigationMenu;

