import React, { useState, useEffect } from 'react';

const SharedAttributeReference = ({ 
  model,
  sharedAttributes,
  setSharedAttributes,
  selectedSharedAttrs,
  setSelectedSharedAttrs,
  showNotification
}) => {
  const [isSharedAttrModalOpen, setIsSharedAttrModalOpen] = useState(false);
  const [sharedAttrSearchTerm, setSharedAttrSearchTerm] = useState('');

  // 获取所有共享属性
  useEffect(() => {
    fetch(`/api/shared-attribute?domainId=${model.domainId}`)
      .then(response => response.json())
      .then(data => {
        setSharedAttributes(data);
      })
      .catch(error => console.error('Failed to fetch shared attributes:', error));
  }, [model.domainId]);

  // 切换共享属性选择
  const toggleSharedAttrSelection = (id) => {
    if (selectedSharedAttrs.includes(id)) {
      setSelectedSharedAttrs(selectedSharedAttrs.filter(attrId => attrId !== id));
    } else {
      setSelectedSharedAttrs([...selectedSharedAttrs, id]);
    }
  };

  // 全选/取消全选共享属性
  const toggleSelectAllSharedAttrs = () => {
    if (selectedSharedAttrs.length === sharedAttributes.length) {
      setSelectedSharedAttrs([]);
    } else {
      setSelectedSharedAttrs(sharedAttributes.map(attr => attr.id));
    }
  };

  // 处理引用共享属性
  const handleReferenceSharedAttrs = () => {
    // 这里应该调用API将选中的共享属性引用到当前模型
    console.log('引用共享属性:', selectedSharedAttrs);
    showNotification(`成功引用 ${selectedSharedAttrs.length} 个共享属性`);
    setIsSharedAttrModalOpen(false);
    setSelectedSharedAttrs([]);
  };

  // 过滤共享属性
  const filteredSharedAttributes = sharedAttributes.filter(attr =>
    attr.name.toLowerCase().includes(sharedAttrSearchTerm.toLowerCase()) ||
    attr.description.toLowerCase().includes(sharedAttrSearchTerm.toLowerCase())
  );

  return (
    <div className="shared-attribute-reference">
      <div className="header-toolbar">
        <div>
          <button 
            className={selectedSharedAttrs.length > 0 ? 'active' : ''}
            onClick={toggleSelectAllSharedAttrs}
          >
            {selectedSharedAttrs.length === sharedAttributes.length && sharedAttributes.length > 0 ? '取消全选' : '全选'}
          </button>
          <button onClick={() => setIsSharedAttrModalOpen(true)}>
            引用共享属性
          </button>
          <button 
            disabled={selectedSharedAttrs.length === 0}
            onClick={() => console.log('批量取消引用:', selectedSharedAttrs)}
          >
            批量取消引用
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="搜索共享属性..."
            value={sharedAttrSearchTerm}
            onChange={(e) => setSharedAttrSearchTerm(e.target.value)}
          />
          <button onClick={() => console.log('导出共享属性')}>导出</button>
          <button onClick={() => console.log('导入共享属性')}>导入</button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedSharedAttrs.length === sharedAttributes.length && sharedAttributes.length > 0}
                  onChange={toggleSelectAllSharedAttrs}
                />
              </th>
              <th>名称</th>
              <th>类型</th>
              <th>长度</th>
              <th>精度</th>
              <th>描述</th>
              <th>引用次数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredSharedAttributes.map(attr => (
              <tr key={attr.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSharedAttrs.includes(attr.id)}
                    onChange={() => toggleSharedAttrSelection(attr.id)}
                  />
                </td>
                <td>{attr.name}</td>
                <td>{attr.type}</td>
                <td>{attr.length || '-'}</td>
                <td>{attr.precision || '-'}</td>
                <td>{attr.description}</td>
                <td>{attr.referenceCount}</td>
                <td>
                  <button 
                    className={selectedSharedAttrs.includes(attr.id) ? 'delete' : 'edit'}
                    onClick={() => {
                      if (selectedSharedAttrs.includes(attr.id)) {
                        // 取消引用
                        setSelectedSharedAttrs(selectedSharedAttrs.filter(id => id !== attr.id));
                      } else {
                        // 引用
                        setSelectedSharedAttrs([...selectedSharedAttrs, attr.id]);
                      }
                    }}
                  >
                    {selectedSharedAttrs.includes(attr.id) ? '取消引用' : '引用'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 引用共享属性模态框 */}
      {isSharedAttrModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ width: '800px', maxWidth: '90%' }}>
            <h2>引用共享属性</h2>
            <div className="header-toolbar" style={{ padding: '12px 0', margin: '16px 0' }}>
              <input
                type="text"
                placeholder="搜索共享属性..."
                value={sharedAttrSearchTerm}
                onChange={(e) => setSharedAttrSearchTerm(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedSharedAttrs.length === filteredSharedAttributes.length && filteredSharedAttributes.length > 0}
                        onChange={toggleSelectAllSharedAttrs}
                      />
                    </th>
                    <th>名称</th>
                    <th>类型</th>
                    <th>长度</th>
                    <th>精度</th>
                    <th>描述</th>
                    <th>引用次数</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSharedAttributes.map(attr => (
                    <tr key={attr.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedSharedAttrs.includes(attr.id)}
                          onChange={() => toggleSharedAttrSelection(attr.id)}
                        />
                      </td>
                      <td>{attr.name}</td>
                      <td>{attr.type}</td>
                      <td>{attr.length || '-'}</td>
                      <td>{attr.precision || '-'}</td>
                      <td>{attr.description}</td>
                      <td>{attr.referenceCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="form-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                已选择 {selectedSharedAttrs.length} 个属性
              </div>
              <div>
                <button className="cancel" onClick={() => setIsSharedAttrModalOpen(false)}>取消</button>
                <button className="submit" onClick={handleReferenceSharedAttrs}>确认引用</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedAttributeReference;