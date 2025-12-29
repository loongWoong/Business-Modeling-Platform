import React, { useState, useEffect, useRef } from 'react';
import { Card, Tabs, Button, Space, Tag, Tooltip, message, Spin, Empty } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import * as d3 from 'd3';
import { lineageAPI, modelAPI } from '../../../services/api';

/**
 * LineageView - 数据血缘可视化组件
 * 
 * 参考 Palantir Foundry 的数据血缘可视化
 * 支持正向、反向、端到端三种视图
 */
const LineageView = ({ modelId }) => {
  const [lineageData, setLineageData] = useState([]);
  const [models, setModels] = useState(new Map());
  const [activeTab, setActiveTab] = useState('forward');
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (modelId) {
      loadLineageData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId, activeTab]);

  useEffect(() => {
    if (lineageData.length > 0) {
      drawGraph();
    }
  }, [lineageData, activeTab]);

  const loadLineageData = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (activeTab === 'forward') {
        data = await lineageAPI.getForward(modelId);
      } else if (activeTab === 'reverse') {
        data = await lineageAPI.getReverse(modelId);
      } else {
        data = await lineageAPI.getEndToEnd(modelId);
      }

      setLineageData(data || []);

      // 加载相关模型信息
      const modelIds = new Set();
      data.forEach(item => {
        modelIds.add(item.sourceModelId);
        modelIds.add(item.targetModelId);
      });

      const modelPromises = Array.from(modelIds).map(id => 
        modelAPI.getById(id).catch(() => null)
      );
      const modelResults = await Promise.all(modelPromises);
      
      const modelMap = new Map();
      modelResults.forEach(result => {
        if (result && result.model) {
          modelMap.set(result.model.id, result.model);
        }
      });
      setModels(modelMap);
    } catch (error) {
      console.error('Failed to load lineage data:', error);
      message.error('加载数据血缘失败');
    } finally {
      setLoading(false);
    }
  };

  const drawGraph = () => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.max(600, container.clientHeight || 600);

    // 清空之前的图形
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // 创建节点和边的数据结构
    const nodes = new Map();
    const links = [];

    // 添加当前模型节点
    nodes.set(modelId, { id: modelId, type: 'current' });

    lineageData.forEach(item => {
      // 添加源节点
      if (!nodes.has(item.sourceModelId)) {
        nodes.set(item.sourceModelId, { 
          id: item.sourceModelId, 
          type: activeTab === 'reverse' ? 'target' : 'source',
          lineage: item
        });
      }

      // 添加目标节点
      if (!nodes.has(item.targetModelId)) {
        nodes.set(item.targetModelId, { 
          id: item.targetModelId, 
          type: activeTab === 'forward' ? 'target' : 'source',
          lineage: item
        });
      }

      // 添加边
      links.push({
        source: item.sourceModelId,
        target: item.targetModelId,
        lineage: item
      });
    });

    const nodeArray = Array.from(nodes.values());
    const linkArray = links;

    if (nodeArray.length === 0) {
      return;
    }

    // 创建力导向图
    const simulation = d3.forceSimulation(nodeArray)
      .force('link', d3.forceLink(linkArray).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // 绘制边
    const link = svg.append('g')
      .selectAll('line')
      .data(linkArray)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => d.lineage.confidenceScore ? d.lineage.confidenceScore * 3 : 2)
      .attr('marker-end', 'url(#arrowhead)');

    // 绘制箭头
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // 绘制节点
    const node = svg.append('g')
      .selectAll('g')
      .data(nodeArray)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // 节点圆圈
    node.append('circle')
      .attr('r', d => d.type === 'current' ? 20 : 15)
      .attr('fill', d => {
        if (d.type === 'current') return '#1890ff';
        if (d.type === 'target') return '#52c41a';
        return '#faad14';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
      });

    // 节点标签
    node.append('text')
      .text(d => {
        const model = models.get(d.id);
        return model ? model.name : `模型 ${d.id}`;
      })
      .attr('dx', d => d.type === 'current' ? 25 : 20)
      .attr('dy', 5)
      .attr('font-size', '12px')
      .attr('fill', '#333');

    // 更新位置
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

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
  };

  const handleRefresh = () => {
    loadLineageData();
  };

  return (
    <Card
      title={
        <Space>
          <span>数据血缘</span>
          <Button 
            icon={<ReloadOutlined />} 
            size="small" 
            onClick={handleRefresh}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      }
      extra={
        selectedNode && (
          <Space>
            <Tag color="blue">选中: {models.get(selectedNode.id)?.name || `模型 ${selectedNode.id}`}</Tag>
            <Button size="small" onClick={() => setSelectedNode(null)}>清除选择</Button>
          </Space>
        )
      }
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'forward',
            label: (
              <span>
                <ArrowRightOutlined /> 正向血缘（下游）
              </span>
            ),
            children: (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <Tag color="blue">当前模型</Tag>
                    <ArrowRightOutlined />
                    <Tag color="green">下游模型</Tag>
                  </Space>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    显示数据流向：当前模型 → 下游模型
                  </div>
                </div>
                {loading ? (
                  <Spin tip="加载中..." />
                ) : lineageData.length === 0 ? (
                  <Empty description="暂无正向血缘关系" />
                ) : (
                  <div ref={containerRef} style={{ width: '100%', height: '600px', border: '1px solid #e0e0e0' }}>
                    <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
                  </div>
                )}
              </>
            )
          },
          {
            key: 'reverse',
            label: (
              <span>
                <ArrowLeftOutlined /> 反向血缘（上游）
              </span>
            ),
            children: (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <Tag color="orange">上游模型</Tag>
                    <ArrowRightOutlined />
                    <Tag color="blue">当前模型</Tag>
                  </Space>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    显示数据来源：上游模型 → 当前模型
                  </div>
                </div>
                {loading ? (
                  <Spin tip="加载中..." />
                ) : lineageData.length === 0 ? (
                  <Empty description="暂无反向血缘关系" />
                ) : (
                  <div ref={containerRef} style={{ width: '100%', height: '600px', border: '1px solid #e0e0e0' }}>
                    <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
                  </div>
                )}
              </>
            )
          },
          {
            key: 'endToEnd',
            label: (
              <span>
                <SearchOutlined /> 端到端血缘
              </span>
            ),
            children: (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Space>
                    <Tag color="orange">上游</Tag>
                    <ArrowRightOutlined />
                    <Tag color="blue">当前</Tag>
                    <ArrowRightOutlined />
                    <Tag color="green">下游</Tag>
                  </Space>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    显示完整的数据流转路径
                  </div>
                </div>
                {loading ? (
                  <Spin tip="加载中..." />
                ) : lineageData.length === 0 ? (
                  <Empty description="暂无端到端血缘关系" />
                ) : (
                  <div ref={containerRef} style={{ width: '100%', height: '600px', border: '1px solid #e0e0e0' }}>
                    <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
                  </div>
                )}
              </>
            )
          }
        ]}
      />

      {selectedNode && (
        <Card 
          size="small" 
          title="节点详情" 
          style={{ marginTop: '16px' }}
        >
          <div>
            <div><strong>模型ID:</strong> {selectedNode.id}</div>
            <div><strong>模型名称:</strong> {models.get(selectedNode.id)?.name || '未知'}</div>
            {selectedNode.lineage && (
              <>
                <div><strong>置信度:</strong> {selectedNode.lineage.confidenceScore || 1.0}</div>
                <div><strong>自动发现:</strong> {selectedNode.lineage.isAutoDiscovered ? '是' : '否'}</div>
                {selectedNode.lineage.description && (
                  <div><strong>描述:</strong> {selectedNode.lineage.description}</div>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </Card>
  );
};

export default LineageView;
