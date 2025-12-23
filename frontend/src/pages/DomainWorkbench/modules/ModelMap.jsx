import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ModelMap = ({
  allData,
  isPropertyExpanded,
  activeTab,
  searchTerm,
  showRelations,
  relations,
  setHoveredModel,
  setIsDrawerVisible,
  isDrawerVisible
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const [displayMode, setDisplayMode] = useState('force-directed'); // 'force-directed' or 'er-diagram'

  // 使用D3渲染模型地图
  useEffect(() => {
    if (activeTab !== 'model-map' || !svgRef.current || allData.models.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;

    // 清除旧的图形
    svg.selectAll('*').remove();

    // 准备数据，为不同类型节点添加唯一ID前缀
    let nodes = [];
    let links = [];

    // 处理模型节点，添加model_前缀
    allData.models.forEach(model => {
      // 根据搜索词过滤模型
      if (model.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        nodes.push({
          ...model,
          originalId: model.id,
          id: `model_${model.id}`,
          type: 'model'
        });
      }
    });

    // 处理模型之间的边，只保留存在的节点之间的边
    const modelIds = new Set(nodes.map(n => n.originalId));
    
    // 创建模型ID到模型名称的映射
    const modelIdToName = {};
    allData.models.forEach(model => {
      modelIdToName[model.id] = model.name;
    });
    
    allData.edges.forEach(edge => {
      if (modelIds.has(edge.source) && modelIds.has(edge.target)) {
        // 查找对应的关系名称
        const relation = relations.find(r => 
          r.sourceModel === modelIdToName[edge.source] && 
          r.targetModel === modelIdToName[edge.target]
        );
        
        links.push({
          source: `model_${edge.source}`,
          target: `model_${edge.target}`,
          relationName: relation ? relation.name : '关联'
        });
      }
    });

    // 收集模型的属性用于ER图展示（无论是否展开属性）
      const modelProperties = {};
      allData.properties.forEach(property => {
        if (modelIds.has(property.modelId)) {
          if (!modelProperties[property.modelId]) {
            modelProperties[property.modelId] = [];
          }
          modelProperties[property.modelId].push(property);
        }
      });
      
      // 仅在力导向图模式且展开属性时添加属性节点
      if (displayMode === 'force-directed' && isPropertyExpanded) {
        // 展开到属性级别，为属性节点添加property_前缀
        const properties = allData.properties.filter(p => modelIds.has(p.modelId));
        properties.forEach(property => {
          nodes.push({
            ...property,
            originalId: property.id,
            id: `property_${property.id}`,
            type: 'property'
          });
          
          // 添加模型到属性的边
          links.push({
            source: `model_${property.modelId}`,
            target: `property_${property.id}`
          });
        });
      }

    // 创建缩放容器组
    const g = svg.append('g');

    // 添加缩放行为
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4]) // 设置缩放范围
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    // 将缩放行为应用到SVG
    svg.call(zoom);

    // 根据显示模式渲染不同的图表
    if (displayMode === 'force-directed') {
      // 力导向图渲染逻辑
      // 创建力导向模拟
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(isPropertyExpanded ? 80 : 120))
        .force('charge', d3.forceManyBody().strength(isPropertyExpanded ? -200 : -400))
        .force('center', d3.forceCenter(width / 2, height / 2));
      
      // 查找相关节点的函数
      const findRelatedNodes = (nodeId) => {
        const relatedNodeIds = new Set();
        relatedNodeIds.add(nodeId);
        
        // 查找直接连接的节点
        links.forEach(link => {
          if (link.source.id === nodeId || link.target.id === nodeId) {
            relatedNodeIds.add(link.source.id);
            relatedNodeIds.add(link.target.id);
          }
        });
        
        return relatedNodeIds;
      };

      // 添加渐变定义
      const defs = svg.append('defs');
      
      // 模型渐变
      defs.append('linearGradient')
        .attr('id', 'modelGradient')
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
      
      // 属性渐变
      defs.append('linearGradient')
        .attr('id', 'propertyGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')
        .selectAll('stop')
        .data([
          { offset: '0%', color: '#f59e0b' },
          { offset: '100%', color: '#d97706' }
        ])
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);
      
      // 连线渐变
      defs.append('linearGradient')
        .attr('id', 'linkGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')
        .selectAll('stop')
        .data([
          { offset: '0%', color: '#3b82f6', opacity: 0.8 },
          { offset: '100%', color: '#10b981', opacity: 0.8 }
        ])
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color)
        .attr('stop-opacity', d => d.opacity);

      // 为边添加箭头标记
      defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#94a3b8');

      // 创建边组
      const linkGroup = g.append('g')
        .attr('class', 'link-group');

      // 创建边
      const link = linkGroup.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('class', 'sci-fi-link')
        .attr('marker-end', showRelations ? 'url(#arrow)' : null);

      // 创建关系标签
      const linkLabels = linkGroup.append('g')
        .selectAll('text')
        .data(links)
        .enter().append('text')
        .attr('class', 'link-label')
        .style('display', showRelations ? 'block' : 'none')
        .style('font-size', '10px')
        .style('fill', '#94a3b8')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .text(d => d.relationName);

      // 创建节点组
      const nodeGroup = g.append('g')
        .selectAll('g')
        .data(nodes)
        .enter().append('g')
        .attr('class', d => `sci-fi-node ${d.type}-node`)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      // 添加节点圆圈
      nodeGroup.append('circle')
        .attr('r', d => d.type === 'property' ? 15 : 25); // 属性节点更小

      // 节点文本
      nodeGroup.append('text')
        .text(d => d.name)
        .attr('text-anchor', 'middle')
        .attr('dy', d => d.type === 'property' ? 2 : 3)
        .attr('font-size', d => d.type === 'property' ? 9 : 11)
        .attr('fill', d => d.type === 'property' ? '#f1f5f9' : 'white');

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
        if (d.type === 'model') {
          // 只有模型节点可以双击进入详情页
          window.location.href = `/model/${d.originalId}`;
        }
      });
      
      // 鼠标悬停事件 - 高亮相关节点
      nodeGroup.on('mouseover', (event, d) => {
        const relatedNodeIds = findRelatedNodes(d.id);
        
        // 高亮当前节点和相关节点，其他节点置灰
        nodeGroup.style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        // 高亮当前节点和相关节点的圆圈和文本
        nodeGroup.select('circle').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        nodeGroup.select('text').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        // 高亮相关边，其他边置灰
        link.style('opacity', edge => {
          return relatedNodeIds.has(edge.source.id) && relatedNodeIds.has(edge.target.id) ? 0.8 : 0.1;
        });
      });
      
      // 鼠标移出事件 - 恢复所有节点和边的透明度
      nodeGroup.on('mouseout', () => {
        nodeGroup.style('opacity', 1);
        nodeGroup.select('circle').style('opacity', 1);
        nodeGroup.select('text').style('opacity', 1);
        link.style('opacity', 0.8);
      });
      
      // 添加画布点击事件，点击空白处收起信息窗
      svg.on('click', () => {
        setIsDrawerVisible(false);
      });

      // 力导向模拟更新
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        // 更新关系标签位置
        linkLabels
          .attr('x', d => (d.source.x + d.target.x) / 2)
          .attr('y', d => (d.source.y + d.target.y) / 2 - 5);

        nodeGroup
          .attr('transform', d => `translate(${d.x}, ${d.y})`);
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

      // 窗口大小变化时重新绘制
      const handleResize = () => {
        const newWidth = container.node().clientWidth;
        const newHeight = container.node().clientHeight;
        svg.attr('width', newWidth).attr('height', newHeight);
        simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
        simulation.alpha(0.3).restart();
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } else {
      // ER图渲染逻辑，参考MappingModal.jsx中的实现
      // 添加渐变定义
      const defs = svg.append('defs');
      
      // 模型渐变
      defs.append('linearGradient')
        .attr('id', 'modelGradient')
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
      
      // 属性渐变
      defs.append('linearGradient')
        .attr('id', 'propertyGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')
        .selectAll('stop')
        .data([
          { offset: '0%', color: '#f59e0b' },
          { offset: '100%', color: '#d97706' }
        ])
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color);
      
      // 连线渐变
      defs.append('linearGradient')
        .attr('id', 'linkGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')
        .selectAll('stop')
        .data([
          { offset: '0%', color: '#3b82f6', opacity: 0.8 },
          { offset: '100%', color: '#10b981', opacity: 0.8 }
        ])
        .enter().append('stop')
        .attr('offset', d => d.offset)
        .attr('stop-color', d => d.color)
        .attr('stop-opacity', d => d.opacity);

      // 为边添加箭头标记
      defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#94a3b8');

      // 创建边组
      const linkGroup = g.append('g')
        .attr('class', 'link-group');

      // 创建边（模型关系）
      // 修复：确保 link.source 和 link.target 是对象且有 id 属性
      const erLinks = linkGroup.append('g')
        .selectAll('line')
        .data(links.filter(link => {
          // 检查 source 和 target 是否为对象且有 id 属性
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          // 只保留模型之间的边（id 以 model_ 开头）
          return typeof sourceId === 'string' && typeof targetId === 'string' && 
                 sourceId.startsWith('model_') && targetId.startsWith('model_');
        }))
        .enter().append('line')
        .attr('class', 'model-relation-link')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('marker-end', showRelations ? 'url(#arrow)' : null);

      // 创建关系标签
      const linkLabels = linkGroup.append('g')
        .selectAll('text')
        .data(links.filter(link => {
          // 检查 source 和 target 是否为对象且有 id 属性
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          // 只保留模型之间的边（id 以 model_ 开头）
          return typeof sourceId === 'string' && typeof targetId === 'string' && 
                 sourceId.startsWith('model_') && targetId.startsWith('model_');
        }))
        .enter().append('text')
        .attr('class', 'link-label')
        .style('display', showRelations ? 'block' : 'none')
        .style('font-size', '10px')
        .style('fill', '#94a3b8')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .text(d => d.relationName);

      // 创建节点组
      const modelNodes = nodes.filter(node => node.type === 'model');
      const nodeGroup = g.append('g')
        .selectAll('g')
        .data(modelNodes)
        .enter().append('g')
        .attr('class', 'model-node')
        .attr('transform', (d, i) => {
          // 优化布局：根据模型的属性数量动态调整间距
          const columns = Math.ceil(Math.sqrt(modelNodes.length));
          const baseSpacing = 300; // 基础间距
          // 根据模型的属性数量调整水平间距
          const properties = modelProperties[d.originalId] || [];
          const dynamicWidth = baseSpacing + Math.min(properties.length * 10, 100); // 根据属性数量动态调整
          const x = (i % columns) * dynamicWidth + 150;
          const y = Math.floor(i / columns) * 300 + 150; // 增加垂直间距
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

      // 绘制ER图模型节点
      nodeGroup.each(function(d) {
        const g = d3.select(this);
        const tableWidth = 250;
        const properties = modelProperties[d.originalId] || [];
        // 根据是否展开属性决定表格高度
        const tableHeight = isPropertyExpanded && properties.length > 0 ? 
          100 + properties.length * 25 : 
          60; // 不展开属性时只显示表头高度
        
        // 模型表头
        g.append('rect')
          .attr('class', 'model-header')
          .attr('width', tableWidth)
          .attr('height', 30)
          .attr('fill', 'url(#modelGradient)')
          .attr('rx', 4)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
        
        g.append('text')
          .attr('class', 'model-name')
          .text(d.name)
          .attr('x', tableWidth / 2)
          .attr('y', 20)
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold');
        
        // 属性字段列表 - 只有当展开属性时才显示
        if (isPropertyExpanded && properties.length > 0) {
          properties.forEach((property, index) => {
            const fieldY = 30 + index * 25;
            
            // 字段背景
            g.append('rect')
              .attr('class', 'property-background')
              .attr('x', 0)
              .attr('y', fieldY)
              .attr('width', tableWidth)
              .attr('height', 25)
              .attr('fill', index % 2 === 0 ? '#f0fdf4' : '#ffffff')
              .attr('stroke', '#d1fae5')
              .attr('stroke-width', 1);
            
            // 属性名
            g.append('text')
              .attr('class', 'property-name')
              .text(property.name)
              .attr('x', 10)
              .attr('y', fieldY + 17)
              .attr('fill', '#333')
              .attr('font-size', '12px');
            
            // 属性类型
            g.append('text')
              .attr('class', 'property-type')
              .text(property.type)
              .attr('x', tableWidth - 10)
              .attr('y', fieldY + 17)
              .attr('text-anchor', 'end')
              .attr('fill', '#666')
              .attr('font-size', '11px');
            
            // 主键标记
            if (property.isPrimaryKey) {
              g.append('text')
                .attr('class', 'property-pk')
                .text('PK')
                .attr('x', tableWidth - 60)
                .attr('y', fieldY + 17)
                .attr('text-anchor', 'end')
                .attr('fill', '#ef4444')
                .attr('font-size', '10px')
                .attr('font-weight', 'bold');
            }
            
            // 外键标记
            if (property.isForeignKey) {
              g.append('text')
                .attr('class', 'property-fk')
                .text('FK')
                .attr('x', tableWidth - 90)
                .attr('y', fieldY + 17)
                .attr('text-anchor', 'end')
                .attr('fill', '#3b82f6')
                .attr('font-size', '10px')
                .attr('font-weight', 'bold');
            }
          });
        }
        
        // 模型表边框
        g.append('rect')
          .attr('class', 'model-border')
          .attr('width', tableWidth)
          .attr('height', tableHeight)
          .attr('fill', 'none')
          .attr('stroke', '#10b981')
          .attr('stroke-width', 2)
          .attr('rx', 4);
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
        nodeGroup.select('.model-header').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        nodeGroup.select('.model-name').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        nodeGroup.selectAll('.property-background').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        nodeGroup.selectAll('.property-name').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        nodeGroup.selectAll('.property-type').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        nodeGroup.selectAll('.property-pk').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        nodeGroup.selectAll('.property-fk').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        nodeGroup.select('.model-border').style('opacity', node => {
          return relatedNodeIds.has(node.id) ? 1 : 0.2;
        });
        
        // 高亮相关边，其他边置灰
        erLinks.style('opacity', edge => {
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
        nodeGroup.select('.model-header').style('opacity', 1);
        nodeGroup.select('.model-name').style('opacity', 1);
        nodeGroup.selectAll('.property-background').style('opacity', 1);
        nodeGroup.selectAll('.property-name').style('opacity', 1);
        nodeGroup.selectAll('.property-type').style('opacity', 1);
        nodeGroup.selectAll('.property-pk').style('opacity', 1);
        nodeGroup.selectAll('.property-fk').style('opacity', 1);
        nodeGroup.select('.model-border').style('opacity', 1);
        erLinks.style('opacity', 0.8);
        linkLabels.style('opacity', showRelations ? 1 : 0);
      });
      
      // 添加画布点击事件，点击空白处收起信息窗
      svg.on('click', () => {
        setIsDrawerVisible(false);
      });

      // 更新边的位置
      erLinks
        .attr('x1', d => {
          // 获取 source 和 target 的实际 id
          const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
          const sourceNode = nodes.find(n => n.id === sourceId);
          const sourceG = g.selectAll('.model-node').filter((node) => node.id === sourceId);
          return sourceNode && !sourceG.empty() ? sourceG.node().transform.baseVal.getItem(0).matrix.e + 125 : 0;
        })
        .attr('y1', d => {
          // 获取 source 和 target 的实际 id
          const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
          const sourceNode = nodes.find(n => n.id === sourceId);
          const sourceG = g.selectAll('.model-node').filter((node) => node.id === sourceId);
          return sourceNode && !sourceG.empty() ? sourceG.node().transform.baseVal.getItem(0).matrix.f + 15 : 0;
        })
        .attr('x2', d => {
          // 获取 source 和 target 的实际 id
          const targetId = typeof d.target === 'object' ? d.target.id : d.target;
          const targetNode = nodes.find(n => n.id === targetId);
          const targetG = g.selectAll('.model-node').filter((node) => node.id === targetId);
          return targetNode && !targetG.empty() ? targetG.node().transform.baseVal.getItem(0).matrix.e + 125 : 0;
        })
        .attr('y2', d => {
          // 获取 source 和 target 的实际 id
          const targetId = typeof d.target === 'object' ? d.target.id : d.target;
          const targetNode = nodes.find(n => n.id === targetId);
          const targetG = g.selectAll('.model-node').filter((node) => node.id === targetId);
          return targetNode && !targetG.empty() ? targetG.node().transform.baseVal.getItem(0).matrix.f + 15 : 0;
        });

      // 更新关系标签位置
      linkLabels
        .attr('x', d => {
          // 获取 source 和 target 的实际 id
          const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
          const targetId = typeof d.target === 'object' ? d.target.id : d.target;
          const sourceNode = nodes.find(n => n.id === sourceId);
          const targetNode = nodes.find(n => n.id === targetId);
          const sourceG = g.selectAll('.model-node').filter((node) => node.id === sourceId);
          const targetG = g.selectAll('.model-node').filter((node) => node.id === targetId);
          const sourceX = sourceNode && !sourceG.empty() ? sourceG.node().transform.baseVal.getItem(0).matrix.e + 125 : 0;
          const targetX = targetNode && !targetG.empty() ? targetG.node().transform.baseVal.getItem(0).matrix.e + 125 : 0;
          return (sourceX + targetX) / 2;
        })
        .attr('y', d => {
          // 获取 source 和 target 的实际 id
          const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
          const targetId = typeof d.target === 'object' ? d.target.id : d.target;
          const sourceNode = nodes.find(n => n.id === sourceId);
          const targetNode = nodes.find(n => n.id === targetId);
          const sourceG = g.selectAll('.model-node').filter((node) => node.id === sourceId);
          const targetG = g.selectAll('.model-node').filter((node) => node.id === targetId);
          const sourceY = sourceNode && !sourceG.empty() ? sourceG.node().transform.baseVal.getItem(0).matrix.f + 15 : 0;
          const targetY = targetNode && !targetG.empty() ? targetG.node().transform.baseVal.getItem(0).matrix.f + 15 : 0;
          return (sourceY + targetY) / 2 - 5;
        });

      // 窗口大小变化时重新绘制
      const handleResize = () => {
        const newWidth = container.node().clientWidth;
        const newHeight = container.node().clientHeight;
        svg.attr('width', newWidth).attr('height', newHeight);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [allData, isPropertyExpanded, activeTab, searchTerm, showRelations, displayMode]);

  // 切换显示模式
  const toggleDisplayMode = () => {
    setDisplayMode(displayMode === 'force-directed' ? 'er-diagram' : 'force-directed');
  };

  return (
    <div ref={containerRef} className="canvas-container" style={{ position: 'relative' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
      {/* 显示模式切换按钮 */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={toggleDisplayMode}
          style={{
            padding: '8px 16px',
            backgroundColor: displayMode === 'force-directed' ? '#10b981' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {displayMode === 'force-directed' ? '切换到ER图' : '切换到力导向图'}
        </button>
      </div>
      {/* 显示当前模式提示 */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#3b82f6'
      }}>
        当前显示模式: {displayMode === 'force-directed' ? '力导向图' : 'ER图'}
      </div>
    </div>
  );
};

export default ModelMap;