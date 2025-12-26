import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import HoverDrawer from '../../DomainWorkbench/components/HoverDrawer';

const BloodlineAnalyzer = ({ model, bloodlineType, setBloodlineType, bloodlineData, allData, relations }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const timerRef = useRef(null);
  const [hoveredModel, setHoveredModel] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // 生成血缘分析数据
  const generateBloodlineData = () => {
    // 模拟血缘数据，实际项目中应该从API获取
    const currentModelId = model?.id || 1;
    const nodes = [];
    const links = [];
    
    // 核心模型
    const currentModelName = model?.name || `模型${currentModelId}`;
    nodes.push({
      id: currentModelId,
      name: currentModelName,
      type: 'model',
      isCurrent: true
    });
    
    // 检查是否是收费站模型，生成特定的血缘数据
    const isTollStationModel = currentModelName.includes('收费站') || model?.name === '收费站';
    
    if (isTollStationModel) {
      // 根据血缘类型生成收费站模型特定的数据
      switch (bloodlineType) {
        case 'forward':
          // 正向血缘：收费站 → 车道 → 标识点 → 交易流水 → 车辆通行路径 → 通行拟合路径 → 拆分明细
          nodes.push(
            { id: currentModelId + 1, name: `车道`, type: 'model' },
            { id: currentModelId + 2, name: `标识点`, type: 'model' },
            { id: currentModelId + 3, name: `交易流水`, type: 'model' },
            { id: currentModelId + 4, name: `车辆通行路径`, type: 'model' },
            { id: currentModelId + 5, name: `通行拟合路径`, type: 'model' },
            { id: currentModelId + 6, name: `拆分明细`, type: 'model' }
          );
          links.push(
            { source: currentModelId, target: currentModelId + 1, name: '包含' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '继承' },
            { source: currentModelId + 2, target: currentModelId + 3, name: '生成' },
            { source: currentModelId + 3, target: currentModelId + 4, name: '汇聚为' },
            { source: currentModelId + 4, target: currentModelId + 5, name: '拟合为' },
            { source: currentModelId + 5, target: currentModelId + 6, name: '拆分为' }
          );
          break;
          
        case 'reverse':
          // 反向血缘：收费公路 → 收费站
          // 路段业主 → 收费公路 → 收费站
          nodes.push(
            { id: currentModelId - 1, name: `收费公路`, type: 'model' },
            { id: currentModelId - 2, name: `路段业主`, type: 'model' }
          );
          links.push(
            { source: currentModelId - 2, target: currentModelId - 1, name: '管理' },
            { source: currentModelId - 1, target: currentModelId, name: '包含' }
          );
          break;
          
        case 'endToEnd':
          // 端到端血缘：路段业主 → 收费公路 → 收费站 → 车道 → 标识点 → 交易流水 → 车辆通行路径 → 通行拟合路径 → 拆分明细
          nodes.push(
            { id: currentModelId - 2, name: `路段业主`, type: 'model' },
            { id: currentModelId - 1, name: `收费公路`, type: 'model' },
            { id: currentModelId + 1, name: `车道`, type: 'model' },
            { id: currentModelId + 2, name: `标识点`, type: 'model' },
            { id: currentModelId + 3, name: `交易流水`, type: 'model' },
            { id: currentModelId + 4, name: `车辆通行路径`, type: 'model' },
            { id: currentModelId + 5, name: `通行拟合路径`, type: 'model' },
            { id: currentModelId + 6, name: `拆分明细`, type: 'model' }
          );
          links.push(
            { source: currentModelId - 2, target: currentModelId - 1, name: '管理' },
            { source: currentModelId - 1, target: currentModelId, name: '包含' },
            { source: currentModelId, target: currentModelId + 1, name: '包含' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '继承' },
            { source: currentModelId + 2, target: currentModelId + 3, name: '生成' },
            { source: currentModelId + 3, target: currentModelId + 4, name: '汇聚为' },
            { source: currentModelId + 4, target: currentModelId + 5, name: '拟合为' },
            { source: currentModelId + 5, target: currentModelId + 6, name: '拆分为' }
          );
          break;
          
        case 'impact':
          // 影响分析：收费站 → 车道 → 标识点 → 交易流水 → 车辆通行路径 → 通行拟合路径 → 拆分明细
          // 同时考虑ETC门架对标识点和交易流水的影响
          nodes.push(
            { id: currentModelId + 1, name: `车道`, type: 'model' },
            { id: currentModelId + 2, name: `标识点`, type: 'model' },
            { id: currentModelId + 3, name: `交易流水`, type: 'model' },
            { id: currentModelId + 4, name: `车辆通行路径`, type: 'model' },
            { id: currentModelId + 5, name: `通行拟合路径`, type: 'model' },
            { id: currentModelId + 6, name: `拆分明细`, type: 'model' },
            { id: currentModelId + 7, name: `收费单元`, type: 'model' },
            { id: currentModelId + 8, name: `ETC门架`, type: 'model' }
          );
          links.push(
            { source: currentModelId, target: currentModelId + 1, name: '影响' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '影响' },
            { source: currentModelId + 2, target: currentModelId + 3, name: '影响' },
            { source: currentModelId + 3, target: currentModelId + 4, name: '影响' },
            { source: currentModelId + 4, target: currentModelId + 5, name: '影响' },
            { source: currentModelId + 5, target: currentModelId + 6, name: '影响' },
            { source: currentModelId + 6, target: currentModelId + 7, name: '影响' },
            { source: currentModelId + 8, target: currentModelId + 2, name: '影响' },
            { source: currentModelId + 8, target: currentModelId + 3, name: '影响' }
          );
          break;
      }
    } else {
      // 非收费站模型，使用默认的血缘数据
      switch (bloodlineType) {
        case 'forward':
          // 正向血缘：当前模型 → 下游模型1 → 下游模型2
          nodes.push(
            { id: currentModelId + 1, name: `下游模型1`, type: 'model' },
            { id: currentModelId + 2, name: `下游模型2`, type: 'model' }
          );
          links.push(
            { source: currentModelId, target: currentModelId + 1, name: '关联' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '关联' }
          );
          break;
          
        case 'reverse':
          // 反向血缘：上游模型1 → 上游模型2 → 当前模型
          nodes.push(
            { id: currentModelId - 2, name: `上游模型2`, type: 'model' },
            { id: currentModelId - 1, name: `上游模型1`, type: 'model' }
          );
          links.push(
            { source: currentModelId - 2, target: currentModelId - 1, name: '关联' },
            { source: currentModelId - 1, target: currentModelId, name: '关联' }
          );
          break;
          
        case 'endToEnd':
          // 端到端血缘：源头 → 中间模型1 → 当前模型 → 中间模型2 → 目标
          nodes.push(
            { id: currentModelId - 2, name: `数据源`, type: 'datasource' },
            { id: currentModelId - 1, name: `预处理模型`, type: 'model' },
            { id: currentModelId + 1, name: `分析模型`, type: 'model' },
            { id: currentModelId + 2, name: `业务指标`, type: 'indicator' }
          );
          links.push(
            { source: currentModelId - 2, target: currentModelId - 1, name: '读取' },
            { source: currentModelId - 1, target: currentModelId, name: '转换' },
            { source: currentModelId, target: currentModelId + 1, name: '分析' },
            { source: currentModelId + 1, target: currentModelId + 2, name: '生成' }
          );
          break;
          
        case 'impact':
          // 影响分析：当前模型 → 直接影响1 → 直接影响2 → 间接影响1 → 间接影响2
          nodes.push(
            { id: currentModelId + 1, name: `直接影响1`, type: 'model' },
            { id: currentModelId + 2, name: `直接影响2`, type: 'model' },
            { id: currentModelId + 3, name: `间接影响1`, type: 'model' },
            { id: currentModelId + 4, name: `间接影响2`, type: 'model' }
          );
          links.push(
            { source: currentModelId, target: currentModelId + 1, name: '影响' },
            { source: currentModelId, target: currentModelId + 2, name: '影响' },
            { source: currentModelId + 1, target: currentModelId + 3, name: '影响' },
            { source: currentModelId + 2, target: currentModelId + 4, name: '影响' }
          );
          break;
      }
    }
    
    return { nodes, links };
  };

  // 使用D3渲染血缘关系图
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);
    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    
    // 清除旧的图形
    svg.selectAll('*').remove();
    
    // 设置SVG尺寸
    svg.attr('width', width).attr('height', height);
    
    // 为节点设置初始位置，避免所有节点聚集在左上角
    bloodlineData.nodes.forEach(node => {
      if (!node.x || !node.y) {
        node.x = width / 2 + Math.random() * 100 - 50;
        node.y = height / 2 + Math.random() * 100 - 50;
      }
    });
    
    // 创建力导向模拟
    const simulation = d3.forceSimulation(bloodlineData.nodes)
      .force('link', d3.forceLink(bloodlineData.links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));
    
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
    
    // 数据源渐变
    defs.append('linearGradient')
      .attr('id', 'datasourceGradient')
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
    
    // 指标渐变
    defs.append('linearGradient')
      .attr('id', 'indicatorGradient')
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
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8');
    
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

    // 创建边组
    const linkGroup = g.append('g')
      .attr('class', 'link-group');
    
    // 创建边
    const link = linkGroup.append('g')
      .selectAll('line')
      .data(bloodlineData.links)
      .enter().append('line')
      .attr('class', 'sci-fi-link')
      .attr('stroke', 'url(#linkGradient)')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');
    
    // 创建关系标签
    const linkLabels = linkGroup.append('g')
      .selectAll('text')
      .data(bloodlineData.links)
      .enter().append('text')
      .attr('class', 'link-label')
      .style('display', 'block')
      .style('font-size', '10px')
      .style('fill', '#94a3b8')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.name);
    
    // 创建节点组
    const nodeGroup = g.append('g')
      .selectAll('g')
      .data(bloodlineData.nodes)
      .enter().append('g')
      .attr('class', d => `sci-fi-node ${d.type}-node`)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    // 添加节点圆圈
    nodeGroup.append('circle')
      .attr('r', d => d.isCurrent ? 30 : 25) // 当前节点稍大
      .attr('fill', d => d.isCurrent ? 'url(#modelGradient)' : d.type === 'datasource' ? 'url(#datasourceGradient)' : d.type === 'indicator' ? 'url(#indicatorGradient)' : 'url(#modelGradient)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);
    
    // 添加节点文本
    nodeGroup.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.isCurrent ? 4 : 3)
      .attr('font-size', d => d.isCurrent ? 12 : 11)
      .attr('fill', 'white');
    
    // 查找相关节点的函数
    const findRelatedNodes = (nodeId) => {
      const relatedNodeIds = new Set();
      relatedNodeIds.add(nodeId);
      
      // 查找直接连接的节点
      bloodlineData.links.forEach(link => {
        if (link.source.id === nodeId || link.target.id === nodeId) {
          relatedNodeIds.add(link.source.id);
          relatedNodeIds.add(link.target.id);
        }
      });
      
      return relatedNodeIds;
    };
    
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
    
    // 鼠标点击事件处理
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
          // 单击事件：显示节点信息抽屉
          setHoveredModel(d);
          setIsDrawerVisible(!isDrawerVisible);
          timerRef.current = null;
        }, 300);
      }
    });
    
    // 双击事件处理
    nodeGroup.on('dblclick', (event, d) => {
      event.stopPropagation();
      // 如果有定时器，清除它，防止单击事件执行
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // 双击事件：跳转到模型详情页
      if (d.type === 'model') {
        // 使用originalId如果存在，否则使用id
        const modelId = d.originalId !== undefined ? d.originalId : d.id;
        window.location.href = `/model/${modelId}`;
      }
    });
    
    // 添加画布点击事件，点击空白处收起信息窗
    svg.on('click', () => {
      setIsDrawerVisible(false);
    });
    
    // 更新位置
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      linkLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2 - 5);
      
      nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
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
  }, [bloodlineData]);

  return (
    <div className="bloodline-analyzer">
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>血缘分析</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            className={bloodlineType === 'forward' ? 'active' : ''}
            onClick={() => setBloodlineType('forward')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: bloodlineType === 'forward' ? '#007bff' : '#fff',
              color: bloodlineType === 'forward' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            正向血缘
          </button>
          <button 
            className={bloodlineType === 'reverse' ? 'active' : ''}
            onClick={() => setBloodlineType('reverse')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: bloodlineType === 'reverse' ? '#007bff' : '#fff',
              color: bloodlineType === 'reverse' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            反向血缘
          </button>
          <button 
            className={bloodlineType === 'endToEnd' ? 'active' : ''}
            onClick={() => setBloodlineType('endToEnd')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: bloodlineType === 'endToEnd' ? '#007bff' : '#fff',
              color: bloodlineType === 'endToEnd' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            端到端血缘
          </button>
          <button 
            className={bloodlineType === 'impact' ? 'active' : ''}
            onClick={() => setBloodlineType('impact')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: bloodlineType === 'impact' ? '#007bff' : '#fff',
              color: bloodlineType === 'impact' ? '#fff' : '#333',
              cursor: 'pointer'
            }}
          >
            影响分析
          </button>
        </div>
      </div>
      
      <div ref={containerRef} style={{ width: '100%', height: 'calc(100vh - 200px)', backgroundColor: '#fff' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      </div>
      
      {/* 节点信息抽屉 */}
      <HoverDrawer
        hoveredModel={hoveredModel}
        isDrawerVisible={isDrawerVisible}
        allData={allData || { models: [], properties: [] }}
        relations={relations || []}
        onClose={() => setIsDrawerVisible(false)}
      />
    </div>
  );
};

export default BloodlineAnalyzer;