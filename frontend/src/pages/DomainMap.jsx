import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'

const DomainMap = () => {
  const [domains, setDomains] = useState([])
  const [edges, setEdges] = useState([])
  const [hoveredDomain, setHoveredDomain] = useState(null)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newDomain, setNewDomain] = useState({ name: '', description: '', owner: '' })
  const [isExpanded, setIsExpanded] = useState(false)
  const [allData, setAllData] = useState({ domains: [], models: [], edges: [] })
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const timerRef = useRef(null)

  // 从API获取数据
  useEffect(() => {
    // 获取域数据
    fetch('/api/domain/list')
      .then(response => response.json())
      .then(domainData => {
        // 获取模型数据
        fetch('/api/model')
          .then(response => response.json())
          .then(modelData => {
            setAllData({
              domains: domainData.domains,
              models: modelData,
              edges: domainData.edges
            })
            setDomains(domainData.domains)
            setEdges(domainData.edges)
          })
          .catch(error => console.error('Failed to fetch models:', error))
      })
      .catch(error => console.error('Failed to fetch domains:', error))
  }, [])

  // 使用D3渲染力导向图
  useEffect(() => {
    if (!svgRef.current || allData.domains.length === 0) return

    const svg = d3.select(svgRef.current)
    const container = d3.select(containerRef.current)
    const width = container.node().clientWidth
    const height = container.node().clientHeight

    // 清除旧的图形
    svg.selectAll('*').remove()

    // 准备数据
    let nodes = [...allData.domains]
    let links = [...allData.edges]

    if (isExpanded) {
      // 展开到模型级别
      nodes = [...nodes, ...allData.models]
      
      // 添加域到模型的边
      allData.models.forEach(model => {
        links.push({
          source: model.domainId,
          target: model.id
        })
      })
      
      // 添加模型之间的边（如果有）
      // 这里假设模型之间的边也在edges数据中
    }

    // 创建力导向模拟
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(isExpanded ? 100 : 150))
      .force('charge', d3.forceManyBody().strength(isExpanded ? -300 : -500))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // 创建边
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)

    // 创建节点
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.domainId ? 25 : 30) // 模型节点小一些
      .attr('fill', d => d.domainId ? '#52c41a' : '#1890ff') // 模型节点绿色，域节点蓝色
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // 节点文本
    const nodeText = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.domainId ? 3 : 4)
      .attr('font-size', d => d.domainId ? 11 : 12)
      .attr('fill', 'white')
      .style('pointer-events', 'none')

    // 鼠标事件处理
    node.on('click', (event, d) => {
      event.stopPropagation()
      if (d.domainId) {
        // 模型节点，显示详情
        setHoveredDomain(d)
        setIsDrawerVisible(!isDrawerVisible)
      } else {
        // 域节点，显示详情
        setHoveredDomain(d)
        setIsDrawerVisible(!isDrawerVisible)
      }
    })

    node.on('dblclick', (event, d) => {
      event.stopPropagation()
      if (d.domainId) {
        // 模型节点，跳转到模型详情
        window.location.href = `/model/${d.id}`
      } else {
        // 域节点，跳转到域工作台
        window.location.href = `/domain/${d.id}`
      }
    })

    // 力导向模拟更新
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      nodeText
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    })

    // 拖拽函数
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // 窗口大小变化时重新绘制
    const handleResize = () => {
      const newWidth = container.node().clientWidth
      const newHeight = container.node().clientHeight
      svg.attr('width', newWidth).attr('height', newHeight)
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2))
      simulation.alpha(0.3).restart()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [allData, isExpanded])

  // 处理新建域
  const handleCreateDomain = () => {
    fetch('/api/domain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newDomain)
    })
      .then(response => response.json())
      .then(domain => {
        setDomains([...domains, domain])
        setIsModalOpen(false)
        setNewDomain({ name: '', description: '', owner: '' })
      })
      .catch(error => console.error('Failed to create domain:', error))
  }

  // 处理导出
  const handleExport = () => {
    const data = {
      domains,
      edges
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'domains.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault()
        setIsModalOpen(true)
      } else if (event.ctrlKey && event.key === 'e') {
        event.preventDefault()
        handleExport()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [domains, edges])

  return (
    <div className="domain-map">
      {/* 面包屑 */}
      <div style={{ padding: '12px 16px', backgroundColor: '#f0f2f5', borderBottom: '1px solid #e0e0e0' }}>
        <span style={{ cursor: 'pointer', color: '#1890ff' }}>业务域地图</span>
      </div>
      
      {/* 头部工具栏 */}
      <div className="header-toolbar">
        <input
          type="text"
          placeholder="搜索域名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '收起模型' : '展开到模型级别'}
        </button>
        <button onClick={() => setIsModalOpen(true)}>新建域</button>
        <button onClick={handleExport}>导出</button>
      </div>

      {/* 画布容器 */}
      <div ref={containerRef} className="canvas-container">
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </div>

      {/* 悬停抽屉 */}
      <div className={`hover-drawer ${isDrawerVisible ? 'visible' : ''}`}>
        {hoveredDomain && (
          <div style={{ padding: '16px' }}>
            <h3>{hoveredDomain.name}</h3>
            <p>描述: {hoveredDomain.description}</p>
            <p>负责人: {hoveredDomain.owner}</p>
            <p>最近变更: {hoveredDomain.updatedAt}</p>
            <button
              style={{ marginTop: '16px', width: '100%' }}
              onClick={() => window.location.href = `/domain/${hoveredDomain.id}`}
            >
              进入该域
            </button>
          </div>
        )}
      </div>

      {/* 新建域模态框 */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>新建业务域</h2>
            <div className="form-group">
              <label>名称</label>
              <input
                type="text"
                value={newDomain.name}
                onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={newDomain.description}
                onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })}
              ></textarea>
            </div>
            <div className="form-group">
              <label>负责人</label>
              <input
                type="text"
                value={newDomain.owner}
                onChange={(e) => setNewDomain({ ...newDomain, owner: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button className="cancel" onClick={() => setIsModalOpen(false)}>取消</button>
              <button className="submit" onClick={handleCreateDomain}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DomainMap