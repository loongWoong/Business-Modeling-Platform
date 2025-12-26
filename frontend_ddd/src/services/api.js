/**
 * API服务层
 * 统一处理与后端DDD API的交互
 */

const API_BASE_URL = 'http://localhost:5000';

/**
 * 通用fetch封装
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Domain API
 */
export const domainAPI = {
  // 获取所有Domain
  getAll: () => apiRequest('/api/domain'),

  // 根据ID获取Domain
  getById: (id) => apiRequest(`/api/domain/${id}`),

  // 创建Domain
  create: (data) => apiRequest('/api/domain', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新Domain
  update: (id, data) => apiRequest(`/api/domain/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除Domain
  delete: (id) => apiRequest(`/api/domain/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Model API
 */
export const modelAPI = {
  // 获取所有Model（可选domainId过滤）
  getAll: (domainId) => {
    const endpoint = domainId 
      ? `/api/model?domainId=${domainId}`
      : '/api/model';
    return apiRequest(endpoint);
  },

  // 根据ID获取Model详情（包含properties和relations）
  getById: async (id) => {
    const data = await apiRequest(`/api/model/${id}`);
    // 新API返回 {model: {}, properties: [], relations: []}
    return {
      model: data.model,
      properties: data.properties || [],
      relations: data.relations || [],
    };
  },

  // 创建Model
  create: (data) => apiRequest('/api/model', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新Model
  update: (id, data) => apiRequest(`/api/model/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除Model
  delete: (id) => apiRequest(`/api/model/${id}`, {
    method: 'DELETE',
  }),

  // 添加Property到Model（通过聚合根）
  addProperty: (modelId, propertyData) => apiRequest(`/api/model/${modelId}/properties`, {
    method: 'POST',
    body: JSON.stringify(propertyData),
  }),

  // 从Model删除Property
  removeProperty: (modelId, propertyId) => apiRequest(`/api/model/${modelId}/properties/${propertyId}`, {
    method: 'DELETE',
  }),

  // 添加Relation（通过聚合根）
  addRelation: (relationData) => apiRequest('/api/model/relations', {
    method: 'POST',
    body: JSON.stringify(relationData),
  }),

  // 删除Relation
  removeRelation: (relationId) => apiRequest(`/api/model/relations/${relationId}`, {
    method: 'DELETE',
  }),
};

/**
 * Datasource API
 */
export const datasourceAPI = {
  // 获取所有Datasource（可选domainId过滤）
  getAll: (domainId) => {
    const endpoint = domainId 
      ? `/api/datasource?domainId=${domainId}`
      : '/api/datasource';
    return apiRequest(endpoint);
  },

  // 根据ID获取Datasource详情（包含mappings和associations）
  getById: async (id) => {
    const data = await apiRequest(`/api/datasource/${id}`);
    // 新API返回 {datasource: {}, mappings: [], associations: []}
    return {
      datasource: data.datasource,
      mappings: data.mappings || [],
      associations: data.associations || [],
    };
  },

  // 创建Datasource
  create: (data) => apiRequest('/api/datasource', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新Datasource
  update: (id, data) => apiRequest(`/api/datasource/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 更新Datasource
  update: (id, data) => apiRequest(`/api/datasource/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除Datasource（注意：后端可能没有此端点，需要检查）
  delete: (id) => apiRequest(`/api/datasource/${id}`, {
    method: 'DELETE',
  }),

  // 切换Datasource状态
  toggleStatus: (id) => apiRequest(`/api/datasource/${id}/toggle-status`, {
    method: 'POST',
  }),

  // 添加Mapping到Datasource
  addMapping: (datasourceId, mappingData) => apiRequest(`/api/datasource/${datasourceId}/mappings`, {
    method: 'POST',
    body: JSON.stringify(mappingData),
  }),

  // 添加ModelTableAssociation到Datasource
  addAssociation: (datasourceId, associationData) => apiRequest(`/api/datasource/${datasourceId}/associations`, {
    method: 'POST',
    body: JSON.stringify(associationData),
  }),
};

/**
 * ETL API
 */
export const etlAPI = {
  // 获取所有ETLTask
  getAllTasks: () => apiRequest('/api/etl/tasks'),

  // 根据ID获取ETLTask详情（包含logs）
  getTaskById: async (id) => {
    const data = await apiRequest(`/api/etl/tasks/${id}`);
    // 新API返回 {task: {}, logs: []}
    return {
      task: data.task,
      logs: data.logs || [],
    };
  },

  // 创建ETLTask
  createTask: (data) => apiRequest('/api/etl/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 激活ETLTask
  activateTask: (id) => apiRequest(`/api/etl/tasks/${id}/activate`, {
    method: 'POST',
  }),

  // 暂停ETLTask
  pauseTask: (id) => apiRequest(`/api/etl/tasks/${id}/pause`, {
    method: 'POST',
  }),

  // 启动ETLTask执行
  startTask: (id) => apiRequest(`/api/etl/tasks/${id}/start`, {
    method: 'POST',
  }),

  // 完成ETLTask执行
  completeTask: (id) => apiRequest(`/api/etl/tasks/${id}/complete`, {
    method: 'POST',
  }),

  // 添加ETLLog到ETLTask
  addLog: (taskId, logData) => apiRequest(`/api/etl/tasks/${taskId}/logs`, {
    method: 'POST',
    body: JSON.stringify(logData),
  }),
};

/**
 * 健康检查
 */
export const healthAPI = {
  check: () => apiRequest('/health'),
};

export default {
  domain: domainAPI,
  model: modelAPI,
  datasource: datasourceAPI,
  etl: etlAPI,
  health: healthAPI,
};

