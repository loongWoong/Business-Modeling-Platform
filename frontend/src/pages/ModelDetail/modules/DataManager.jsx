import React, { useState } from 'react';

const DataManager = ({ 
  dataRecords, 
  setDataRecords, 
  showNotification,
  showConfirmDialog,
  isDataModalOpen, 
  setIsDataModalOpen, 
  editingData, 
  setEditingData, 
  newData, 
  setNewData,
  properties
}) => {
  // 处理创建数据记录
  const handleCreateData = () => {
    const dataWithId = {
      ...newData,
      id: dataRecords.length + 1
    };
    
    // 获取modelId，从当前URL路径中提取
    const modelId = window.location.pathname.split('/').pop();
    
    fetch(`/api/data?modelId=${modelId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataWithId)
    })
      .then(response => response.json())
      .then(data => {
        setDataRecords([...dataRecords, data]);
        setIsDataModalOpen(false);
        setEditingData(null);
        setNewData({});
        showNotification('数据记录创建成功');
      })
      .catch(error => {
        console.error('Failed to create data:', error);
        showNotification('数据记录创建失败', 'error');
      });
  };

  // 处理编辑数据记录
  const handleEditData = (data) => {
    setEditingData(data);
    setNewData(data);
    setIsDataModalOpen(true);
  };

  // 处理更新数据记录
  const handleUpdateData = () => {
    fetch(`/api/data/${editingData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    })
      .then(response => response.json())
      .then(updatedData => {
        setDataRecords(dataRecords.map(record => record.id === updatedData.id ? updatedData : record));
        setIsDataModalOpen(false);
        setEditingData(null);
        setNewData({});
        showNotification('数据记录更新成功');
      })
      .catch(error => {
        console.error('Failed to update data:', error);
        showNotification('数据记录更新失败', 'error');
      });
  };

  // 保存数据记录（创建或更新）
  const handleSaveData = () => {
    if (editingData) {
      handleUpdateData();
    } else {
      handleCreateData();
    }
  };

  // 处理删除数据记录
  const handleDeleteData = (id) => {
    showConfirmDialog(
      '删除确认',
      '确定要删除该数据记录吗？删除后无法恢复。',
      () => {
        fetch(`/api/data/${id}`, { method: 'DELETE' })
          .then(() => {
            setDataRecords(dataRecords.filter(record => record.id !== id));
            showNotification('数据记录删除成功');
          })
          .catch(error => {
            console.error('Failed to delete data:', error);
            showNotification('数据记录删除失败', 'error');
          });
      }
    );
  };

  // 添加调试信息
  console.log('DataManager props:', {
    properties: properties,
    dataRecords: dataRecords,
    propertiesLength: properties.length,
    dataRecordsLength: dataRecords.length
  });

  // 调试properties和dataRecords的结构
      if (properties.length > 0) {
        console.log('Properties:', properties);
        console.log('First property structure:', properties[0]);
      }
      if (dataRecords.length > 0) {
        console.log('Data records:', dataRecords);
        console.log('First data record structure:', dataRecords[0]);
        // 检查每个数据记录是否包含每个属性的code
        if (properties.length > 0) {
          properties.forEach((prop, index) => {
            const propCode = prop.code || prop.name;
            const hasCol = propCode in dataRecords[0];
            const value = dataRecords[0][propCode];
            console.log(`Property ${index + 1} (${prop.name}): code='${propCode}', hasCol=${hasCol}, value=${value}`);
          });
        }
      } else {
        console.log('No data records found');
      }

  return (
    <div className="data-manager">
      <div className="header-toolbar">
        <div>
          <button 
            onClick={() => {
              setEditingData(null);
              setNewData({});
              setIsDataModalOpen(true);
            }}
          >
            新建数据记录
          </button>
        </div>
        <div>
          <input
            type="text"
            placeholder="搜索数据..."
            onChange={(e) => console.log('搜索数据:', e.target.value)}
          />
          <button onClick={() => console.log('导出数据')}>导出</button>
          <button onClick={() => console.log('导入数据')}>导入</button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {properties.map(prop => (
                <th key={prop.id}>{prop.name}</th>
              ))}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {dataRecords.length === 0 ? (
              <tr>
                <td colSpan={properties.length + 1} style={{ textAlign: 'center', padding: '20px' }}>
                  暂无数据
                </td>
              </tr>
            ) : (
              dataRecords.map(record => (
                <tr key={record.id}>
                  {properties.map(prop => {
                    // 使用属性的code来访问数据记录中的字段
                    const propCode = prop.code || prop.name;
                    return (
                      <td key={`${record.id}-${prop.id}`}>
                        {record[propCode] !== undefined ? record[propCode].toString() : '-'}
                      </td>
                    );
                  })}
                  <td>
                    <button className="edit" onClick={() => handleEditData(record)}>编辑</button>
                    <button className="delete" onClick={() => handleDeleteData(record.id)}>删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

