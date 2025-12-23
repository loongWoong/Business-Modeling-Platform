import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MappingModal = ({
  isOpen,
  onClose,
  datasource,
  model,
  modelProperties,
  modelId
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [mappings, setMappings] = useState([]); // 映射关系: [{ fieldId, propertyId }]
  const [draggingFrom, setDraggingFrom] = useState(null); // { type: 'field'|'property', id, x, y }
  const [tableStructure, setTableStructure] = useState(null); // 表结构数据

  // 根据数据源表名生成对应的表结构数据（实际应该从API获取）
  useEffect(() => {
    if (isOpen && datasource) {
      // 根据表名生成对应的字段结构
      const generateFieldsByTableName = (tableName) => {
        const tableNameLower = tableName.toLowerCase();
        
        // 车辆表
        if (tableNameLower.includes('vehicle')) {
          return [
            { id: 'field_1', name: 'vehicle_id', type: 'VARCHAR(50)', isPrimaryKey: true },
            { id: 'field_2', name: 'license_plate', type: 'VARCHAR(20)' },
            { id: 'field_3', name: 'vehicle_type', type: 'VARCHAR(50)' },
            { id: 'field_4', name: 'owner_name', type: 'VARCHAR(100)' },
            { id: 'field_5', name: 'owner_id_card', type: 'VARCHAR(18)' },
            { id: 'field_6', name: 'vehicle_color', type: 'VARCHAR(20)' },
            { id: 'field_7', name: 'register_date', type: 'DATE' },
            { id: 'field_8', name: 'vehicle_status', type: 'VARCHAR(20)' }
          ];
        }
        // 收费站表
        else if (tableNameLower.includes('station') || tableNameLower.includes('toll_station')) {
          return [
            { id: 'field_1', name: 'station_id', type: 'VARCHAR(50)', isPrimaryKey: true },
            { id: 'field_2', name: 'station_name', type: 'VARCHAR(100)' },
            { id: 'field_3', name: 'road_id', type: 'VARCHAR(50)' },
            { id: 'field_4', name: 'station_type', type: 'VARCHAR(20)' },
            { id: 'field_5', name: 'location', type: 'VARCHAR(200)' },
            { id: 'field_6', name: 'create_time', type: 'DATETIME' },
            { id: 'field_7', name: 'status', type: 'VARCHAR(20)' }
          ];
        }
        // 默认字段
        else {
          return [
            { id: 'field_1', name: 'id', type: 'INT', isPrimaryKey: true },
            { id: 'field_2', name: 'name', type: 'VARCHAR(255)' },
            { id: 'field_3', name: 'code', type: 'VARCHAR(100)' },
            { id: 'field_4', name: 'created_at', type: 'DATETIME' },
            { id: 'field_5', name: 'status', type: 'INT' }
          ];
        }
      };
      
      const mockTableStructure = {
        tables: [
          {
            id: 'table_1',
            name: datasource.tableName || 'user_table',
            fields: generateFieldsByTableName(datasource.tableName || '')
          }
        ],
        relations: [] // 表之间的关系
      };
      setTableStructure(mockTableStructure);
      
      // 加载已有的映射关系
      loadMappings();
    }
  }, [isOpen, datasource]);

  // 加载映射关系
  const loadMappings = async () => {
    if (!datasource || !modelId) return;
    try {
      const response = await fetch(`/api/datasource/${datasource.id}/mappings?modelId=${modelId}`);
      if (response.ok) {
        const data = await response.json();
        setMappings(data || []);
      }
    } catch (error) {
      console.error('Failed to load mappings:', error);
    }
  };

  // 保存映射关系
  const saveMappings = async () => {
    if (!datasource || !modelId) return;
    try {
      const response = await fetch(`/api/datasource/${datasource.id}/mappings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: parseInt(modelId),
          mappings: mappings
        })
      });
      if (response.ok) {
        alert('映射关系保存成功');
      }
    } catch (error) {
      console.error('Failed to save mappings:', error);
      alert('映射关系保存失败');
    }
  };

  // 使用D3.js绘制ER图
  useEffect(() => {
    if (!isOpen || !svgRef.current || !containerRef.current || !tableStructure || !modelProperties) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;

    // 清除旧的图形
    svg.selectAll('*').remove();

    // 准备节点和连线数据
    const nodes = [];
    const links = [];

    // 添加数据源表节点（左侧）
    tableStructure.tables.forEach(table => {
      nodes.push({
        id: table.id,
        name: table.name,
        type: 'table',
        fields: table.fields,
        x: width * 0.25,
        y: height / 2
      });
    });

    // 添加模型表节点（右侧）- 将模型作为表展示，属性作为字段
    if (model && modelProperties && modelProperties.length > 0) {
      // 将属性转换为字段格式
      const modelFields = modelProperties.map(prop => ({
        id: `property_${prop.id}`,
        name: prop.name,
        type: prop.type || 'string',
        isPrimaryKey: prop.isPrimaryKey || false,
        isForeignKey: prop.isForeignKey || false,
        property: prop
      }));
      
      nodes.push({
        id: 'model_table',
        name: model.name || '模型',
        type: 'model',
        fields: modelFields,
        x: width * 0.75,
        y: height / 2
      });
    }

    // 添加映射连线
    mappings.forEach(mapping => {
      // 查找数据源表节点和字段
      const sourceTableNode = nodes.find(n => n.type === 'table' && n.fields?.some(f => f.id === mapping.fieldId));
      // 查找模型表节点和属性字段
      const targetModelNode = nodes.find(n => n.type === 'model' && n.fields?.some(f => f.id === `property_${mapping.propertyId}`));
      
      if (sourceTableNode && targetModelNode) {
        const sourceField = sourceTableNode.fields.find(f => f.id === mapping.fieldId);
        const targetProperty = targetModelNode.fields.find(f => f.id === `property_${mapping.propertyId}`);
        links.push({
          source: { 
            id: sourceTableNode.id, 
            fieldId: mapping.fieldId, 
            fieldName: sourceField?.name 
          },
          target: { 
            id: targetModelNode.id, 
            propertyId: mapping.propertyId, 
            propertyName: targetProperty?.name 
          },
          type: 'mapping'
        });
      }
    });

    // 创建力导向模拟
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX().strength(0.2).x(d => {
        if (d.type === 'table') return width * 0.25;  // 数据源表在左侧
        if (d.type === 'model') return width * 0.75;  // 模型表在右侧
        return width / 2;
      }));

    // 添加渐变定义
    const defs = svg.append('defs');
    
    // 表节点渐变
    defs.append('linearGradient')
      .attr('id', 'tableGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#3b82f6' },
        { offset: '100%', color: '#1d4ed8' }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    // 属性节点渐变
    defs.append('linearGradient')
      .attr('id', 'propertyGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#10b981' },
        { offset: '100%', color: '#059669' }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);

    // 映射连线渐变
    defs.append('linearGradient')
      .attr('id', 'mappingGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#f59e0b', opacity: 0.8 },
        { offset: '100%', color: '#10b981', opacity: 0.8 }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color)
      .attr('stop-opacity', d => d.opacity);

    // 添加箭头标记
    defs.append('marker')
      .attr('id', 'mappingArrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f59e0b');

    // 创建连线组
    const linkGroup = svg.append('g').attr('class', 'link-group');

    // 绘制映射连线
    const link = linkGroup.selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('class', 'mapping-link')
      .attr('stroke', 'url(#mappingGradient)')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#mappingArrow)')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        // 删除映射
        setMappings(mappings.filter(m => 
          !(m.fieldId === d.source.fieldId && m.propertyId === d.target.propertyId)
        ));
      });

    // 绘制预览连线（在鼠标移动事件中直接更新，不在这里渲染）

    // 创建节点组
    const nodeGroup = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', d => `node ${d.type}-node`)
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // 绘制表节点
    const tableNodes = nodeGroup.filter(d => d.type === 'table');
    
    tableNodes.each(function(d) {
      const g = d3.select(this);
      const tableWidth = 200;
      const tableHeight = 100 + (d.fields?.length || 0) * 25;
      
      // 表头
      g.append('rect')
        .attr('width', tableWidth)
        .attr('height', 30)
        .attr('fill', 'url(#tableGradient)')
        .attr('rx', 4)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
      
      g.append('text')
        .text(d.name)
        .attr('x', tableWidth / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold');
      
      // 字段列表
      if (d.fields) {
        d.fields.forEach((field, index) => {
          const fieldY = 30 + index * 25;
          
          // 字段背景
          g.append('rect')
            .attr('x', 0)
            .attr('y', fieldY)
            .attr('width', tableWidth)
            .attr('height', 25)
            .attr('fill', index % 2 === 0 ? '#f8f9fa' : '#ffffff')
            .attr('stroke', '#e0e0e0')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseenter', function() {
              d3.select(this).attr('fill', '#e3f2fd');
            })
            .on('mouseleave', function() {
              d3.select(this).attr('fill', index % 2 === 0 ? '#f8f9fa' : '#ffffff');
            })
            .on('mousedown', function(event) {
              event.stopPropagation();
              const fieldIndex = d.fields.findIndex(f => f.id === field.id);
              const fieldY = d.y + 30 + fieldIndex * 25 + 12.5;
              setDraggingFrom({
                type: 'field',
                id: field.id,
                fieldId: field.id,
                tableId: d.id,
                x: d.x,
                y: fieldY
              });
            });
          
          // 字段名
          g.append('text')
            .text(field.name)
            .attr('x', 10)
            .attr('y', fieldY + 17)
            .attr('fill', '#333')
            .attr('font-size', '12px');
          
          // 字段类型
          g.append('text')
            .text(field.type)
            .attr('x', tableWidth - 10)
            .attr('y', fieldY + 17)
            .attr('text-anchor', 'end')
            .attr('fill', '#666')
            .attr('font-size', '11px');
          
          // 主键标识
          if (field.isPrimaryKey) {
            g.append('circle')
              .attr('cx', tableWidth - 30)
              .attr('cy', fieldY + 12)
              .attr('r', 5)
              .attr('fill', '#f59e0b');
          }
        });
      }
      
      // 表边框
      g.append('rect')
        .attr('width', tableWidth)
        .attr('height', tableHeight)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('rx', 4);
    });

    // 绘制模型表节点（类似表节点，但使用不同的颜色）
    const modelNodes = nodeGroup.filter(d => d.type === 'model');
    
    modelNodes.each(function(d) {
      const g = d3.select(this);
      const tableWidth = 200;
      const tableHeight = 100 + (d.fields?.length || 0) * 25;
      
      // 模型表头
      g.append('rect')
        .attr('width', tableWidth)
        .attr('height', 30)
        .attr('fill', 'url(#propertyGradient)')
        .attr('rx', 4)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
      
      g.append('text')
        .text(d.name)
        .attr('x', tableWidth / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold');
      
      // 属性字段列表
      if (d.fields) {
        d.fields.forEach((field, index) => {
          const fieldY = 30 + index * 25;
          
          // 字段背景
          g.append('rect')
            .attr('x', 0)
            .attr('y', fieldY)
            .attr('width', tableWidth)
            .attr('height', 25)
            .attr('fill', index % 2 === 0 ? '#f0fdf4' : '#ffffff')
            .attr('stroke', '#d1fae5')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseenter', function() {
              d3.select(this).attr('fill', '#dcfce7');
            })
            .on('mouseleave', function() {
              d3.select(this).attr('fill', index % 2 === 0 ? '#f0fdf4' : '#ffffff');
            })
            .on('mousedown', function(event) {
              event.stopPropagation();
              const fieldIndex = d.fields.findIndex(f => f.id === field.id);
              const fieldYPos = d.y + 30 + fieldIndex * 25 + 12.5;
              setDraggingFrom({
                type: 'property',
                id: field.property.id,
                propertyId: field.property.id,
                fieldId: field.id,
                modelId: d.id,
                x: d.x,
                y: fieldYPos
              });
            });
          
          // 属性名
          g.append('text')
            .text(field.name)
            .attr('x', 10)
            .attr('y', fieldY + 17)
            .attr('fill', '#333')
            .attr('font-size', '12px');
          
          // 属性类型
          g.append('text')
            .text(field.type)
            .attr('x', tableWidth - 10)
            .attr('y', fieldY + 17)
            .attr('text-anchor', 'end')
            .attr('fill', '#666')
            .attr('font-size', '11px');
          
          // 主键标识
          if (field.isPrimaryKey) {
            g.append('circle')
              .attr('cx', tableWidth - 30)
              .attr('cy', fieldY + 12)
              .attr('r', 5)
              .attr('fill', '#10b981');
          }
          
          // 外键标识
          if (field.isForeignKey) {
            g.append('circle')
              .attr('cx', tableWidth - 50)
              .attr('cy', fieldY + 12)
              .attr('r', 5)
              .attr('fill', '#3b82f6');
          }
        });
      }
      
      // 模型表边框
      g.append('rect')
        .attr('width', tableWidth)
        .attr('height', tableHeight)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('rx', 4);
    });

    // 鼠标移动事件 - 更新预览连线（直接更新DOM，避免状态更新导致重渲染）
    const previewLine = linkGroup.append('line')
      .attr('class', 'preview-link')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.6)
      .attr('marker-end', 'url(#mappingArrow)')
      .style('display', 'none');
    
    svg.on('mousemove', (event) => {
      if (draggingFrom) {
        const [x, y] = d3.pointer(event, svg.node());
        previewLine
          .style('display', 'block')
          .attr('x1', draggingFrom.x)
          .attr('y1', draggingFrom.y)
          .attr('x2', x)
          .attr('y2', y);
      } else {
        previewLine.style('display', 'none');
      }
    });

    // 鼠标释放事件 - 创建映射
    svg.on('mouseup', (event) => {
      if (draggingFrom) {
        const [x, y] = d3.pointer(event, svg.node());
        
        // 查找目标节点
        let targetNode = null;
        let targetField = null;
        
        // 检查是否点击在表节点（数据源表或模型表）的字段上
        for (const node of nodes) {
          if (node.type === 'table' || node.type === 'model') {
            const nodeWidth = 200;
            const nodeHeight = 100 + (node.fields?.length || 0) * 25;
            if (x >= node.x - nodeWidth / 2 && x <= node.x + nodeWidth / 2 &&
                y >= node.y && y <= node.y + nodeHeight) {
              // 检查是否点击在具体字段上
              const fieldIndex = Math.floor((y - node.y - 30) / 25);
              if (fieldIndex >= 0 && fieldIndex < node.fields.length) {
                targetNode = node;
                targetField = node.fields[fieldIndex];
                break;
              }
            }
          }
        }
        
        if (targetNode && targetField) {
          if (draggingFrom.type === 'field' && targetNode.type === 'model') {
            // 数据源字段映射到模型属性
            const newMapping = {
              fieldId: draggingFrom.fieldId,
              propertyId: targetField.property.id
            };
            // 检查是否已存在
            const exists = mappings.some(m => 
              m.fieldId === newMapping.fieldId && m.propertyId === newMapping.propertyId
            );
            if (!exists) {
              setMappings([...mappings, newMapping]);
            }
          } else if (draggingFrom.type === 'property' && targetNode.type === 'table') {
            // 模型属性映射到数据源字段
            const newMapping = {
              fieldId: targetField.id,
              propertyId: draggingFrom.propertyId
            };
            // 检查是否已存在
            const exists = mappings.some(m => 
              m.fieldId === newMapping.fieldId && m.propertyId === newMapping.propertyId
            );
            if (!exists) {
              setMappings([...mappings, newMapping]);
            }
          }
        }
        
        setDraggingFrom(null);
        // 隐藏预览连线
        svg.select('.preview-link').style('display', 'none');
      }
    });

    // 更新位置
    simulation.on('tick', () => {
      link
        .attr('x1', d => {
          const sourceNode = nodes.find(n => n.id === d.source.id);
          return sourceNode ? sourceNode.x : 0;
        })
        .attr('y1', d => {
          const sourceNode = nodes.find(n => n.id === d.source.id);
          if (sourceNode && (sourceNode.type === 'table' || sourceNode.type === 'model')) {
            const fieldIndex = sourceNode.fields?.findIndex(f => 
              f.id === d.source.fieldId || f.id === `property_${d.source.propertyId}`
            ) || 0;
            return sourceNode.y + 30 + fieldIndex * 25 + 12.5;
          }
          return sourceNode ? sourceNode.y : 0;
        })
        .attr('x2', d => {
          const targetNode = nodes.find(n => n.id === d.target.id);
          return targetNode ? targetNode.x : 0;
        })
        .attr('y2', d => {
          const targetNode = nodes.find(n => n.id === d.target.id);
          if (targetNode && (targetNode.type === 'table' || targetNode.type === 'model')) {
            const fieldIndex = targetNode.fields?.findIndex(f => 
              f.id === d.target.fieldId || f.id === `property_${d.target.propertyId}`
            ) || 0;
            return targetNode.y + 30 + fieldIndex * 25 + 12.5;
          }
          return targetNode ? targetNode.y : 0;
        });
      
      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
      
      // 更新预览连线（如果存在）
      if (draggingFrom) {
        const previewLine = svg.select('.preview-link');
        if (!previewLine.empty()) {
          const sourceNode = nodes.find(n => 
            (n.type === 'table' && n.fields?.some(f => f.id === draggingFrom.fieldId)) ||
            (n.type === 'model' && n.fields?.some(f => f.id === draggingFrom.fieldId || f.property?.id === draggingFrom.propertyId))
          );
          if (sourceNode) {
            let sourceX = sourceNode.x;
            let sourceY = sourceNode.y;
            if ((sourceNode.type === 'table' || sourceNode.type === 'model') && draggingFrom.fieldId) {
              const fieldIndex = sourceNode.fields.findIndex(f => 
                f.id === draggingFrom.fieldId || f.id === `property_${draggingFrom.propertyId}`
              );
              if (fieldIndex >= 0) {
                sourceY = sourceNode.y + 30 + fieldIndex * 25 + 12.5;
              }
            }
            previewLine
              .attr('x1', sourceX)
              .attr('y1', sourceY);
          }
        }
      }
    });

    // 拖拽函数
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // 窗口大小变化
    const handleResize = () => {
      const newWidth = container.node().clientWidth;
      const newHeight = container.node().clientHeight;
      svg.attr('width', newWidth).attr('height', newHeight);
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      svg.on('mousemove', null);
      svg.on('mouseup', null);
    };
  }, [isOpen, tableStructure, modelProperties, mappings, draggingFrom, model]);

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ width: '90vw', height: '90vh', maxWidth: '1400px', maxHeight: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>字段映射 - {datasource?.name}</h2>
          <div>
            <button onClick={saveMappings} style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              保存映射
            </button>
            <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              关闭
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', height: 'calc(100% - 80px)' }}>
          {/* ER图区域 */}
          <div ref={containerRef} style={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f8f9fa', position: 'relative' }}>
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
            <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '4px', fontSize: '12px', zIndex: 10 }}>
              <div style={{ marginBottom: '5px' }}><strong>操作提示：</strong></div>
              <div>• 左侧：数据源表ER图</div>
              <div>• 右侧：当前模型ER图</div>
              <div>• 从表字段拖拽到模型属性创建映射</div>
              <div>• 从模型属性拖拽到表字段创建映射</div>
              <div>• 点击映射连线可删除映射关系</div>
              <div>• 拖拽节点可调整位置</div>
            </div>
          </div>
          
          {/* 映射列表区域 */}
          <div style={{ width: '300px', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>映射关系</h3>
            {mappings.length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>暂无映射关系</div>
            ) : (
              <div>
                {mappings.map((mapping, index) => {
                  const field = tableStructure?.tables[0]?.fields?.find(f => f.id === mapping.fieldId);
                  const property = modelProperties.find(p => p.id === mapping.propertyId);
                  return (
                    <div key={index} style={{ 
                      padding: '10px', 
                      marginBottom: '10px', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '4px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '5px', fontWeight: 'bold' }}>
                        {tableStructure?.tables[0]?.name || '数据源表'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                        {field?.name || '未知字段'} ({field?.type || ''})
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>
                        ↓ 映射到 ↓
                      </div>
                      <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '5px', fontWeight: 'bold' }}>
                        {model?.name || '当前模型'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {property?.name || '未知属性'} ({property?.type || 'string'})
                      </div>
                      <button 
                        onClick={() => setMappings(mappings.filter((_, i) => i !== index))}
                        style={{ 
                          marginTop: '8px', 
                          padding: '4px 8px', 
                          fontSize: '12px',
                          backgroundColor: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer' 
                        }}
                      >
                        删除
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MappingModal;

