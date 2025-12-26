/**
 * Domain工作台 - 适配DDD API
 * 展示Domain下的Models和Datasources
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { domainAPI, modelAPI, datasourceAPI } from '../../services/api';
import ModelManager from './modules/ModelManager';
import DatasourceManager from './modules/DatasourceManager';

const DomainWorkbench = () => {
  const { domainId } = useParams();
  const [domain, setDomain] = useState(null);
  const [models, setModels] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 加载Domain信息
        if (domainId) {
          const domainData = await domainAPI.getById(domainId);
          setDomain(domainData);
        }

        // 加载Models（使用domainId过滤）
        const modelsData = await modelAPI.getAll(domainId);
        // 新API返回 {models: [], edges: []}
        const modelsList = modelsData.models || modelsData;
        setModels(Array.isArray(modelsList) ? modelsList : []);

        // 加载Datasources（使用domainId过滤）
        const datasourcesData = await datasourceAPI.getAll(domainId);
        setDatasources(Array.isArray(datasourcesData) ? datasourcesData : []);

      } catch (err) {
        console.error('Failed to load domain data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (domainId) {
      loadData();
    }
  }, [domainId]);

  const refreshData = async () => {
    try {
      const modelsData = await modelAPI.getAll(domainId);
      const modelsList = modelsData.models || modelsData;
      setModels(Array.isArray(modelsList) ? modelsList : []);

      const datasourcesData = await datasourceAPI.getAll(domainId);
      setDatasources(Array.isArray(datasourcesData) ? datasourcesData : []);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  return (
    <div className="domain-workbench">
      <div className="domain-header">
        <h1>{domain?.name || `Domain ${domainId}`}</h1>
        {domain?.description && <p>{domain.description}</p>}
      </div>

      <div className="workbench-content">
        <ModelManager
          models={models}
          onRefresh={refreshData}
          domainId={domainId}
        />

        <DatasourceManager
          datasources={datasources}
          onRefresh={refreshData}
          domainId={domainId}
        />
      </div>
    </div>
  );
};

export default DomainWorkbench;

