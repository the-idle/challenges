import React, { useState } from 'react';
import { Button, Modal, Select, message, Input } from 'antd';
import { ToolOutlined, DownloadOutlined } from '@ant-design/icons';

const OPERATOR_LIST = ['视觉算法工程师', '智能体开发工程师', '智能运维工程师', '智能制造工程师', ];

const OperationPanel = ({ maintenanceRecords, onExportData, selectedDevice, onAddMaintenance }) => {
  // 表格列定义
  const columns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      render: (text) => <span>{text.split(' ')[0]}</span>,
    },
    {
      title: '设备',
      dataIndex: 'deviceId',
      key: 'deviceId',
      render: (text) => <span>{text}</span>,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      render: (text) => <span>{text}</span>,
    },
    {
      title: '操作内容',
      dataIndex: 'action',
      key: 'action',
      render: (text) => <span>{text}</span>,
    },
  ];

  // 弹窗相关
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(undefined);
  const [actionText, setActionText] = useState('');

  const handleMaintenanceClick = () => {
    setModalVisible(true);
  };
  const handleModalOk = () => {
    if (!selectedOperator) {
      message.warning('请选择操作员');
      return;
    }
    if (!actionText.trim()) {
      message.warning('请填写操作内容');
      return;
    }
    // 新维护记录
    const newRecord = {
      id: 'maint-' + Date.now(),
      deviceId: selectedDevice?.deviceId || selectedDevice?.id || '',
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      operator: selectedOperator,
      action: actionText,
    };
    onAddMaintenance && onAddMaintenance(newRecord);
    setModalVisible(false);
    setSelectedOperator(undefined);
    setActionText('');
  };
  const handleModalCancel = () => {
    setModalVisible(false);
    setSelectedOperator(undefined);
    setActionText('');
  };

  return (
    <div className="operation-panel-container">
      <div className="panel-title">
        <ToolOutlined style={{ marginRight: '8px', fontSize: '18px', color: '#4fc3f7' }} />
        <span>操作面板</span>
      </div>

      <div className="operation-buttons">
        <Button
          type="primary"
          icon={<ToolOutlined />}
          className="operation-button"
          onClick={handleMaintenanceClick}
          disabled={!selectedDevice}
        >
          立即维护
        </Button>
        <Modal
          title="安排维护操作员"
          open={modalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okText="确认派单"
          cancelText="取消"
        >
          <div style={{ marginBottom: 16 }}>
            <span>选择操作员：</span>
            <Select
              style={{ width: 200, marginLeft: 8 }}
              placeholder="请选择操作员"
              value={selectedOperator}
              onChange={setSelectedOperator}
              options={OPERATOR_LIST.map(op => ({ label: op, value: op }))}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <span>操作内容：</span>
            <Input
              style={{ width: 280, marginLeft: 8 }}
              placeholder="请输入操作内容"
              value={actionText}
              onChange={e => setActionText(e.target.value)}
              maxLength={30}
            />
          </div>
          <div>设备：{selectedDevice?.deviceName || selectedDevice?.name || ''}</div>
          <div style={{ marginTop: 8 }}>故障：{selectedDevice?.summary || selectedDevice?.type || '无'}</div>
        </Modal>
        <Button
          icon={<DownloadOutlined />}
          className="operation-button"
          onClick={onExportData}
          style={{ borderColor: '#1890ff', color: '#1890ff' }}
        >
          导出数据
        </Button>
      </div>

      <div className="maintenance-records">
        <div className="enhanced-table-container">
          <div className="enhanced-table-header">
            <table className="enhanced-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.dataIndex}>{col.title}</th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <div className="enhanced-table-body">
            <table className="enhanced-table">
              <tbody>
                {maintenanceRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.time.split(' ')[0]}</td>
                    <td>{record.deviceId}</td>
                    <td>{record.operator}</td>
                    <td>{record.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .enhanced-table-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          border: 1px solid rgba(240, 240, 240, 0.8);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .enhanced-table-header {
          background-color: rgba(24, 144, 255, 0.1);
          border-bottom: 2px solid #1890ff;
        }
        
        .enhanced-table-body {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }
        
        .enhanced-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .enhanced-table th {
          padding: 12px 8px;
          text-align: center;
          font-weight: 500;
          color: #333;
          background-color: rgba(24, 144, 255, 0.1);
        }
        
        .enhanced-table td {
          padding: 10px 8px;
          text-align: center;
          border-bottom: 1px solid rgba(240, 240, 240, 0.8);
        }
        
        .enhanced-table tbody tr:hover {
          background-color: rgba(24, 144, 255, 0.05);
        }
        
        .enhanced-table tbody tr:nth-child(even) {
          background-color: rgba(250, 250, 250, 0.5);
        }
      `}</style>
    </div>
  );
};

export default OperationPanel;
