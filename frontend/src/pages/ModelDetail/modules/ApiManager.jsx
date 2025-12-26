import React, { useState, useEffect } from 'react';

const ApiManager = ({ 
  modelId,
  properties,
  showNotification,
  showConfirmDialog
}) => {
  // API接口配置状态
  const [apiEndpoints, setApiEndpoints] = useState([
    { 
      id: 'get', 
      name: '获取数据', 
      method: 'GET', 
      url: `/api/data?modelId=${modelId}`, 
      description: '获取模型的所有数据记录',
      enabled: true 
    },
    { 
      id: 'post', 
      name: '创建数据', 
      method: 'POST', 
      url: `/api/data?modelId=${modelId}`, 
      description: '创建新的数据记录',
      enabled: true 
    },
    { 
      id: 'put', 
      name: '更新数据', 
      method: 'PUT', 
      url: `/api/data/{id}`, 
      description: '更新指定ID的数据记录',
      enabled: true 
    },
    { 
      id: 'delete', 
      name: '删除数据', 
      method: 'DELETE', 
      url: `/api/data/{id}`, 
      description: '删除指定ID的数据记录',
      enabled: true 
    }
  ]);
  
  // 测试历史记录
  const [testHistory, setTestHistory] = useState([]);
  // 当前测试的API
  const [currentTestApi, setCurrentTestApi] = useState(null);
  // 测试参数
  const [testParams, setTestParams] = useState({});
  // 响应结果
  const [responseResult, setResponseResult] = useState(null);
  // 加载状态
  const [loading, setLoading] = useState(false);

  // 初始化测试参数
  useEffect(() => {
    setTestParams({
      get: { modelId: modelId },
      post: { 
        modelId: modelId,
        // 根据模型的属性动态生成默认值
        ...properties.reduce((acc, prop) => {
          acc[prop.name] = '';
          return acc;
        }, {})
      },
      put: { id: '', ...properties.reduce((acc, prop) => {
        acc[prop.name] = '';
        return acc;
      }, {}) },
      delete: { id: '' }
    });
  }, [modelId, properties]);

  // 执行API测试
  const handleTestApi = async (api) => {
    setLoading(true);
    setCurrentTestApi(api);
    setResponseResult(null);

    try {
      let url = api.url;
      let method = api.method;
      let body = null;
      let params = { ...testParams[api.id] };

      // 如果URL中有{id}参数，需要从测试参数中获取
      if (url.includes('{id}')) {
        const id = params.id || '1'; // 默认使用1
        url = url.replace('{id}', id);
        delete params.id; // 从参数中移除id
      }

      // 构建URL参数
      if (method === 'GET' && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
      }

      // 构建请求选项
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // 如果是POST或PUT，添加请求体
      if (method === 'POST' || method === 'PUT') {
        body = { ...params };
        options.body = JSON.stringify(body);
      }

      // 执行API请求
      const response = await fetch(url, options);
      const result = await response.json();

      setResponseResult({
        status: response.status,
        statusText: response.statusText,
        data: result
      });

      // 记录测试历史
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        api: api.name,
        method: api.method,
        url: url,
        status: response.status,
        request: method === 'GET' ? params : body,
        response: result
      };

      setTestHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 保留最近10条记录
      
      showNotification(`API测试成功: ${api.name}`, 'success');
    } catch (error) {
      setResponseResult({
        status: 'error',
        error: error.message
      });
      
      showNotification(`API测试失败: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 更新测试参数
  const updateTestParam = (apiId, paramName, value) => {
    setTestParams(prev => ({
      ...prev,
      [apiId]: {
        ...prev[apiId],
        [paramName]: value
      }
    }));
  };

  // 切换API启用状态
  const toggleApiStatus = (apiId) => {
    setApiEndpoints(prev => prev.map(api => 
      api.id === apiId ? { ...api, enabled: !api.enabled } : api
    ));
  };

  // 重置测试参数
  const resetTestParams = (apiId) => {
    const defaultParams = {
      get: { modelId: modelId },
      post: { 
        modelId: modelId,
        ...properties.reduce((acc, prop) => {
          acc[prop.name] = '';
          return acc;
        }, {})
      },
      put: { id: '', ...properties.reduce((acc, prop) => {
        acc[prop.name] = '';
        return acc;
      }, {}) },
      delete: { id: '' }
    };
    
    setTestParams(prev => ({
      ...prev,
      [apiId]: defaultParams[apiId]
    }));
  };

  return (
    <div className="api-manager">
      <div className="header-toolbar">
        <div>
          <h3>API接口管理</h3>
          <p>管理模型数据的增删改查接口</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '20px' }}>#</th>
              <th>接口名称</th>
              <th>方法</th>
              <th>URL</th>
              <th>描述</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {apiEndpoints.map((api, index) => (
              <tr key={api.id}>
                <td>{index + 1}</td>
                <td>{api.name}</td>
                <td>
                  <span className={`status-badge ${api.method.toLowerCase()}`}>
                    {api.method}
                  </span>
                </td>
                <td><code>{api.url}</code></td>
                <td>{api.description}</td>
                <td>
                  <span className={`status-badge ${api.enabled ? 'active' : 'inactive'}`}>
                    {api.enabled ? '启用' : '禁用'}
                  </span>
                </td>
                <td>
                  <button 
                    className="test" 
                    onClick={() => handleTestApi(api)}
                    disabled={!api.enabled || loading}
                  >
                    {loading && currentTestApi?.id === api.id ? '测试中...' : '测试'}
                  </button>
                  <button 
                    className={api.enabled ? 'toggle inactive' : 'toggle active'} 
                    onClick={() => toggleApiStatus(api.id)}
                  >
                    {api.enabled ? '禁用' : '启用'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* API测试面板 */}
      <div className="header-toolbar" style={{ marginTop: '20px' }}>
        <div>
          <h3>API测试面板</h3>
          <p>输入参数并测试API接口</p>
        </div>
      </div>

      <div className="table-container">
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {apiEndpoints.map(api => (
            <div key={api.id} style={{ flex: 1, minWidth: '300px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '10px', color: '#3b82f6' }}>{api.name}</h4>
              
              {api.id === 'get' && (
                <div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>modelId:</label>
                    <input
                      type="text"
                      value={testParams[api.id]?.modelId || ''}
                      onChange={(e) => updateTestParam(api.id, 'modelId', e.target.value)}
                      disabled={!api.enabled}
                      style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              )}

              {api.id === 'post' && (
                <div>
                  {properties.map(prop => (
                    <div key={prop.id} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>{prop.name}:</label>
                      <input
                        type="text"
                        value={testParams[api.id]?.[prop.name] || ''}
                        onChange={(e) => updateTestParam(api.id, prop.name, e.target.value)}
                        disabled={!api.enabled}
                        style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        placeholder={`输入${prop.name}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {api.id === 'put' && (
                <div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>ID:</label>
                    <input
                      type="text"
                      value={testParams[api.id]?.id || ''}
                      onChange={(e) => updateTestParam(api.id, 'id', e.target.value)}
                      disabled={!api.enabled}
                      style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                      placeholder="输入记录ID"
                    />
                  </div>
                  {properties.map(prop => (
                    <div key={prop.id} style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>{prop.name}:</label>
                      <input
                        type="text"
                        value={testParams[api.id]?.[prop.name] || ''}
                        onChange={(e) => updateTestParam(api.id, prop.name, e.target.value)}
                        disabled={!api.enabled}
                        style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                        placeholder={`输入${prop.name}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {api.id === 'delete' && (
                <div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>ID:</label>
                    <input
                      type="text"
                      value={testParams[api.id]?.id || ''}
                      onChange={(e) => updateTestParam(api.id, 'id', e.target.value)}
                      disabled={!api.enabled}
                      style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                      placeholder="输入记录ID"
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  className="test" 
                  onClick={() => handleTestApi(api)}
                  disabled={!api.enabled || loading}
                >
                  {loading && currentTestApi?.id === api.id ? '测试中...' : '执行测试'}
                </button>
                <button 
                  onClick={() => resetTestParams(api.id)}
                  disabled={!api.enabled}
                >
                  重置参数
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 响应结果面板 */}
      {responseResult && (
        <div className="header-toolbar" style={{ marginTop: '20px' }}>
          <div>
            <h3>响应结果</h3>
            <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              <div><strong>状态码:</strong> {responseResult.status}</div>
              {responseResult.statusText && <div><strong>状态文本:</strong> {responseResult.statusText}</div>}
              {responseResult.error && <div><strong>错误:</strong> {responseResult.error}</div>}
              {responseResult.data && (
                <div>
                  <strong>响应数据:</strong>
                  <pre>{JSON.stringify(responseResult.data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 测试历史记录 */}
      {testHistory.length > 0 && (
        <div className="header-toolbar" style={{ marginTop: '20px' }}>
          <div>
            <h3>测试历史记录</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>接口</th>
                    <th>方法</th>
                    <th>状态码</th>
                    <th>URL</th>
                  </tr>
                </thead>
                <tbody>
                  {testHistory.map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.timestamp).toLocaleString()}</td>
                      <td>{record.api}</td>
                      <td><code>{record.method}</code></td>
                      <td><span className={`status-badge ${record.status === 200 ? 'active' : 'inactive'}`}>
                        {record.status}
                      </span></td>
                      <td><code>{record.url}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiManager;