import React from 'react';
import * as d3 from 'd3';

const UMLDiagram = ({ 
  g, nodes, links, modelProperties, showRelations, 
  setHoveredModel, setIsDrawerVisible, isDrawerVisible, 
  timerRef, isPropertyExpanded 
}) => {
  // 添加渐变定义和UML图元素
  const defs = g.append('defs');
  
  // 类图渐变 - 更柔和的蓝色渐变
  defs.append('linearGradient')
    .attr('id', 'modelGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')
    .selectAll('stop')
    .data([
      { offset: '0%', color: '#3b82f6' },
      { offset: '100%', color: '#2563eb' }
    ])
    .enter().append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color);
  
  // 属性区域渐变
  defs.append('linearGradient')
    .attr('id', 'propertyGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')
    .selectAll('stop')
    .data([
      { offset: '0%', color: '#f8fafc' },
      { offset: '100%', color: '#e2e8f0' }
    ])
    .enter().append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color);
  
  // 方法区域渐变
  defs.append('linearGradient')
    .attr('id', 'methodGradient')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')
    .selectAll('stop')
    .data([
      { offset: '0%', color: '#e0f2fe' },
      { offset: '100%', color: '#bae6fd' }
    ])
    .enter().append('stop')
    .attr('offset', d => d.offset)
    .attr('stop-color', d => d.color);
  
  // UML关系箭头标记 - 标准UML箭头
  defs.append('marker')
    .attr('id', 'umlArrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 29)
    .attr('refY', 0)
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#4b5563')
    .attr('stroke', '#4b5563')
    .attr('stroke-width', 1);
  
  // 组合关系箭头 - 菱形标记
  defs.append('marker')
    .attr('id', 'compositionArrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 28)
    .attr('refY', 0)
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L5,0L0,5Z')
    .attr('fill', '#4b5563')
    .attr('stroke', '#4b5563')
    .attr('stroke-width', 1);
  
  // 聚合关系箭头 - 空心菱形标记
  defs.append('marker')
    .attr('id', 'aggregationArrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 28)
    .attr('refY', 0)
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L5,0L0,5Z')
    .attr('fill', 'none')
    .attr('stroke', '#4b5563')
    .attr('stroke-width', 1.5);
  
  // 创建边组
  const linkGroup = g.append('g')
    .attr('class', 'link-group');
  
  // 创建UML关系边 - 标准UML关系样式
  const umlLinks = linkGroup.append('g')
    .selectAll('line')
    .data(links.filter(link => {
      // 检查 source 和 target 是否为对象且有 id 属性
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return typeof sourceId === 'string' && typeof targetId === 'string' && 
             sourceId.startsWith('model_') && targetId.startsWith('model_');
    }))
    .enter().append('line')
    .attr('class', 'uml-link')
    .attr('stroke', '#4b5563')
    .attr('stroke-width', 2.5)
    .attr('marker-end', d => {
      // 根据关系类型选择不同的箭头
      const relationType = d.relationName ? d.relationName.toLowerCase() : '';
      if (relationType.includes('composition')) {
        return 'url(#compositionArrow)';
      } else if (relationType.includes('aggregation')) {
        return 'url(#aggregationArrow)';
      } else {
        return 'url(#umlArrow)'; // 默认箭头
      }
    })
    .attr('stroke-dasharray', d => {
      // 根据关系类型选择线条样式
      const relationType = d.relationName ? d.relationName.toLowerCase() : '';
      return relationType.includes('inheritance') ? '5,5' : null;
    });
  
  // 创建关系标签 - 标准UML关系标签样式
  const linkLabels = linkGroup.append('g')
    .selectAll('text')
    .data(links.filter(link => {
      // 检查 source 和 target 是否为对象且有 id 属性
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return typeof sourceId === 'string' && typeof targetId === 'string' && 
             sourceId.startsWith('model_') && targetId.startsWith('model_');
    }))
    .enter().append('text')
    .attr('class', 'uml-link-label')
    .style('display', showRelations ? 'block' : 'none')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('fill', '#374151')
    .style('text-anchor', 'middle')
    .style('pointer-events', 'none')
    .style('background-color', 'white')
    .style('padding', '2px 6px')
    .style('border-radius', '4px')
    .text(d => {
      // 格式化关系名称，使其更符合UML标准
      const relationType = d.relationName ? d.relationName : 'association';
      return relationType.charAt(0).toUpperCase() + relationType.slice(1);
    });
  
  // 创建节点组
  const modelNodes = nodes.filter(node => node.type === 'model');
  const nodeGroup = g.append('g')
    .selectAll('g')
    .data(modelNodes)
    .enter().append('g')
    .attr('class', 'uml-class-node')
    .attr('transform', (d, i) => {
      // UML类图布局：垂直排列，更紧凑
      const columns = Math.ceil(Math.sqrt(modelNodes.length));
      const baseSpacing = 320; // 基础间距
      // 根据模型的属性数量调整水平间距
      const properties = modelProperties[d.originalId] || [];
      const dynamicWidth = baseSpacing + Math.min(properties.length * 15, 150); // 根据属性数量动态调整
      const x = (i % columns) * dynamicWidth + 120;
      const y = Math.floor(i / columns) * 280 + 120; // 增加垂直间距
      return `translate(${x}, ${y})`;
    });

  // 查找相关节点的函数
  const findRelatedNodes = (nodeId) => {
    const relatedNodeIds = new Set();
    relatedNodeIds.add(nodeId);
    
    // 查找直接连接的节点
    const filteredLinks = links.filter(link => {
      // 检查 source 和 target 是否为对象且有 id 属性
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return typeof sourceId === 'string' && typeof targetId === 'string';
    });
    
    filteredLinks.forEach(link => {
      // 获取实际的 source 和 target id
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (sourceId === nodeId || targetId === nodeId) {
        relatedNodeIds.add(sourceId);
        relatedNodeIds.add(targetId);
      }
    });
    
    return relatedNodeIds;
  };

  // 绘制UML类图节点
  nodeGroup.each(function(d) {
    const g = d3.select(this);
    const properties = modelProperties[d.originalId] || [];
    
    // 计算类图高度 - 自适应属性数量
    const classNameHeight = 45;
    const basePropertyHeight = 20; // 属性区域标题高度
    const propertyLineHeight = 22; // 每行属性高度
    const propertyHeight = isPropertyExpanded ? 
      Math.max(basePropertyHeight + properties.length * propertyLineHeight, 40) : 40;
    const methodHeight = 35; // 方法区域默认高度，即使没有方法也显示分隔线
    const classHeight = classNameHeight + propertyHeight + methodHeight;
    const classWidth = 320;
    
    // 主类图背景 - 白色背景
    g.append('rect')
      .attr('class', 'uml-class-background')
      .attr('width', classWidth)
      .attr('height', classHeight)
      .attr('fill', 'white')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2)
      .attr('rx', 6)
      .attr('ry', 6);
    
    // 类名区域 - 标准UML类图样式
    g.append('rect')
      .attr('class', 'uml-class-header')
      .attr('width', classWidth)
      .attr('height', classNameHeight)
      .attr('fill', 'url(#modelGradient)')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2);
    
    // 类名文本 - 居中显示，加粗
    g.append('text')
      .attr('class', 'uml-class-name')
      .text(d.name)
      .attr('x', classWidth / 2)
      .attr('y', classNameHeight / 2 + 6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Arial, sans-serif');
    
    // 属性区域分隔线
    g.append('line')
      .attr('class', 'uml-class-divider')
      .attr('x1', 0)
      .attr('y1', classNameHeight)
      .attr('x2', classWidth)
      .attr('y2', classNameHeight)
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2);
    
    // 属性区域背景
    g.append('rect')
      .attr('class', 'uml-class-properties')
      .attr('width', classWidth)
      .attr('height', propertyHeight)
      .attr('y', classNameHeight)
      .attr('fill', 'url(#propertyGradient)')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 1);
    
    // 属性区域标题
    g.append('text')
      .attr('class', 'uml-section-title')
      .text('Properties')
      .attr('x', 10)
      .attr('y', classNameHeight + 20)
      .attr('fill', '#4b5563')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('font-style', 'italic');
    
    // 属性列表 - 标准UML属性表示法
    if (isPropertyExpanded && properties.length > 0) {
      properties.forEach((property, index) => {
        const propertyY = classNameHeight + 20 + (index + 1) * 22;
        
        // 属性可见性符号 (+ public, - private, # protected)
        const visibility = '+'; // 默认public
        
        // UML格式的属性文本：可见性 属性名: 类型
        g.append('text')
          .attr('class', 'uml-property')
          .text(`${visibility} ${property.name}: ${property.type}`)
          .attr('x', 15)
          .attr('y', propertyY)
          .attr('fill', '#374151')
          .attr('font-size', '13px')
          .attr('font-family', 'Arial, sans-serif');
        
        // 主键标记
        if (property.isPrimaryKey) {
          g.append('text')
            .attr('class', 'uml-property-pk')
            .text('PK')
            .attr('x', classWidth - 15)
            .attr('y', propertyY)
            .attr('text-anchor', 'end')
            .attr('fill', '#dc2626')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'Arial, sans-serif');
        }
        
        // 外键标记
        if (property.isForeignKey) {
          g.append('text')
            .attr('class', 'uml-property-fk')
            .text('FK')
            .attr('x', property.isPrimaryKey ? classWidth - 45 : classWidth - 40)
            .attr('y', propertyY)
            .attr('text-anchor', 'end')
            .attr('fill', '#2563eb')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'Arial, sans-serif');
        }
      });
    } else if (!isPropertyExpanded) {
      // 属性区域折叠时显示提示文本
      g.append('text')
        .attr('class', 'uml-collapsed-text')
        .text('(Click to expand properties)')
        .attr('x', classWidth / 2)
        .attr('y', classNameHeight + propertyHeight / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6b7280')
        .attr('font-size', '12px')
        .attr('font-style', 'italic');
    }
    
    // 方法区域分隔线
    g.append('line')
      .attr('class', 'uml-class-divider')
      .attr('x1', 0)
      .attr('y1', classNameHeight + propertyHeight)
      .attr('x2', classWidth)
      .attr('y2', classNameHeight + propertyHeight)
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2);
    
    // 方法区域背景
    g.append('rect')
      .attr('class', 'uml-class-methods')
      .attr('width', classWidth)
      .attr('height', methodHeight)
      .attr('y', classNameHeight + propertyHeight)
      .attr('fill', 'url(#methodGradient)')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 1);
    
    // 方法区域标题
    g.append('text')
      .attr('class', 'uml-section-title')
      .text('Methods')
      .attr('x', 10)
      .attr('y', classNameHeight + propertyHeight + 20)
      .attr('fill', '#4b5563')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('font-style', 'italic');
    
    // 方法区域提示文本（暂时没有方法数据）
    g.append('text')
      .attr('class', 'uml-method-placeholder')
      .text('(No methods defined)')
      .attr('x', classWidth / 2)
      .attr('y', classNameHeight + propertyHeight + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px');
  });

  // 鼠标事件处理
  nodeGroup.on('click', (event, d) => {
    event.stopPropagation();
    // 使用定时器来区分单击和双击
    if (timerRef.current) {
      // 如果已有定时器，说明是双击的第二次点击，取消单击事件
      clearTimeout(timerRef.current);
      timerRef.current = null;
    } else {
      // 设置定时器，如果在300ms内没有再次点击，则执行单击事件
      timerRef.current = setTimeout(() => {
        setHoveredModel(d);
        setIsDrawerVisible(!isDrawerVisible);
        timerRef.current = null;
      }, 300);
    }
  });

  nodeGroup.on('dblclick', (event, d) => {
    event.stopPropagation();
    // 如果有定时器，清除它，防止单击事件执行
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // 只有模型节点可以双击进入详情页
    window.location.href = `/model/${d.originalId}`;
  });
  
  // 鼠标悬停事件 - 高亮相关节点
  nodeGroup.on('mouseover', (event, d) => {
    const relatedNodeIds = findRelatedNodes(d.id);
    
    // 高亮当前节点和相关节点，其他节点置灰
    nodeGroup.style('opacity', node => {
      return relatedNodeIds.has(node.id) ? 1 : 0.2;
    });
    
    // 高亮当前节点和相关节点的所有元素
    nodeGroup.select('.uml-class-header').style('opacity', node => {
      return relatedNodeIds.has(node.id) ? 1 : 0.2;
    });
    
    nodeGroup.select('.uml-class-name').style('opacity', node => {
      return relatedNodeIds.has(node.id) ? 1 : 0.2;
    });
    
    nodeGroup.select('.uml-class-properties').style('opacity', node => {
      return relatedNodeIds.has(node.id) ? 1 : 0.2;
    });
    
    nodeGroup.selectAll('.uml-property').style('opacity', node => {
      return relatedNodeIds.has(node.id) ? 1 : 0.2;
    });
    
    nodeGroup.selectAll('.uml-property-pk').style('opacity', node => {
      return relatedNodeIds.has(node.id) ? 1 : 0.2;
    });
    
    nodeGroup.selectAll('.uml-property-fk').style('opacity', node => {
      return relatedNodeIds.has(node.id) ? 1 : 0.2;
    });
    
    nodeGroup.select('.uml-class-border').style('opacity', node => {
      return relatedNodeIds.has(node.id) ? 1 : 0.2;
    });
    
    // 高亮相关边，其他边置灰
    umlLinks.style('opacity', edge => {
      // 获取实际的 source 和 target id
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
      
      return relatedNodeIds.has(sourceId) && relatedNodeIds.has(targetId) ? 0.8 : 0.1;
    });
    
    // 高亮相关边标签，其他标签置灰
    linkLabels.style('opacity', edge => {
      // 获取实际的 source 和 target id
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
      
      return relatedNodeIds.has(sourceId) && relatedNodeIds.has(targetId) ? 0.8 : 0.1;
    });
  });
  
  // 鼠标移出事件 - 恢复所有节点和边的透明度
  nodeGroup.on('mouseout', () => {
    nodeGroup.style('opacity', 1);
    nodeGroup.select('.uml-class-header').style('opacity', 1);
    nodeGroup.select('.uml-class-name').style('opacity', 1);
    nodeGroup.select('.uml-class-properties').style('opacity', 1);
    nodeGroup.selectAll('.uml-property').style('opacity', 1);
    nodeGroup.selectAll('.uml-property-pk').style('opacity', 1);
    nodeGroup.selectAll('.uml-property-fk').style('opacity', 1);
    nodeGroup.select('.uml-class-border').style('opacity', 1);
    umlLinks.style('opacity', 0.8);
    linkLabels.style('opacity', showRelations ? 1 : 0);
  });
  
  // 更新边的位置 - 从类图中心连接
  umlLinks
    .attr('x1', d => {
      // 获取 source 和 target 的实际 id
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const sourceG = g.selectAll('.uml-class-node').filter((node) => node.id === sourceId);
      return sourceG.empty() ? 0 : sourceG.node().transform.baseVal.getItem(0).matrix.e + 160; // 类图中心x坐标
    })
    .attr('y1', d => {
      // 获取 source 和 target 的实际 id
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const sourceG = g.selectAll('.uml-class-node').filter((node) => node.id === sourceId);
      return sourceG.empty() ? 0 : sourceG.node().transform.baseVal.getItem(0).matrix.f + 97.5; // 类图中心y坐标 (45+30+30)/2 = 52.5 + 45 = 97.5
    })
    .attr('x2', d => {
      // 获取 source 和 target 的实际 id
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const targetG = g.selectAll('.uml-class-node').filter((node) => node.id === targetId);
      return targetG.empty() ? 0 : targetG.node().transform.baseVal.getItem(0).matrix.e + 160; // 类图中心x坐标
    })
    .attr('y2', d => {
      // 获取 source 和 target 的实际 id
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const targetG = g.selectAll('.uml-class-node').filter((node) => node.id === targetId);
      return targetG.empty() ? 0 : targetG.node().transform.baseVal.getItem(0).matrix.f + 97.5; // 类图中心y坐标
    });

  // 更新关系标签位置
  linkLabels
    .attr('x', d => {
      // 获取 source 和 target 的实际 id
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const sourceNode = nodes.find(n => n.id === sourceId);
      const targetNode = nodes.find(n => n.id === targetId);
      const sourceG = g.selectAll('.uml-class-node').filter((node) => node.id === sourceId);
      const targetG = g.selectAll('.uml-class-node').filter((node) => node.id === targetId);
      const sourceX = sourceNode && !sourceG.empty() ? sourceG.node().transform.baseVal.getItem(0).matrix.e + 150 : 0;
      const targetX = targetNode && !targetG.empty() ? targetG.node().transform.baseVal.getItem(0).matrix.e + 150 : 0;
      return (sourceX + targetX) / 2;
    })
    .attr('y', d => {
      // 获取 source 和 target 的实际 id
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      const sourceNode = nodes.find(n => n.id === sourceId);
      const targetNode = nodes.find(n => n.id === targetId);
      const sourceG = g.selectAll('.uml-class-node').filter((node) => node.id === sourceId);
      const targetG = g.selectAll('.uml-class-node').filter((node) => node.id === targetId);
      const sourceY = sourceNode && !sourceG.empty() ? sourceG.node().transform.baseVal.getItem(0).matrix.f + 20 : 0;
      const targetY = targetNode && !targetG.empty() ? targetG.node().transform.baseVal.getItem(0).matrix.f + 20 : 0;
      return (sourceY + targetY) / 2 - 5;
    });
};

export default UMLDiagram;