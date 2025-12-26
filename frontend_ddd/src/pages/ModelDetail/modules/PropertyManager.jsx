/**
 * Property管理器 - 适配DDD API
 * 通过Model聚合根操作Property
 */
import React, { useState } from 'react';
import { modelAPI } from '../../../services/api';

const PropertyManager = ({ 
  model, 
  properties, 
  setProperties,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyData, setPropertyData] = useState({
    name: '',
    code: '',
    type: 'string',
    required: false,
    description: '',
    isPrimaryKey: false,
    isForeignKey: false,
    defaultValue: null,
    constraints: [],
    sensitivityLevel: null,
    maskRule: null,
  });

  // 处理创建Property
  const handleCreateProperty = async () => {
    try {
      // 新API：通过Model聚合根添加Property
      const newProperty = await modelAPI.addProperty(model.id, propertyData);
      
      setProperties([...properties, newProperty]);
      setIsModalOpen(false);
      resetForm();
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to create property:', error);
      alert('属性创建失败: ' + error.message);
    }
  };

  // 处理删除Property
  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('确定要删除这个属性吗？')) {
      return;
    }

    try {
      // 新API：通过Model聚合根删除Property
      await modelAPI.removeProperty(model.id, propertyId);
      
      setProperties(properties.filter(p => p.id !== propertyId));
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('属性删除失败: ' + error.message);
    }
  };

  // 处理编辑Property
  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setPropertyData({
      name: property.name,
      code: property.code,
      type: property.type,
      required: property.required,
      description: property.description || '',
      isPrimaryKey: property.isPrimaryKey || false,
      isForeignKey: property.isForeignKey || false,
      defaultValue: property.defaultValue,
      constraints: property.constraints || [],
      sensitivityLevel: property.sensitivityLevel,
      maskRule: property.maskRule,
    });
    setIsModalOpen(true);
  };

  // 处理更新Property（注意：新API可能不支持直接更新，需要删除后重新创建）
  const handleUpdateProperty = async () => {
    try {
      // 先删除旧属性
      await modelAPI.removeProperty(model.id, editingProperty.id);
      
      // 再创建新属性
      const updatedProperty = await modelAPI.addProperty(model.id, propertyData);
      
      setProperties(properties.map(p => 
        p.id === editingProperty.id ? updatedProperty : p
      ));
      setIsModalOpen(false);
      resetForm();
      
      // 刷新完整数据
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Failed to update property:', error);
      alert('属性更新失败: ' + error.message);
    }
  };

  const resetForm = () => {
    setEditingProperty(null);
    setPropertyData({
      name: '',
      code: '',
      type: 'string',
      required: false,
      description: '',
      isPrimaryKey: false,
      isForeignKey: false,
      defaultValue: null,
      constraints: [],
      sensitivityLevel: null,
      maskRule: null,
    });
  };

  return (
    <div className="property-manager">
      <div className="header">
        <h2>属性管理</h2>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }}>
          添加属性
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>Code</th>
            <th>类型</th>
            <th>必填</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(property => (
            <tr key={property.id}>
              <td>{property.name}</td>
              <td>{property.code}</td>
              <td>{property.type}</td>
              <td>{property.required ? '是' : '否'}</td>
              <td>
                <button onClick={() => handleEditProperty(property)}>编辑</button>
                <button onClick={() => handleDeleteProperty(property.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingProperty ? '编辑属性' : '添加属性'}</h3>
            
            <div className="form-group">
              <label>名称:</label>
              <input
                type="text"
                value={propertyData.name}
                onChange={(e) => setPropertyData({ ...propertyData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Code:</label>
              <input
                type="text"
                value={propertyData.code}
                onChange={(e) => setPropertyData({ ...propertyData, code: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>类型:</label>
              <select
                value={propertyData.type}
                onChange={(e) => setPropertyData({ ...propertyData, type: e.target.value })}
              >
                <option value="string">String</option>
                <option value="integer">Integer</option>
                <option value="float">Float</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={propertyData.required}
                  onChange={(e) => setPropertyData({ ...propertyData, required: e.target.checked })}
                />
                必填
              </label>
            </div>

            <div className="form-actions">
              <button onClick={editingProperty ? handleUpdateProperty : handleCreateProperty}>
                {editingProperty ? '更新' : '创建'}
              </button>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManager;

