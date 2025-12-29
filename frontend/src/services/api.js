/**
 * API服务层
 * 统一处理与后端Meta元模型API的交互
 * 
 * 元模型结构：
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      分类维度 (Domain)                       │
 * │  ┌─────────────────────────────────────────────────────┐   │
 * │  │              聚合边界 (Aggregate Boundary)           │   │
 * │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
 * │  │  │   Model     │  │ Datasource  │  │    ETL      │  │   │
 * │  │  │  Aggregate  │  │  Aggregate  │  │  Aggregate  │  │   │
 * │  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
 * │  └─────────────────────────────────────────────────────┘   │
 * │                      跨聚合关系                             │
 * │  ┌──────────────────┐  ┌──────────────────┐               │
 * │  │     Relation     │  │     Mapping      │               │
 * │  │  (Model↔Model)   │  │  (Datasource↔   │               │
 * │  │                  │  │   Model↔Property)│               │
 * │  └──────────────────┘  └──────────────────┘               │
 * └─────────────────────────────────────────────────────────────┘
 */

// 开发环境：使用相对路径（空字符串），让Vite代理处理
// 生产环境：使用完整后端URL
// 如果开发环境下通过IP访问，相对路径会被代理正确处理
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://127.0.0.1:5000'
  : ''; // 开发环境使用空字符串，浏览器会使用当前页面的origin（包括IP地址）

async function apiRequest(endpoint, options = {}) {
  // 构建完整的URL
  // 开发环境：使用相对路径，让浏览器基于当前页面的origin（包括IP地址）构建完整URL
  // 生产环境：使用配置的完整URL
  let url;
  if (import.meta.env.PROD) {
    url = `${API_BASE_URL}${endpoint}`;
  } else {
    // 开发环境：使用相对路径（以/开头）
    // 浏览器会自动使用当前页面的 origin（无论是 localhost 还是 IP 地址）
    // Vite 代理会拦截这些请求并转发到后端
    // 确保 endpoint 以 / 开头
    url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json;charset=UTF-8',
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

  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body);
  }

  try {
    // 开发环境下，输出请求URL用于调试
    if (!import.meta.env.PROD) {
      console.log(`[API Request] ${options.method || 'GET'} ${url}`);
    }
    const response = await fetch(url, config);
    
    if (response.status === 204) {
      return null;
    }
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const status = response.status;
      
      if (status === 404 && contentType.includes('text/html')) {
        const error = new Error('API endpoint not found');
        error.status = 404;
        error.isEndpointMissing = true;
        throw error;
      }
      
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
          if (status === 404 && (responseText.includes('<!doctype') || responseText.includes('<html') || responseText.includes('Not Found'))) {
            const error = new Error('API endpoint not found');
            error.status = 404;
            error.isEndpointMissing = true;
            throw error;
          }
          errorData = { error: responseText || response.statusText || `HTTP error! status: ${status}` };
        } catch (textError) {
          if (textError.isEndpointMissing) {
            throw textError;
          }
          errorData = { error: response.statusText || `HTTP error! status: ${status}` };
        }
      }
      
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

    // 确保使用UTF-8编码解析响应
    // 使用arrayBuffer和TextDecoder确保正确解析UTF-8编码的中文
    const contentType = response.headers.get('content-type') || '';
    let text;
    
    if (contentType.includes('application/json')) {
      // 对于JSON响应，使用arrayBuffer确保UTF-8正确解析
      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder('UTF-8');
      text = decoder.decode(buffer);
    } else {
      // 对于其他类型，使用text()方法
      text = await response.text();
    }
    
    if (!text) {
      return null;
    }
    
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    if (error.isEndpointMissing || (error.status === 404 && error.message.includes('endpoint not found'))) {
      throw error;
    }
    
    if (!(error.status === 404 && error.isEndpointMissing)) {
      console.error(`API request failed: ${endpoint}`, error);
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查后端服务是否运行在 http://192.168.22.217:5000');
    }
    throw error;
  }
}

/**
 * Domain API - 分类维度
 * 
 * 元模型位置：meta/shared/domain.py
 * 说明：Domain是分类维度，用于组织Models和Datasources
 */
