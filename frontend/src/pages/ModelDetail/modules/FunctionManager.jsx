import React, { useState, useEffect } from 'react';

const FunctionManager = ({ 
  modelId,
  showNotification,
  showConfirmDialog
}) => {
  // 函数列表
  const [functions, setFunctions] = useState([]);
  // 展开的函数详情ID
  const [expandedFunctionId, setExpandedFunctionId] = useState(null);
  
  // 获取函数列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取函数列表
        const functionsResponse = await fetch('/api/function');
        const functionsData = await functionsResponse.json();
        setFunctions(functionsData);
      } catch (error) {
        console.error('Failed to fetch functions:', error);
      }
    };

    fetchData();
  }, [modelId]);

  // 切换函数详情展开状态
  const toggleFunctionDetail = (funcId) => {
    if (expandedFunctionId === funcId) {
      setExpandedFunctionId(null); // 关闭详情
    } else {
      setExpandedFunctionId(funcId); // 展开详情
    }
  };

  return (
    <div className="function-manager">
      <div className="header-toolbar">
        <div>
          <h3>函数管理</h3>
          <p>可复用的计算逻辑或规则封装</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '20px' }}>#</th>
              <th>函数名称</th>
              <th>返回类型</th>
              <th>版本</th>
              <th>描述</th>
              <th>所属业务域</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {functions.map((func, index) => (
              <tr key={func.id}>
                <td>{index + 1}</td>
                <td>{func.name}</td>
                <td>{func.returnType}</td>
                <td>{func.version}</td>
                <td>{func.description}</td>
              <td>{func.domainId}</td>
              <td>
                <button className="view" onClick={() => toggleFunctionDetail(func.id)}>
                  {expandedFunctionId === func.id ? '收起详情' : '查看详情'}
                </button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 函数详情 */}
      {expandedFunctionId && (
        <div className="header-toolbar" style={{ marginTop: '20px' }}>
          <div>
            <h3>函数详情</h3>
            <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
              {functions.map(func => {
                if (func.id === expandedFunctionId) {
                  return (
                    <div key={func.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ color: '#3b82f6', margin: 0 }}>{func.name}</h4>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span className="status-badge active">v{func.version}</span>
                          <span className="status-badge" style={{ backgroundColor: '#64748b', color: 'white' }}>{func.returnType}</span>
                        </div>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>描述:</strong>
                        <p style={{ margin: '5px 0 0 0' }}>{func.description}</p>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>输入参数:</strong>
                        <pre style={{ background: '#f1f5f9', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                          {JSON.stringify(func.inputSchema, null, 2)}
                        </pre>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>函数代码:</strong>
                        <pre style={{ background: '#f1f5f9', padding: '10px', borderRadius: '4px', overflow: 'auto', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5' }}>
                          {func.code}
                        </pre>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>元数据:</strong>
                        <pre style={{ background: '#f1f5f9', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                          {JSON.stringify(func.metadata, null, 2)}
                        </pre>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#64748b' }}>
                        <span>创建时间: {new Date(func.createdAt).toLocaleString()}</span>
                        <span>更新时间: {new Date(func.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionManager;