import React, { useEffect } from 'react';
import { message } from 'antd';

const Notification = ({ notification }) => {
  useEffect(() => {
    if (notification.show) {
      if (notification.type === 'success') {
        message.success(notification.message);
      } else if (notification.type === 'error') {
        message.error(notification.message);
      } else if (notification.type === 'warning') {
        message.warning(notification.message);
      } else {
        message.info(notification.message);
      }
    }
  }, [notification]);

  return null;
};

export default Notification;