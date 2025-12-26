import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import ForceDirectedGraph from './ForceDirectedGraph';
import ERDiagram from './ERDiagram';
import UMLDiagram from './UMLDiagram';

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
  const [displayMode, setDisplayMode] = useState('force-directed'); // 'force-directed', 'er-diagram' or 'uml'

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
    
    // 创建关系ID映射，用于快速查找关系信息
    // 后端返回的关系使用 sourceModelId 和 targetModelId
    const relationMap = new Map();
    relations.forEach(relation => {
      const key = `${relation.sourceModelId || relation.sourceModel}_${relation.targetModelId || relation.targetModel}`;
      relationMap.set(key, relation);
    });
    
    allData.edges.forEach(edge => {
      if (modelIds.has(edge.source) && modelIds.has(edge.target)) {
        // 使用ID匹配关系（兼容旧格式）
        const relationKey = `${edge.source}_${edge.target}`;
        const relation = relationMap.get(relationKey) || 
          relations.find(r => 
            (r.sourceModelId === edge.source && r.targetModelId === edge.target) ||
            (r.sourceModel === modelIdToName[edge.source] && r.targetModel === modelIdToName[edge.target])
          );
        
        links.push({
          source: `model_${edge.source}`,
          target: `model_${edge.target}`,
          relationName: relation ? relation.name : '关联',
          relationType: relation ? relation.type : 'one-to-many',
          relationId: relation ? relation.id : null
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
      // 调用外部力导向图组件
      const simulation = ForceDirectedGraph({
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
      });

    
    } else if (displayMode === 'er-diagram') {
      // ER图渲染逻辑
      // 调用外部ER图组件
      ERDiagram({
        g,
        nodes,
        links,
        modelProperties,
        showRelations,
        setHoveredModel,
        setIsDrawerVisible,
        isDrawerVisible,
        timerRef,
        isPropertyExpanded
      });
    } else if (displayMode === 'uml') {
      // UML类图渲染逻辑
      // 调用外部UML类图组件
      UMLDiagram({
        g,
        nodes,
        links,
        modelProperties,
        showRelations,
        setHoveredModel,
        setIsDrawerVisible,
        isDrawerVisible,
        timerRef,
        isPropertyExpanded
      });
    }
      
      // 窗口大小变化时重新绘制 - 统一处理所有模式
      const handleResize = () => {
        const newWidth = container.node().clientWidth;
        const newHeight = container.node().clientHeight;
        svg.attr('width', newWidth).attr('height', newHeight);
      };
      
      // 键盘事件处理函数 - 控制ER图上下左右挪动
      const handleKeyDown = (event) => {
        // 只有当ER图容器有焦点时才处理
        const containerElement = container.node();
        if (!containerElement) return;
        
        const scrollSpeed = 20; // 滚动速度
        
        switch (event.key) {
          case 'ArrowUp':
            containerElement.scrollTop -= scrollSpeed;
            event.preventDefault();
            break;
          case 'ArrowDown':
            containerElement.scrollTop += scrollSpeed;
            event.preventDefault();
            break;
          case 'ArrowLeft':
            containerElement.scrollLeft -= scrollSpeed;
            event.preventDefault();
            break;
          case 'ArrowRight':
            containerElement.scrollLeft += scrollSpeed;
            event.preventDefault();
            break;
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // 为ER图容器添加键盘事件监听
      const containerElement = container.node();
      if (containerElement) {
        containerElement.addEventListener('keydown', handleKeyDown);
        containerElement.tabIndex = 0; // 使容器可以获取焦点
        containerElement.focus(); // 自动获取焦点
      }
      
      return () => {
        window.removeEventListener('resize', handleResize);
        // 移除键盘事件监听
        if (containerElement) {
          containerElement.removeEventListener('keydown', handleKeyDown);
        }
      };
  }, [allData, isPropertyExpanded, activeTab, searchTerm, showRelations, displayMode]);

  // 切换显示模式
  const toggleDisplayMode = () => {
    // 循环切换三种显示模式
    if (displayMode === 'force-directed') {
      setDisplayMode('er-diagram');
    } else if (displayMode === 'er-diagram') {
      setDisplayMode('uml');
    } else {
      setDisplayMode('force-directed');
    }
  };
  
  // 直接切换到指定模式
  const switchToMode = (mode) => {
    setDisplayMode(mode);
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
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => switchToMode('force-directed')}
          style={{
            padding: '8px 16px',
            backgroundColor: displayMode === 'force-directed' ? '#10b981' : '#e2e8f0',
            color: displayMode === 'force-directed' ? 'white' : '#334155',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          力导向图
        </button>
        <button
          onClick={() => switchToMode('er-diagram')}
          style={{
            padding: '8px 16px',
            backgroundColor: displayMode === 'er-diagram' ? '#3b82f6' : '#e2e8f0',
            color: displayMode === 'er-diagram' ? 'white' : '#334155',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ER图
        </button>
        <button
          onClick={() => switchToMode('uml')}
          style={{
            padding: '8px 16px',
            backgroundColor: displayMode === 'uml' ? '#2563eb' : '#e2e8f0',
            color: displayMode === 'uml' ? 'white' : '#334155',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          UML图
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
        当前显示模式: {displayMode === 'force-directed' ? '力导向图' : 
                      displayMode === 'er-diagram' ? 'ER图' : 'UML图'}
      </div>
    </div>
  );
};

export default ModelMap;