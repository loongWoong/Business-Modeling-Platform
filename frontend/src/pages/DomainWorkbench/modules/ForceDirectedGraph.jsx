import React from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = ({ 
  g, 
  width, 
  height, 
  nodes, 
  links, 
  showRelations, 
  setHoveredModel, 
  setIsDrawerVisible, 
  isDrawerVisible,
  timerRef,
  isPropertyExpanded 
}) => {
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
  const defs = g.append('defs');
  
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
  g.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('click', () => {
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

  return simulation;
};

export default ForceDirectedGraph;