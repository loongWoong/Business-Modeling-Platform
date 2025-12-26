import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Divider, Space, InputNumber, message } from 'antd';

const { Option } = Select;

const ETLConfigurator = () => {
  const [datasources, setDatasources] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedDatasource, setSelectedDatasource] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [modelProperties, setModelProperties] = useState([]);
  const [relatedTables, setRelatedTables] = useState([]);
  const [selectedRelatedTable, setSelectedRelatedTable] = useState(null);
  const [datasourceSchema, setDatasourceSchema] = useState([]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [transformRules, setTransformRules] = useState([]);
  const [modelTableMappings, setModelTableMappings] = useState([]);

  // 获取数据源和模型列表
  useEffect(() => {
    fetch('/api/datasource')
      .then(response => response.json())
      .then(data => setDatasources(data))
      .catch(error => console.error('Failed to fetch datasources:', error));

    fetch('/api/model')
      .then(response => response.json())
      .then(data => {
        const modelsData = Array.isArray(data) ? data : data.models || [];
        setModels(modelsData);
      })
      .catch(error => console.error('Failed to fetch models:', error));
  }, []);

  // 获取模型详细信息和属性
  useEffect(() => {
    if (selectedModel) {
      // 获取模型信息
      const model = models.find(m => m.id === selectedModel);
      if (model) {
        setModelInfo(model);
      }
      
      // 获取模型属性
      fetch(`/api/property?modelId=${selectedModel}`)
        .then(response => response.json())
        .then(data => setModelProperties(data))
        .catch(error => console.error('Failed to fetch model properties:', error));
      
      // 获取模型的关联表配置
      fetch(`/api/model-table-associations?modelId=${selectedModel}`)
        .then(response => response.json())
        .then(data => {
          setRelatedTables(data);
          if (data.length > 0) {
            setSelectedRelatedTable(data[0].id);
          }
        })
        .catch(error => console.error('Failed to fetch related tables:', error));
    }
  }, [selectedModel, models]);

  // 获取关联表的表结构
  useEffect(() => {
    if (selectedRelatedTable) {
      const relatedTable = relatedTables.find(table => table.id === selectedRelatedTable);
      if (relatedTable) {
        // 获取表结构
        fetch(`/api/datasource/${relatedTable.datasourceId}/tables/${relatedTable.tableName}/schema`)
          .then(response => response.json())
          .then(schema => {
            // API返回的是{ fields: [...] }格式，需要提取fields数组
            const fieldsArray = schema.fields || [];
            // 转换字段格式，确保包含name和type字段
            const formattedSchema = fieldsArray.map(field => ({
              name: field.column_name,
              type: field.data_type
            }));
            setDatasourceSchema(formattedSchema);
          })
          .catch(error => {
            console.error('Failed to fetch table schema:', error);
            // 使用模拟数据
            const mockSchema = [
              { name: 'id', type: 'int' },
              { name: 'name', type: 'varchar(255)' },
              { name: 'code', type: 'varchar(100)' },
              { name: 'type', type: 'varchar(50)' },
              { name: 'create_time', type: 'datetime' },
              { name: 'update_time', type: 'datetime' }
            ];
            setDatasourceSchema(mockSchema);
          });
        
        // 获取字段映射
        fetch(`/api/datasource/${relatedTable.datasourceId}/mappings?tableName=${relatedTable.tableName}`)
          .then(response => response.json())
          .then(mappings => setModelTableMappings(mappings))
          .catch(error => console.error('Failed to fetch field mappings:', error));
      }
    }
  }, [selectedRelatedTable, relatedTables]);

  // 处理数据源选择
  const handleDatasourceChange = (datasourceId) => {
    setSelectedDatasource(datasourceId);
  };

  // 处理模型选择
  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    setSelectedRelatedTable(null);
    setDatasourceSchema([]);
    setFieldMappings({});
  };

  // 处理关联表选择
  const handleRelatedTableChange = (tableId) => {
    setSelectedRelatedTable(tableId);
    setFieldMappings({});
  };

  // 处理字段映射
  const handleFieldMappingChange = (sourceField, targetField) => {
    setFieldMappings({
      ...fieldMappings,
      [sourceField]: targetField
    });
  };

  // 自动映射字段
  const autoMapFields = () => {
    const mappings = {};
    modelTableMappings.forEach(mapping => {
      mappings[mapping.sourceField] = mapping.targetProperty;
    });
    setFieldMappings(mappings);
    message.success('自动映射完成');
  };

  // 添加转换规则
  const addTransformRule = () => {
    setTransformRules([
      ...transformRules,
      { id: Date.now(), type: 'dateFormat', sourceColumn: '', targetFormat: '' }
    ]);
  };

  // 更新转换规则
  const updateTransformRule = (id, field, value) => {
    setTransformRules(
      transformRules.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };

  // 删除转换规则
  const removeTransformRule = (id) => {
    setTransformRules(transformRules.filter(rule => rule.id !== id));
  };

  // 保存ETL配置
  const saveETLConfig = () => {
    // 生成基于模型的表结构
    const tableDefinition = {
      tableName: modelInfo?.code || '',
      columns: modelProperties.map(prop => ({
        name: prop.code,
        type: prop.type,
        required: prop.required,
        constraints: prop.constraints || []
      }))
    };

    // 生成完整的ETL配置
    const etlConfig = {
      name: `${modelInfo?.name} ETL任务`,
      description: `从${selectedRelatedTable ? relatedTables.find(t => t.id === selectedRelatedTable)?.tableName : '未选择表'}抽取数据到${modelInfo?.name}模型`,
      sourceDatasourceId: selectedDatasource,
      targetModelId: selectedModel,
      status: 'inactive',
      schedule: '0 */1 * * *',
      config: {
        source: {
          datasourceId: selectedDatasource,
          tableName: selectedRelatedTable ? relatedTables.find(t => t.id === selectedRelatedTable)?.tableName : '',
          schema: datasourceSchema
        },
        target: {
          modelId: selectedModel,
          tableDefinition: tableDefinition
        },
        fieldMappings: fieldMappings,
        transformRules: transformRules,
        extract: {
          type: 'full',
          batchSize: 1000
        },
        load: {
          mode: 'upsert',
          batchSize: 1000
        }
      }
    };

    // 调用API保存配置
    fetch('/api/etl/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(etlConfig)
    })
    .then(response => response.json())
    .then(data => {
      console.log('ETL config saved:', data);
      message.success('ETL配置保存成功');
    })
    .catch(error => {
      console.error('Failed to save ETL config:', error);
      message.error('ETL配置保存失败');
    });
  };

  return (
    <div className="etl-configurator">
      <Card title="ETL配置向导" style={{ marginBottom: '20px' }}>
        <Form layout="vertical">
          <Form.Item label="选择数据源">
            <Select
              placeholder="请选择数据源"
              onChange={handleDatasourceChange}
              value={selectedDatasource}
            >
              {datasources.map(ds => (
                <Option key={ds.id} value={ds.id}>{ds.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="选择目标模型">
            <Select
              placeholder="请选择目标模型"
              onChange={handleModelChange}
              value={selectedModel}
            >
              {models.map(model => (
                <Option key={model.id} value={model.id}>
                  {model.name} (code: {model.code || '未设置'})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedModel && modelInfo && (
            <Form.Item label="目标表名">
              <Input 
                value={modelInfo.code || ''} 
                disabled 
                placeholder="基于模型code自动生成"
              />
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                表名将使用模型的code字段，字段将基于模型属性自动创建
              </div>
            </Form.Item>
          )}
        </Form>
      </Card>

      {selectedModel && (
        <>
          <Card title="选择原始表" style={{ marginBottom: '20px' }}>
            <Form.Item label="关联表列表">
              <Select
                placeholder="选择要关联的原始表"
                onChange={handleRelatedTableChange}
                value={selectedRelatedTable}
              >
                {relatedTables.map(table => (
                  <Option key={table.id} value={table.id}>
                    {table.tableName} (数据源: {datasources.find(ds => ds.id === table.datasourceId)?.name})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Card>

          {selectedRelatedTable && datasourceSchema.length > 0 && (
            <>
              <Card title="字段映射配置" style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                  <Button onClick={autoMapFields} size="small">
                    自动映射
                  </Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 1fr', gap: '16px', alignItems: 'center' }}>
                  <div><strong>源字段</strong></div>
                  <div style={{ textAlign: 'center' }}><strong>映射</strong></div>
                  <div><strong>目标属性</strong></div>

                  {datasourceSchema.map((sourceField, index) => (
                    <React.Fragment key={index}>
                      <div>
                        <Input value={sourceField.name} disabled />
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                          类型: {sourceField.type}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>→</div>
                      <div>
                        <Select
                          placeholder="选择目标属性"
                          onChange={(value) => handleFieldMappingChange(sourceField.name, value)}
                          value={fieldMappings[sourceField.name] || undefined}
                        >
                          {modelProperties.map(prop => (
                            <Option key={prop.id} value={prop.code}>
                              {prop.name} ({prop.type})
                              {prop.isPrimaryKey && <span style={{ color: '#1890ff', marginLeft: '8px' }}>主键</span>}
                              {prop.isForeignKey && <span style={{ color: '#52c41a', marginLeft: '8px' }}>外键</span>}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </Card>

              <Card title="转换规则配置" style={{ marginBottom: '20px' }}>
                <Button onClick={addTransformRule} style={{ marginBottom: '16px' }}>
                  添加转换规则
                </Button>

                {transformRules.map(rule => (
                  <Card key={rule.id} size="small" style={{ marginBottom: '10px' }}>
                    <Space style={{ width: '100%' }} size="middle">
                      <Select
                        value={rule.type}
                        onChange={(value) => updateTransformRule(rule.id, 'type', value)}
                        style={{ width: 150 }}
                      >
                        <Option value="dateFormat">日期格式化</Option>
                        <Option value="mask">数据脱敏</Option>
                        <Option value="convertType">类型转换</Option>
                        <Option value="custom">自定义转换</Option>
                      </Select>
                      
                      <Select
                        placeholder="源字段"
                        value={rule.sourceColumn}
                        onChange={(value) => updateTransformRule(rule.id, 'sourceColumn', value)}
                        style={{ width: 150 }}
                      >
                        {datasourceSchema.map(field => (
                          <Option key={field.name} value={field.name}>{field.name}</Option>
                        ))}
                      </Select>
                      
                      {rule.type === 'dateFormat' && (
                        <Input
                          placeholder="目标格式 (如: %Y-%m-%d %H:%M:%S)"
                          value={rule.targetFormat}
                          onChange={(e) => updateTransformRule(rule.id, 'targetFormat', e.target.value)}
                          style={{ width: 200 }}
                        />
                      )}
                      
                      {rule.type === 'mask' && (
                        <Select
                          placeholder="脱敏规则"
                          value={rule.maskRule}
                          onChange={(value) => updateTransformRule(rule.id, 'maskRule', value)}
                          style={{ width: 150 }}
                        >
                          <Option value="phone_middle_4">手机号中间4位</Option>
                          <Option value="id_card_middle_8">身份证中间8位</Option>
                          <Option value="name_last_char">姓名最后1位</Option>
                        </Select>
                      )}
                      
                      <Button 
                        danger 
                        size="small" 
                        onClick={() => removeTransformRule(rule.id)}
                      >
                        删除
                      </Button>
                    </Space>
                  </Card>
                ))}
              </Card>

              <Card title="执行配置">
                <Form layout="vertical">
                  <Form.Item label="抽取类型">
                    <Select defaultValue="full">
                      <Option value="full">全量抽取</Option>
                      <Option value="incremental">增量抽取</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item label="增量字段">
                    <Select placeholder="选择用于增量抽取的字段">
                      {datasourceSchema.map(field => (
                        <Option key={field.name} value={field.name}>
                          {field.name} ({field.type})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item label="批次大小">
                    <InputNumber min={1} max={10000} defaultValue={1000} style={{ width: '100%' }} />
                  </Form.Item>
                  
                  <Divider />
                  
                  <Form.Item label="调度配置">
                    <Space>
                      <Input placeholder="Cron表达式" defaultValue="0 */1 * * *" />
                      <Button>生成表达式</Button>
                    </Space>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      当前配置: 每小时执行一次
                    </div>
                  </Form.Item>
                </Form>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Button type="primary" size="large" onClick={saveETLConfig}>
                    保存ETL配置
                  </Button>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ETLConfigurator;