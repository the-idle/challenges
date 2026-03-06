import React, { useEffect, useMemo, useRef } from 'react';
import { Modal, Tabs, Descriptions, Card, Timeline } from 'antd';
import * as echarts from 'echarts';

const DeviceDetail = ({ visible, device, onClose }) => {
  // 模拟历史数据
  const historyData = useMemo(() => [
    { time: '08:00', temperature: 45, vibration: 2.1 },
    { time: '09:00', temperature: 47, vibration: 2.3 },
    { time: '10:00', temperature: 46, vibration: 2.2 },
    { time: '11:00', temperature: 48, vibration: 2.4 },
    { time: '12:00', temperature: 50, vibration: 2.6 },
    { time: '13:00', temperature: 49, vibration: 2.5 },
    { time: '14:00', temperature: 47, vibration: 2.3 },
  ], []);

  // 模拟维护记录
  const maintenanceRecords = [
    { time: '2025-05-28', action: '定期检修', operator: '张工程师' },
    { time: '2025-05-15', action: '更换轴承', operator: '李技术员' },
    { time: '2025-05-01', action: '系统校准', operator: '王维修师' },
  ];

  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    const option = {
      animation: false, // 关闭初始动画
      grid: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 60,
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      xAxis: {
        type: 'category',
        data: historyData.map(item => item.time),
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '温度 (℃)',
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#ddd'
          }
        }
      },
      series: [{
        name: '温度',
        type: 'line',
        data: historyData.map(item => item.temperature),
        smooth: true,
        lineStyle: {
          color: '#4fc3f7',
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#4fc3f7'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(79,195,247,0.3)' },
            { offset: 1, color: 'rgba(79,195,247,0.1)' }
          ])
        }
      }]
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [historyData]);

  const items = [
    {
      key: '1',
      label: '实时数据',
      children: (
        <div style={{ padding: '16px' }}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="设备ID">{device?.id}</Descriptions.Item>
            <Descriptions.Item label="设备名称">{device?.name}</Descriptions.Item>
            <Descriptions.Item label="运行状态">
              <span style={{ 
                color: device?.status === 'normal' ? '#52c41a' : 
                       device?.status === 'warning' ? '#faad14' : '#f5222d' 
              }}>
                {device?.status === 'normal' ? '正常' : 
                 device?.status === 'warning' ? '警告' : '故障'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="当前温度">{device?.temperature}℃</Descriptions.Item>
            <Descriptions.Item label="振动强度">{device?.vibration} m/s²</Descriptions.Item>
            <Descriptions.Item label="故障类型">{device?.type || '-'}</Descriptions.Item>
            <Descriptions.Item label="诊断时间" span={2}>{device?.diagnosisTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="根因分析" span={2}>{device?.rootCause || '-'}</Descriptions.Item>
            <Descriptions.Item label="处置建议" span={2}>{device?.recommendation || '-'}</Descriptions.Item>
            <Descriptions.Item label="运行时长" span={2}>168小时</Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: '2',
      label: '历史趋势',
      children: (
        <div style={{ padding: '16px' }}>
          <Card title="温度趋势" variant="borderless">
            <div ref={chartRef} style={{ height: '300px', width: '100%' }} />
          </Card>
        </div>
      ),
    },
    {
      key: '3',
      label: '维护记录',
      children: (
        <div style={{ padding: '16px' }}>
          <Timeline
            items={maintenanceRecords.map(record => ({
              children: (
                <div>
                  <p style={{ margin: 0 }}><strong>{record.time}</strong></p>
                  <p style={{ margin: '4px 0' }}>{record.action}</p>
                  <p style={{ margin: 0, color: '#666' }}>操作人：{record.operator}</p>
                </div>
              ),
            }))}
          />
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="设备详情"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </Modal>
  );
};

export default DeviceDetail;
