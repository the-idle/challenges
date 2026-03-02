import { useEffect, useRef } from 'react';
import {
  Modal,
  Spin,
  Card,
  Tabs,
  Row,
  Col,
  Space,
  Select,
  Button,
  Typography,
  Divider,
  Statistic,
  Progress
} from 'antd';
import {
  ReloadOutlined,
  ToolOutlined,
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import { generateMockDataset, getStatusColor, getStatusText } from './mockData';

const { Option } = Select;
const { Text } = Typography;

const DeviceDetailModal = ({
  visible,
  onCancel,
  deviceDetail,
  loading,
  timeRange,
  onTimeRangeChange,
  onRefreshData,
  onMaintenance,
  onExportData,
}) => {
  // 添加新图表的引用
  const powerChartRef = useRef(null);
  const efficiencyChartRef = useRef(null);
  const pressureChartRef = useRef(null);
  const humidityChartRef = useRef(null);

  // 添加模拟数据
  const mockData = generateMockDataset(timeRange);

  // 初始化新增的图表
  useEffect(() => {
    if (!loading && visible && mockData) {
      // 初始化功率图表
      if (powerChartRef.current) {
        const powerChart = echarts.init(powerChartRef.current);
        powerChart.setOption({
          title: {
            text: '功率使用率监控',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            formatter: '{b}<br />{a}: {c}%'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: mockData.timeData
          },
          yAxis: {
            type: 'value',
            name: '功率 (%)',
            min: 70,
            max: 100,
            axisLabel: {
              formatter: '{value} %'
            }
          },
          series: [{
            name: '功率使用率',
            type: 'line',
            data: mockData.power.data,
            smooth: true,
            markLine: {
              data: [
                { yAxis: mockData.power.warning, lineStyle: { color: '#FF4D4F' }, label: { formatter: '警戒线' } }
              ]
            },
            lineStyle: {
              width: 3,
              color: '#722ED1'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(114, 46, 209, 0.3)' },
                  { offset: 1, color: 'rgba(114, 46, 209, 0.1)' }
                ]
              }
            }
          }]
        });

        // 监听窗口大小变化
        const handleResize = () => powerChart.resize();
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
          powerChart.dispose();
        };
      }
    }
  }, [loading, visible, mockData]);

  // 初始化效率图表
  useEffect(() => {
    if (!loading && visible && mockData && efficiencyChartRef.current) {
      const efficiencyChart = echarts.init(efficiencyChartRef.current);
      efficiencyChart.setOption({
        title: {
          text: '设备效率监控',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br />{a}: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: mockData.timeData
        },
        yAxis: {
          type: 'value',
          name: '效率 (%)',
          min: 60,
          max: 100,
          axisLabel: {
            formatter: '{value} %'
          }
        },
        series: [{
          name: '设备效率',
          type: 'line',
          data: mockData.efficiency.data,
          smooth: true,
          markLine: {
            data: [
              { yAxis: mockData.efficiency.warning, lineStyle: { color: '#FAAD14' }, label: { formatter: '警戒线' } }
            ]
          },
          lineStyle: {
            width: 3,
            color: '#1890FF'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ]
            }
          }
        }]
      });

      const handleResize = () => efficiencyChart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        efficiencyChart.dispose();
      };
    }
  }, [loading, visible, mockData]);

  // 初始化压力图表
  useEffect(() => {
    if (!loading && visible && mockData && pressureChartRef.current) {
      const pressureChart = echarts.init(pressureChartRef.current);
      pressureChart.setOption({
        title: {
          text: '系统压力监控',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br />{a}: {c} MPa'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: mockData.timeData
        },
        yAxis: {
          type: 'value',
          name: '压力 (MPa)',
          axisLabel: {
            formatter: '{value} MPa'
          }
        },
        series: [{
          name: '系统压力',
          type: 'line',
          data: mockData.pressure.data,
          smooth: true,
          markLine: {
            data: [
              { yAxis: mockData.pressure.warning, lineStyle: { color: '#FAAD14' }, label: { formatter: '警戒线' } },
              { yAxis: mockData.pressure.alert, lineStyle: { color: '#FF4D4F' }, label: { formatter: '报警线' } }
            ]
          },
          lineStyle: {
            width: 3,
            color: '#13C2C2'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(19, 194, 194, 0.3)' },
                { offset: 1, color: 'rgba(19, 194, 194, 0.1)' }
              ]
            }
          }
        }]
      });

      const handleResize = () => pressureChart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        pressureChart.dispose();
      };
    }
  }, [loading, visible, mockData]);

  // 初始化湿度图表
  useEffect(() => {
    if (!loading && visible && mockData && humidityChartRef.current) {
      const humidityChart = echarts.init(humidityChartRef.current);
      humidityChart.setOption({
        title: {
          text: '环境湿度监控',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br />{a}: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: mockData.timeData
        },
        yAxis: {
          type: 'value',
          name: '湿度 (%)',
          axisLabel: {
            formatter: '{value} %'
          }
        },
        series: [{
          name: '环境湿度',
          type: 'line',
          data: mockData.humidity.data,
          smooth: true,
          markLine: {
            data: [
              { yAxis: mockData.humidity.warning, lineStyle: { color: '#FAAD14' }, label: { formatter: '警戒线' } }
            ]
          },
          lineStyle: {
            width: 3,
            color: '#EB2F96'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(235, 47, 150, 0.3)' },
                { offset: 1, color: 'rgba(235, 47, 150, 0.1)' }
              ]
            }
          }
        }]
      });

      const handleResize = () => humidityChart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        humidityChart.dispose();
      };
    }
  }, [loading, visible, mockData]);
  // 渲染详情面板
  const renderDetailPanel = () => {
    if (!deviceDetail) {
      return <Spin tip="加载中..." />;
    }

    return (
      <Card title={`设备详情: ${deviceDetail.name}`} bordered={false}>
        <Tabs
          defaultActiveKey="realtime"
          items={[
            {
              key: 'realtime',
              label: '实时数据',
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Space style={{ marginBottom: 16 }}>
                        <Text>时间范围:</Text>
                        <Select
                          value={timeRange}
                          onChange={onTimeRangeChange}
                          style={{ width: 120 }}
                        >
                          <Option value="1h">1小时</Option>
                          <Option value="24h">24小时</Option>
                          <Option value="7d">7天</Option>
                        </Select>
                        <Button
                          type="primary"
                          icon={<ReloadOutlined />}
                          onClick={onRefreshData}
                        >
                          刷新数据
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="当前温度"
                          value={mockData.temperature.data[mockData.temperature.data.length - 1]}
                          suffix="°C"
                          valueStyle={{
                            color: getStatusColor(
                              mockData.temperature.data[mockData.temperature.data.length - 1],
                              mockData.temperature.warning,
                              mockData.temperature.alert
                            )
                          }}
                          prefix={<DashboardOutlined />}
                        />
                        <Text type={mockData.temperature.data[mockData.temperature.data.length - 1] >= mockData.temperature.warning ? 'danger' : ''}>
                          状态: {getStatusText(
                            mockData.temperature.data[mockData.temperature.data.length - 1],
                            mockData.temperature.warning,
                            mockData.temperature.alert
                          )}
                        </Text>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="当前振动"
                          value={mockData.vibration.data[mockData.vibration.data.length - 1]}
                          suffix="m/s²"
                          valueStyle={{
                            color: getStatusColor(
                              mockData.vibration.data[mockData.vibration.data.length - 1],
                              mockData.vibration.warning,
                              mockData.vibration.alert
                            )
                          }}
                          prefix={<ArrowUpOutlined />}
                        />
                        <Text type={mockData.vibration.data[mockData.vibration.data.length - 1] >= mockData.vibration.warning ? 'danger' : ''}>
                          状态: {getStatusText(
                            mockData.vibration.data[mockData.vibration.data.length - 1],
                            mockData.vibration.warning,
                            mockData.vibration.alert
                          )}
                        </Text>
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="功率使用率"
                          value={mockData.power.data[mockData.power.data.length - 1]}
                          suffix="%"
                          valueStyle={{
                            color: getStatusColor(
                              mockData.power.data[mockData.power.data.length - 1],
                              mockData.power.warning,
                              mockData.power.alert
                            )
                          }}
                        />
                        <Progress
                          percent={mockData.power.data[mockData.power.data.length - 1]}
                          size="small"
                          status={mockData.power.data[mockData.power.data.length - 1] >= mockData.power.warning ? 'exception' : 'active'}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card>
                        <Statistic
                          title="设备效率"
                          value={mockData.efficiency.data[mockData.efficiency.data.length - 1]}
                          suffix="%"
                          valueStyle={{
                            color: getStatusColor(
                              mockData.efficiency.data[mockData.efficiency.data.length - 1],
                              mockData.efficiency.warning,
                              mockData.efficiency.alert
                            )
                          }}
                          prefix={<ArrowDownOutlined />}
                        />
                        <Progress
                          percent={mockData.efficiency.data[mockData.efficiency.data.length - 1]}
                          size="small"
                          status={mockData.efficiency.data[mockData.efficiency.data.length - 1] < mockData.efficiency.warning ? 'exception' : 'active'}
                        />
                      </Card>
                    </Col>
                  </Row>

                  <div style={{ marginTop: 16 }}>
                    <Row gutter={[16, 0]}>
                      <Col span={12}>
                        <div ref={powerChartRef} style={{ height: 250, width: '100%' }} />
                      </Col>
                      <Col span={12}>
                        <div ref={efficiencyChartRef} style={{ height: 250, width: '100%' }} />
                      </Col>
                    </Row>
                  </div>
                  <Divider />
                  <Row gutter={[16, 16]}>
                    <Col span={24} style={{ textAlign: 'center' }}>
                      <Space>
                        <Button
                          type="primary"
                          icon={<ToolOutlined />}
                          onClick={onMaintenance}
                          danger={deviceDetail.status === 'fault'}
                        >
                          立即维护
                        </Button>
                        <Button icon={<DownloadOutlined />} onClick={onExportData}>
                          导出数据
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'info',
              label: '设备信息',
              children: (
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card title="基本信息" bordered={false}>
                      <p><strong>设备ID:</strong> {deviceDetail.id}</p>
                      <p><strong>设备名称:</strong> {deviceDetail.name}</p>
                      <p><strong>设备型号:</strong> {deviceDetail.model}</p>
                      <p><strong>生产商:</strong> {deviceDetail.manufacturer}</p>
                      <p><strong>安装日期:</strong> {deviceDetail.installationDate}</p>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="运行信息" bordered={false}>
                      <p><strong>运行时间:</strong> {deviceDetail.metrics.power.history.length} 小时</p>
                      <p><strong>维护周期:</strong> {deviceDetail.nextMaintenance}</p>
                      <p><strong>上次维护:</strong> {deviceDetail.lastMaintenance}</p>
                      <p><strong>故障次数:</strong> {deviceDetail.alarms.length} 次</p>
                      <p><strong>预计剩余寿命:</strong> {deviceDetail.metrics.efficiency.history.length} 天</p>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'maintenance',
              label: '维护建议详情',
              children: (
                <div>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card title="当前状态" bordered={false}>
                        <p><strong>设备状态:</strong> 正常运行</p>
                        <p><strong>运行时长:</strong> 2160小时</p>
                        <p><strong>上次维护:</strong> 2024-05-15</p>
                        <p><strong>预计下次维护:</strong> 2024-07-15</p>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card title="维护建议" bordered={false}>
                        <p><strong>建议类型:</strong> 定期保养</p>
                        <p><strong>紧急程度:</strong> 中等</p>
                        <p><strong>预计成本:</strong> ¥2,800</p>
                        <p><strong>建议完成时间:</strong> 3天内</p>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card title="风险评估" bordered={false}>
                        <p><strong>潜在风险:</strong> 轴承磨损</p>
                        <p><strong>影响程度:</strong> 中等</p>
                        <p><strong>故障概率:</strong> 15%</p>
                        <p><strong>预计损失:</strong> ¥15,000/天</p>
                      </Card>
                    </Col>
                  </Row>

                </div>
              ),
            },
          ]}
        />
      </Card>
    );
  };

  return (
    <Modal
      title="设备详情"
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={null}
      styles={{
        body: {
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto'
        }
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : (
        renderDetailPanel()
      )}
    </Modal>
  );
};

export default DeviceDetailModal;
