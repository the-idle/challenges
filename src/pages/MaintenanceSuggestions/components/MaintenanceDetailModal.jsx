import React from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Steps,
  Typography,
  Alert,
  Space,
  Divider,
  Timeline
} from 'antd';
import {
  ToolOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

const MaintenanceDetailModal = ({ visible, onClose, suggestionData, maintenanceDetail }) => {
  if (!suggestionData || !maintenanceDetail) return null;

  return (
    <Modal
      title="维护建议详情"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      maskClosable={false}
      centered
      destroyOnClose
      styles={{
        body: {
          maxHeight: '80vh',
          overflow: 'auto'
        }
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 基本信息 */}
        <Descriptions bordered>
          <Descriptions.Item label="设备ID" span={1}>{suggestionData.deviceId}</Descriptions.Item>
          <Descriptions.Item label="设备名称" span={2}>{suggestionData.deviceName}</Descriptions.Item>
          <Descriptions.Item label="预测故障类型" span={1}>{suggestionData.faultType}</Descriptions.Item>
          <Descriptions.Item label="可信度" span={2}>
            {suggestionData.confidence}%
          </Descriptions.Item>
        </Descriptions>

        {/* 预警信息 */}
        <div>
          <Title level={5}>
            <WarningOutlined style={{ marginRight: 8 }} />
            故障预警
          </Title>
          <Alert
            message={`预计故障时间窗口：${maintenanceDetail.predictedFailure.timeWindow}`}
            description={
              <Space direction="vertical">
                <Text>可能性：{maintenanceDetail.predictedFailure.probability * 100}%</Text>
                <Text>影响程度：{maintenanceDetail.predictedFailure.impact}</Text>
              </Space>
            }
            type="warning"
            showIcon
          />
        </div>

        {/* 当前状态 */}
        <div>
          <Title level={5}>
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            当前状态
          </Title>
          <Descriptions bordered size="small">
            <Descriptions.Item label="温度">{maintenanceDetail.currentStatus.temperature}</Descriptions.Item>
            <Descriptions.Item label="振动">{maintenanceDetail.currentStatus.vibration}</Descriptions.Item>
            <Descriptions.Item label="噪音">{maintenanceDetail.currentStatus.noise}</Descriptions.Item>
            <Descriptions.Item label="上次检查时间" span={3}>
              {maintenanceDetail.currentStatus.lastInspection}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* 建议维护计划 */}
        <div>
          <Title level={5}>
            <ToolOutlined style={{ marginRight: 8 }} />
            建议维护计划
          </Title>
          <Steps direction="vertical" size="small">
            {maintenanceDetail.predictedFailure.suggestedActions.map((action, index) => (
              <Step
                key={index}
                title={action}
                status="process"
                icon={<ToolOutlined />}
              />
            ))}
          </Steps>
        </div>
      </Space>
    </Modal>
  );
};

export default MaintenanceDetailModal;
