import React from 'react';
import { Modal, List, Button } from 'antd';

const TableListModal = ({ 
  isOpen, 
  onClose, 
  datasourceName, 
  tables = [], 
  onTableClick 
}) => {
  return (
    <Modal
      title={`${datasourceName} - 数据表列表`}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
      width={600}
      styles={{
        body: { maxHeight: '60vh', overflowY: 'auto' }
      }}
    >
      {tables.length > 0 ? (
        <List
          dataSource={tables}
          renderItem={(table) => (
            <List.Item
              actions={[
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={() => onTableClick(table)}
                >
                  查看数据
                </Button>
              ]}
            >
              <List.Item.Meta
                title={table}
                description="点击查看数据"
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>该数据源没有数据表</p>
        </div>
      )}
    </Modal>
  );
};

export default TableListModal;