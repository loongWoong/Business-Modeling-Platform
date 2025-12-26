import React, { useState, useEffect } from 'react';

const ActionManager = ({ 
  modelId,
  properties,
  showNotification,
  showConfirmDialog
}) => {
  // 操作类型列表
  const [actionTypes, setActionTypes] = useState([]);
  // 测试历史记录
  const [testHistory, setTestHistory] = useState([]);
  // 当前测试的操作类型
  const [currentTestApi, setCurrentTestApi] = useState(null);
  // 响应结果
  const [responseResult, setResponseResult] = useState(null);
  // 加载状态
  const [loading, setLoading] = useState(false);

  // 获取操作类型列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取操作类型
        const actionTypesResponse = await fetch(`/api/action-type?targetObjectTypeId=${modelId}`);
        const actionTypesData = await actionTypesResponse.json();
        setActionTypes(actionTypesData);
        
        // 如果没有获取到操作类型，添加演示数据
        if (actionTypesData.length === 0) {
          const demoActionTypes = [
            {
              id: 1,
              name: '发卡',
              description: '创建新的通行卡片',
              targetObjectTypeId: modelId,
              inputSchema: {"type": "object", "properties": {"cardNo": {"type": "string"}, "holderName": {"type": "string"}}},
              outputSchema: {"type": "object", "properties": {"id": {"type": "string"}, "cardNo": {"type": "string"}, "status": {"type": "string"}}},
              requiresApproval: false,
              handlerFunction: "createCard",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 2,
              name: '充值',
              description: '为卡片充值',
              targetObjectTypeId: modelId,
              inputSchema: {"type": "object", "properties": {"id": {"type": "string"}, "amount": {"type": "number"}}},
              outputSchema: {"type": "object", "properties": {"id": {"type": "string"}, "balance": {"type": "number"}}},
              requiresApproval: false,
              handlerFunction: "rechargeCard",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          setActionTypes(demoActionTypes);
        }
      } catch (error) {
        console.error('Failed to fetch action types:', error);
        // 网络请求失败时，添加演示数据
        const demoActionTypes = [
          {
            id: 1,
            name: '发卡',
            description: '创建新的通行卡片',
            targetObjectTypeId: modelId,
            inputSchema: {"type": "object", "properties": {"cardNo": {"type": "string"}, "holderName": {"type": "string"}}},
            outputSchema: {"type": "object", "properties": {"id": {"type": "string"}, "cardNo": {"type": "string"}, "status": {"type": "string"}}},
            requiresApproval: false,
            handlerFunction: "createCard",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: '充值',
            description: '为卡片充值',
            targetObjectTypeId: modelId,
            inputSchema: {"type": "object", "properties": {"id": {"type": "string"}, "amount": {"type": "number"}}},
            outputSchema: {"type": "object", "properties": {"id": {"type": "string"}, "balance": {"type": "number"}}},
            requiresApproval: false,
            handlerFunction: "rechargeCard",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setActionTypes(demoActionTypes);
      }
    };

    fetchData();
  }, [modelId]);

  // 执行操作类型
  const handleExecuteActionType = async (actionType) => {
    setLoading(true);
    setCurrentTestApi(actionType);
    setResponseResult(null);

    try {
      const url = `/api/action-type/${actionType.id}/execute`;
      const method = 'POST';
      
      // 根据操作类型动态生成测试数据
      let body = {};
      if (actionType.inputSchema && actionType.inputSchema.properties) {
        Object.keys(actionType.inputSchema.properties).forEach(key => {
          const propType = actionType.inputSchema.properties[key].type;
          switch(propType) {
            case 'string':
              body[key] = key.includes('Id') || key.includes('id') ? Date.now().toString() : `test_${key}`;
              break;
            case 'number':
              body[key] = Math.floor(Math.random() * 1000);
              break;
            case 'array':
              body[key] = [Date.now().toString(), (Date.now() + 1).toString()];
              break;
            default:
              body[key] = `test_${key}`;
          }
        });
      }

      // 执行API请求
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });
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
        api: actionType.name,
        method: method,
        url: url,
        status: response.status,
        request: body,
        response: result
      };

      setTestHistory(prev => [historyItem, ...prev.slice(0, 9)]); // 保留最近10条记录
      
      showNotification(`操作类型执行成功: ${actionType.name}`, 'success');
    } catch (error) {
      setResponseResult({
        status: 'error',
        error: error.message
      });
      
      showNotification(`操作类型执行失败: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-manager">
      {/* 操作类型管理 */}
      <div className="header-toolbar">
        <div>
          <h3>操作类型管理</h3>
          <p>基于本体论的业务操作定义和执行</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '20px' }}>#</th>
              <th>操作名称</th>
              <th>目标对象类型</th>
              <th>处理函数</th>
              <th>是否需要审批</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {actionTypes.map((actionType, index) => (
              <tr key={actionType.id}>
                <td>{index + 1}</td>
                <td>{actionType.name}</td>
                <td>{actionType.targetObjectTypeId}</td>
                <td>{actionType.handlerFunction}</td>
                <td>
                  <span className={`status-badge ${actionType.requiresApproval ? 'inactive' : 'active'}`}>
                    {actionType.requiresApproval ? '是' : '否'}
                  </span>
                </td>
                <td>{actionType.description}</td>
                <td>
                  <button 
                    className="test" 
                    onClick={() => handleExecuteActionType(actionType)}
                    disabled={loading}
                  >
                    {loading && currentTestApi?.id === actionType.id ? '执行中...' : '执行'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 操作类型详情 */}
      {actionTypes.length > 0 && (
        <div className="header-toolbar" style={{ marginTop: '20px' }}>
          <div>
            <h3>操作类型详情</h3>
            <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
              {actionTypes.map(actionType => (
                <div key={actionType.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                  <h4 style={{ color: '#3b82f6', marginBottom: '10px' }}>{actionType.name}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <strong>输入参数:</strong>
                      <pre style={{ background: '#f1f5f9', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                        {JSON.stringify(actionType.inputSchema, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <strong>输出参数:</strong>
                      <pre style={{ background: '#f1f5f9', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                        {JSON.stringify(actionType.outputSchema, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                    <th>操作</th>
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

export default ActionManager;