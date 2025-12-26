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
      const contentType = response.headers.get('content-type') || '';
      const status = response.status;
      
      // 对于404错误，先检查content-type，如果是HTML响应（说明端点不存在）
      if (status === 404 && contentType.includes('text/html')) {
        const error = new Error('API endpoint not found');
        error.status = 404;
        error.isEndpointMissing = true;
        throw error;
      }
      
      // 读取错误响应数据
      let errorData;
      let responseText = '';
      
      if (contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: response.statusText || `HTTP error! status: ${status}` };
        }
      } else {
        try {
          responseText = await response.text();
          // 如果是HTML响应（404页面），标记为端点缺失
          if (status === 404 && (responseText.includes('<!doctype') || responseText.includes('<html') || responseText.includes('Not Found'))) {
            const error = new Error('API endpoint not found');
            error.status = 404;
            error.isEndpointMissing = true;
            throw error;
          }
          errorData = { error: responseText || response.statusText || `HTTP error! status: ${status}` };
        } catch (textError) {
          // 如果已经是我们抛出的端点缺失错误，直接重新抛出
          if (textError.isEndpointMissing) {
            throw textError;
          }
          errorData = { error: response.statusText || `HTTP error! status: ${status}` };
        }
      }
      
      // 提供更友好的错误信息
      let errorMessage = errorData.error || errorData.message;
      if (status === 405) {
        errorMessage = '请求方法不允许，请检查API路由配置';
      } else if (status === 404) {
        errorMessage = errorMessage || '资源未找到';
      } else if (status === 400) {
        errorMessage = errorMessage || '请求参数错误';
      } else if (status === 500) {
        errorMessage = errorMessage || '服务器内部错误';
      }
      
      const error = new Error(errorMessage || `HTTP error! status: ${status}`);
      error.status = status;
      throw error;
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
    // 如果是端点缺失错误（404且HTML响应），直接抛出，不记录为错误
    if (error.isEndpointMissing || (error.status === 404 && error.message.includes('endpoint not found'))) {
      throw error;
    }
    
    // 对于其他错误，记录日志（但404错误如果是端点缺失，已经在上面处理了）
    // 只有非端点缺失的404或其他错误才记录
    if (!(error.status === 404 && error.isEndpointMissing)) {
      console.error(`API request failed: ${endpoint}`, error);
    }
    
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
  // 获取所有Domain（返回数组）
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
    // 兼容旧API格式
    if (data.model) {
      return {
        model: data.model,
        properties: data.properties || [],
        relations: data.relations || [],
      };
    }
    // 如果返回的是模型对象本身，需要单独获取properties和relations
    return {
      model: data,
      properties: [],
      relations: [],
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
 * Property API (兼容旧API，推荐使用modelAPI)
 */
export const propertyAPI = {
  // 获取所有Property（可选modelId过滤）
  getAll: (modelId) => {
    const endpoint = modelId 
      ? `/api/property?modelId=${modelId}`
      : '/api/property';
    return apiRequest(endpoint);
  },

  // 创建Property（兼容旧API）
  create: (data) => apiRequest('/api/property', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新Property
  update: (id, data) => apiRequest(`/api/property/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除Property
  delete: (id) => apiRequest(`/api/property/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Relation API (兼容旧API，推荐使用modelAPI)
 */
export const relationAPI = {
  // 获取所有Relation（可选domainId或modelId过滤）
  getAll: (params) => {
    const queryParams = new URLSearchParams();
    if (params?.domainId) queryParams.append('domainId', params.domainId);
    if (params?.modelId) queryParams.append('modelId', params.modelId);
    const query = queryParams.toString();
    const endpoint = query ? `/api/relation?${query}` : '/api/relation';
    return apiRequest(endpoint);
  },

  // 创建Relation（兼容旧API）
  create: (data) => apiRequest('/api/relation', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新Relation
  update: (id, data) => apiRequest(`/api/relation/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除Relation
  delete: (id) => apiRequest(`/api/relation/${id}`, {
    method: 'DELETE',
  }),

  // 切换Relation状态
  toggle: (id) => apiRequest(`/api/relation/${id}/toggle`, {
    method: 'PUT',
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
    if (data.datasource) {
      return {
        datasource: data.datasource,
        mappings: data.mappings || [],
        associations: data.associations || [],
      };
    }
    // 兼容旧API格式
    return {
      datasource: data,
      mappings: [],
      associations: [],
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

  // 切换Datasource状态（新API）
  toggleStatus: (id) => apiRequest(`/api/datasource/${id}/toggle-status`, {
    method: 'POST',
  }),

  // 切换Datasource状态（兼容旧API）
  toggle: (id) => apiRequest(`/api/datasource/${id}/toggle`, {
    method: 'PUT',
  }),

  // 测试Datasource连接
  testConnection: (id) => apiRequest(`/api/datasource/${id}/test`, {
    method: 'POST',
  }),

  // 获取Datasource的表列表
  getTables: (id) => apiRequest(`/api/datasource/${id}/tables`),

  // 获取表数据
  getTableData: (id, tableName) => apiRequest(`/api/datasource/${id}/tables/${tableName}/data`),

  // 绑定为全局目标数据源
  bind: (id) => apiRequest(`/api/datasource/${id}/bind`, {
    method: 'PUT',
  }),

  // 解绑全局目标数据源
  unbind: (id) => apiRequest(`/api/datasource/${id}/unbind`, {
    method: 'PUT',
  }),

  // 获取全局目标数据源ID配置
  getGlobalTargetId: () => apiRequest('/api/datasource/config/global_target_datasource_id'),

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
 * Shared Attribute API
 */
export const sharedAttributeAPI = {
  // 获取所有共享属性（可选domainId过滤）
  getAll: (domainId) => {
    const endpoint = domainId 
      ? `/api/shared-attribute?domainId=${domainId}`
      : '/api/shared-attribute';
    return apiRequest(endpoint);
  },

  // 创建共享属性
  create: (data) => apiRequest('/api/shared-attribute', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新共享属性
  update: (id, data) => apiRequest(`/api/shared-attribute/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除共享属性
  delete: (id) => apiRequest(`/api/shared-attribute/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Indicator API
 */
export const indicatorAPI = {
  // 获取所有指标（可选domainId过滤）
  getAll: (domainId) => {
    const endpoint = domainId 
      ? `/api/indicator?domainId=${domainId}`
      : '/api/indicator';
    return apiRequest(endpoint);
  },

  // 根据modelId获取绑定的指标
  getByModelId: (modelId) => apiRequest(`/api/indicator/model/${modelId}`),

  // 创建指标
  create: (data) => apiRequest('/api/indicator', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新指标
  update: (id, data) => apiRequest(`/api/indicator/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除指标
  delete: (id) => apiRequest(`/api/indicator/${id}`, {
    method: 'DELETE',
  }),

  // 发布指标
  publish: (id) => apiRequest(`/api/indicator/${id}/publish`, {
    method: 'PUT',
  }),

  // 下线指标
  offline: (id) => apiRequest(`/api/indicator/${id}/offline`, {
    method: 'PUT',
  }),
};

/**
 * Data API
 */
export const dataAPI = {
  // 获取数据记录（可选modelId过滤）
  getAll: (modelId) => {
    const endpoint = modelId 
      ? `/api/data?modelId=${modelId}`
      : '/api/data';
    return apiRequest(endpoint);
  },

  // 创建数据记录
  create: (data) => apiRequest('/api/data', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新数据记录
  update: (id, data) => apiRequest(`/api/data/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除数据记录
  delete: (id) => apiRequest(`/api/data/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Function API
 */
export const functionAPI = {
  // 获取所有函数
  getAll: () => apiRequest('/api/function'),

  // 创建函数
  create: (data) => apiRequest('/api/function', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新函数
  update: (id, data) => apiRequest(`/api/function/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除函数
  delete: (id) => apiRequest(`/api/function/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Model Table Association API
 */
export const modelTableAssociationAPI = {
  // 获取所有关联（可选modelId过滤）
  getAll: (modelId) => {
    const endpoint = modelId 
      ? `/api/model-table-associations?modelId=${modelId}`
      : '/api/model-table-associations';
    return apiRequest(endpoint);
  },

  // 创建关联
  create: (data) => apiRequest('/api/model-table-associations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // 更新关联
  update: (id, data) => apiRequest(`/api/model-table-associations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // 删除关联
  delete: (id) => apiRequest(`/api/model-table-associations/${id}`, {
    method: 'DELETE',
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
    if (data.task) {
      return {
        task: data.task,
        logs: data.logs || [],
      };
    }
    // 兼容旧API格式
    return {
      task: data,
      logs: [],
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

  // 获取ETL日志（兼容旧API）
  getLogs: () => apiRequest('/api/etl/logs'),
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
  property: propertyAPI,
  relation: relationAPI,
  datasource: datasourceAPI,
  sharedAttribute: sharedAttributeAPI,
  indicator: indicatorAPI,
  data: dataAPI,
  function: functionAPI,
  modelTableAssociation: modelTableAssociationAPI,
  etl: etlAPI,
  health: healthAPI,
};

