/**
 * API服务层
 * 统一处理与后端DDD API的交互
 */

// 在开发环境中使用相对路径（通过Vite代理），生产环境使用完整URL
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://localhost:5000'  // 生产环境使用完整URL
  : '';  // 开发环境使用相对路径，通过Vite代理

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

  // 如果 body 是字符串，直接使用；否则转换为 JSON
  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    
    // 处理空响应（如 204 No Content）
    if (response.status === 204) {
      return null;
    }
    
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText || `HTTP error! status: ${response.status}` };
        }
      } else {
        const text = await response.text();
        errorData = { error: text || response.statusText || `HTTP error! status: ${response.status}` };
      }
      
      // 提供更友好的错误信息
      let errorMessage = errorData.error || errorData.message;
      if (response.status === 405) {
        errorMessage = '请求方法不允许，请检查API路由配置';
      } else if (response.status === 404) {
        errorMessage = errorMessage || '资源未找到';
      } else if (response.status === 400) {
        errorMessage = errorMessage || '请求参数错误';
      } else if (response.status === 500) {
        errorMessage = errorMessage || '服务器内部错误';
      }
      
      throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
      return null;
    }
    
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    // 如果是网络错误，提供更友好的错误信息
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查后端服务是否运行在 http://localhost:5000');
    }
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

  // 删除Datasource
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

