import React from 'react';
import { HistoryOutlined } from '@ant-design/icons';

const EventFlow = ({ packageStats }) => {
  return (
    <div className="event-flow-container">
      <div className="event-flow-title">
        <HistoryOutlined />
        <span>药包抓取统计</span>
      </div>

      <div className="package-stats-grid">
        <div className="package-stat-item package-stat-item-primary">
          <div className="package-stat-label">总订单数量</div>
          <div className="package-stat-value">{packageStats.totalOrders}</div>
        </div>
        <div className="package-stat-item package-stat-item-success">
          <div className="package-stat-label">已抓取包数</div>
          <div className="package-stat-value success">{packageStats.totalPickedQuantity}</div>
        </div>
        <div className="package-stat-item package-stat-item-warning">
          <div className="package-stat-label">待处理订单</div>
          <div className="package-stat-value warning">{packageStats.pendingOrders}</div>
        </div>
        <div className="package-stat-item package-stat-item-warning">
          <div className="package-stat-label">待抓取包数</div>
          <div className="package-stat-value warning">{packageStats.pendingQuantity}</div>
        </div>
      </div>
    </div>
  );
};

export default EventFlow;
