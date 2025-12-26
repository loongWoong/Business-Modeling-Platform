import React from 'react';
import { Modal, Button } from 'antd';

const ConfirmDialog = ({ confirmDialog, closeConfirmDialog }) => {
  if (!confirmDialog.show) return null;

  return (
    <Modal
      title={confirmDialog.title}
      open={confirmDialog.show}
      onCancel={closeConfirmDialog}
      footer={[
        <Button key="cancel" onClick={closeConfirmDialog}>
          取消
        </Button>,
        <Button key="confirm" type="primary" danger onClick={confirmDialog.onConfirm}>
          确认删除
        </Button>
      ]}
    >
      <p>{confirmDialog.message}</p>
    </Modal>
  );
};

export default ConfirmDialog;