export const domainAPI = {
  getAll: () => apiRequest('/api/domain'),
  getById: (id) => apiRequest(`/api/domain/${id}`),
  create: (data) => apiRequest('/api/domain', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/api/domain/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/api/domain/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Model API - 模型聚合
 * 
 * 元模型位置：meta/model/model.py
 * 聚合根：Model
 * 包含实体：Property
 */
export const modelAPI = {
  getAll: (domainId) => {
    const endpoint = domainId 
      ? `/api/model?domainId=${domainId}`
      : '/api/model';
    return apiRequest(endpoint);
  },

  getById: async (id) => {
    const data = await apiRequest(`/api/model/${id}`);
    if (data.model) {
      return {
        model: data.model,
        properties: data.properties || [],
        relations: data.relations || [],
      };
    }
    return {
      model: data,
      properties: [],
      relations: [],
    };
  },

  create: (data) => apiRequest('/api/model', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/model/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/model/${id}`, {
    method: 'DELETE',
  }),

  addProperty: (modelId, propertyData) => apiRequest(`/api/model/${modelId}/properties`, {
    method: 'POST',
    body: JSON.stringify(propertyData),
  }),

  removeProperty: (modelId, propertyId) => apiRequest(`/api/model/${modelId}/properties/${propertyId}`, {
    method: 'DELETE',
  }),

  addRelation: (relationData) => apiRequest('/api/model/relations', {
    method: 'POST',
    body: JSON.stringify(relationData),
  }),

  removeRelation: (relationId) => apiRequest(`/api/model/relations/${relationId}`, {
    method: 'DELETE',
  }),
};

/**
 * Relation API - 跨聚合关系管理
 * 
 * 元模型位置：meta/shared/relation.py
 * 说明：Relation是连接两个Model的跨聚合关系
 * 不属于任何聚合边界，用于管理Model之间的关系
 */
export const relationAPI = {
  getAll: (params) => {
    const queryParams = new URLSearchParams();
    if (params?.domainId) queryParams.append('domainId', params.domainId);
    if (params?.modelId) queryParams.append('modelId', params.modelId);
    const query = queryParams.toString();
    const endpoint = query ? `/api/relation?${query}` : '/api/relation';
    return apiRequest(endpoint);
  },

  getById: (id) => apiRequest(`/api/relation/${id}`),

  create: (data) => apiRequest('/api/relation', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/relation/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/relation/${id}`, {
    method: 'DELETE',
  }),

  toggle: (id) => apiRequest(`/api/relation/${id}/toggle`, {
    method: 'PUT',
  }),
};

/**
 * Datasource API - 数据源聚合
 * 
 * 元模型位置：meta/datasource/datasource.py
 * 聚合根：Datasource
 * 包含实体：ModelTableAssociation
 */
export const datasourceAPI = {
  getAll: (domainId) => {
    const endpoint = domainId 
      ? `/api/datasource?domainId=${domainId}`
      : '/api/datasource';
    return apiRequest(endpoint);
  },

  getById: async (id) => {
    const data = await apiRequest(`/api/datasource/${id}`);
    if (data.datasource) {
      return {
        datasource: data.datasource,
        mappings: data.mappings || [],
        associations: data.associations || [],
      };
    }
    return {
      datasource: data,
      mappings: [],
      associations: [],
    };
  },

  create: (data) => apiRequest('/api/datasource', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/datasource/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/datasource/${id}`, {
    method: 'DELETE',
  }),

  toggleStatus: (id) => apiRequest(`/api/datasource/${id}/toggle-status`, {
    method: 'POST',
  }),

  testConnection: (id) => apiRequest(`/api/datasource/${id}/test`, {
    method: 'POST',
  }),

  getTables: (id) => apiRequest(`/api/datasource/${id}/tables`),

  getTableData: (id, tableName) => apiRequest(`/api/datasource/${id}/tables/${tableName}/data`),

  addMapping: (datasourceId, mappingData) => apiRequest(`/api/datasource/${datasourceId}/mappings`, {
    method: 'POST',
    body: JSON.stringify(mappingData),
  }),

  addAssociation: (datasourceId, associationData) => apiRequest(`/api/datasource/${datasourceId}/associations`, {
    method: 'POST',
    body: JSON.stringify(associationData),
  }),

  getGlobalTargetId: () => apiRequest('/api/datasource/global-target-id'),
};

/**
 * Mapping API - 跨聚合映射管理
 * 
 * 元模型位置：meta/shared/mapping.py
 * 说明：Mapping是连接Datasource、Model和Property的跨聚合关系
 * 用于定义数据源字段到模型属性的映射
 */
export const mappingAPI = {
  getAll: (params) => {
    const queryParams = new URLSearchParams();
    if (params?.datasourceId) queryParams.append('datasourceId', params.datasourceId);
    if (params?.modelId) queryParams.append('modelId', params.modelId);
    const query = queryParams.toString();
    const endpoint = query ? `/api/mapping?${query}` : '/api/mapping';
    return apiRequest(endpoint);
  },

  getById: (id) => apiRequest(`/api/mapping/${id}`),

  create: (data) => apiRequest('/api/mapping', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/mapping/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/mapping/${id}`, {
    method: 'DELETE',
  }),

  batchCreate: (datasourceId, mappings) => apiRequest(`/api/datasource/${datasourceId}/mappings/batch`, {
    method: 'POST',
    body: JSON.stringify({ mappings }),
  }),
};

/**
 * ETL API - ETL任务聚合
 * 
 * 元模型位置：meta/etl/etl_task.py
 * 聚合根：ETLTask
 * 包含实体：ETLLog
 */
export const etlAPI = {
  getAllTasks: () => apiRequest('/api/etl/tasks'),

  getTaskById: async (id) => {
    const data = await apiRequest(`/api/etl/tasks/${id}`);
    if (data.task) {
      return {
        task: data.task,
        logs: data.logs || [],
      };
    }
    return {
      task: data,
      logs: [],
    };
  },

  createTask: (data) => apiRequest('/api/etl/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  activateTask: (id) => apiRequest(`/api/etl/tasks/${id}/activate`, {
    method: 'POST',
  }),

  pauseTask: (id) => apiRequest(`/api/etl/tasks/${id}/pause`, {
    method: 'POST',
  }),

  startTask: (id) => apiRequest(`/api/etl/tasks/${id}/start`, {
    method: 'POST',
  }),

  completeTask: (id) => apiRequest(`/api/etl/tasks/${id}/complete`, {
    method: 'POST',
  }),

  addLog: (taskId, logData) => apiRequest(`/api/etl/tasks/${taskId}/logs`, {
    method: 'POST',
    body: JSON.stringify(logData),
  }),

  getLogs: () => apiRequest('/api/etl/logs'),
};

/**
 * Property API - 属性管理
 */
export const propertyAPI = {
  getAll: (modelId) => {
    const endpoint = modelId 
      ? `/api/property?modelId=${modelId}`
      : '/api/property';
    return apiRequest(endpoint);
  },

  create: (data) => apiRequest('/api/property', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/property/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/property/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Shared Attribute API - 共享属性
 */
export const sharedAttributeAPI = {
  getAll: (domainId) => {
    const endpoint = domainId 
      ? `/api/shared-attribute?domainId=${domainId}`
      : '/api/shared-attribute';
    return apiRequest(endpoint);
  },

  create: (data) => apiRequest('/api/shared-attribute', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/shared-attribute/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/shared-attribute/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Indicator API - 指标管理
 */
export const indicatorAPI = {
  getAll: (domainId) => {
    const endpoint = domainId 
      ? `/api/indicator?domainId=${domainId}`
      : '/api/indicator';
    return apiRequest(endpoint);
  },

  getByModelId: (modelId) => apiRequest(`/api/indicator/model/${modelId}`),

  create: (data) => apiRequest('/api/indicator', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/indicator/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/indicator/${id}`, {
    method: 'DELETE',
  }),

  publish: (id) => apiRequest(`/api/indicator/${id}/publish`, {
    method: 'PUT',
  }),

  offline: (id) => apiRequest(`/api/indicator/${id}/offline`, {
    method: 'PUT',
  }),
};

/**
 * Data Lineage API - 数据血缘管理
 */
export const lineageAPI = {
  getByModel: (modelId, type) => {
    const endpoint = type 
      ? `/api/lineage/model/${modelId}?type=${type}`
      : `/api/lineage/model/${modelId}`;
    return apiRequest(endpoint);
  },

  getForward: (modelId) => apiRequest(`/api/lineage/model/${modelId}/forward`),

  getReverse: (modelId) => apiRequest(`/api/lineage/model/${modelId}/reverse`),

  getEndToEnd: (modelId) => apiRequest(`/api/lineage/model/${modelId}/end-to-end`),

  create: (data) => apiRequest('/api/lineage', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/lineage/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Data API - 数据记录
 */
export const dataAPI = {
  getAll: (modelId) => {
    const endpoint = modelId 
      ? `/api/data?modelId=${modelId}`
      : '/api/data';
    return apiRequest(endpoint);
  },

  create: (data) => apiRequest('/api/data', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/data/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/data/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Function API - 函数管理
 */
export const functionAPI = {
  getAll: () => apiRequest('/api/function'),
  create: (data) => apiRequest('/api/function', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/api/function/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/api/function/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Model Table Association API
 */
export const modelTableAssociationAPI = {
  getAll: (modelId) => {
    const endpoint = modelId 
      ? `/api/model-table-associations?modelId=${modelId}`
      : '/api/model-table-associations';
    return apiRequest(endpoint);
  },

  create: (data) => apiRequest('/api/model-table-associations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id, data) => apiRequest(`/api/model-table-associations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiRequest(`/api/model-table-associations/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * Health Check API
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
  mapping: mappingAPI,
  sharedAttribute: sharedAttributeAPI,
  indicator: indicatorAPI,
  data: dataAPI,
  function: functionAPI,
  modelTableAssociation: modelTableAssociationAPI,
  etl: etlAPI,
  lineage: lineageAPI,
  health: healthAPI,
};
