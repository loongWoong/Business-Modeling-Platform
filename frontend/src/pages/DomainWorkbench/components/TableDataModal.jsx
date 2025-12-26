import React from 'react';
import { Modal, Table, Button, Input } from 'antd';

const TableDataModal = ({ 
  isOpen, 
  onClose, 
  datasourceName, 
  tableName, 
  tableData = [], 
  columns = [],
  loading 
}) => {
  return (
    <Modal
      title={`${datasourceName} - ${tableName}`}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
      width={800}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' }
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h4>表数据</h4>
      </div>
      
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        loading={loading}
        rowKey={(record, index) => index}
        size="middle"
      />
    </Modal>
  );
};

export default TableDataModal;