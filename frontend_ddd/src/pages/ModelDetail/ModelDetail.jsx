/**
 * Model详情页面 - 适配DDD API
 * 使用新的API结构：一次调用获取model、properties和relations
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { modelAPI, domainAPI } from '../../services/api';
import PropertyManager from './modules/PropertyManager';
import RelationManager from './modules/RelationManager';

const ModelDetail = () => {
  const { modelId } = useParams();
  const [model, setModel] = useState(null);
  const [properties, setProperties] = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载Model详情（包含properties和relations）
  useEffect(() => {
    const loadModelDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // 新API：一次调用获取所有数据
        const data = await modelAPI.getById(modelId);
        
        setModel(data.model);
        setProperties(data.properties || []);
        setRelations(data.relations || []);

        // 如果需要domain信息，单独获取
        if (data.model.domainId) {
          try {
            const domain = await domainAPI.getById(data.model.domainId);
            setModel(prev => ({ ...prev, domainName: domain.name }));
          } catch (err) {
            console.warn('Failed to load domain:', err);
          }
        }
      } catch (err) {
        console.error('Failed to load model detail:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (modelId) {
      loadModelDetail();
    }
  }, [modelId]);

  // 刷新数据
  const refreshModelDetail = async () => {
    try {
      const data = await modelAPI.getById(modelId);
      setModel(data.model);
      setProperties(data.properties || []);
      setRelations(data.relations || []);
    } catch (err) {
      console.error('Failed to refresh model detail:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  if (!model) {
    return <div>Model未找到</div>;
  }

  return (
    <div className="model-detail">
      <div className="model-header">
        <h1>{model.name}</h1>
        <p>Code: {model.code}</p>
        <p>描述: {model.description}</p>
        {model.domainName && <p>域: {model.domainName}</p>}
      </div>

      <div className="model-content">
        <PropertyManager
          model={model}
          properties={properties}
          setProperties={setProperties}
          onRefresh={refreshModelDetail}
        />

        <RelationManager
          model={model}
          relations={relations}
          setRelations={setRelations}
          onRefresh={refreshModelDetail}
        />
      </div>
    </div>
  );
};

export default ModelDetail;

