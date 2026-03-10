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
        <div className="package-stat-item">
          <div className="package-stat-label">总订单数</div>
          <div className="package-stat-value">{packageStats.totalOrders}</div>
        </div>
        <div className="package-stat-item">
          <div className="package-stat-label">总销售药包数</div>
          <div className="package-stat-value success">{packageStats.totalItemsSold}</div>
        </div>
        <div className="package-stat-item">
          <div className="package-stat-label">待处理订单数</div>
          <div className="package-stat-value warning">{packageStats.pendingOrders}</div>
        </div>
        <div className="package-stat-item">
          <div className="package-stat-label">待处理药包数</div>
          <div className="package-stat-value warning">{packageStats.pendingItemsQuantity}</div>
        </div>
      </div>
    </div>
  );
};

export default EventFlow;
