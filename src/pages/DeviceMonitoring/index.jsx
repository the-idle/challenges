import { useState, useEffect, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Dropdown,
  Space,
  Modal,
  Input,
  Typography,
} from 'antd';
import {
  FilterOutlined,
} from '@ant-design/icons';
import * as echarts from 'echarts';
import DeviceDetailModal from './components/DeviceDetailModal';
import MaintenanceModal from './components/MaintenanceModal';
import { getDeviceDetail, getDeviceList } from '@/api/devic'
const { Title } = Typography;

const DeviceMonitoring = () => {
  // 获取设备列表
  const [deviceList, setDeviceList] = useState([]);
  const fetchDeviceList = async () => {
    const res = await getDeviceList();
    if (res.code === 200) {
      // 为每个设备模拟 productionLine 和 lastMaintenance 字段
      const lines = ['A区-01', 'B区-02', 'C区-03', 'D区-04'];
      const today = new Date();
      const pad = n => n.toString().padStart(2, '0');
      const randomDate = () => {
        const d = new Date(today.getTime() - Math.floor(Math.random() * 30) * 24 * 3600 * 1000);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      };
      const withMockFields = res.rows.map((item, idx) => ({
        ...item,
        productionLine: item.productionLine || lines[idx % lines.length],
        lastMaintenance: item.lastMaintenance || randomDate(),
      }));
      setDeviceList(withMockFields);
    }
  }
  useEffect(() => {
    fetchDeviceList();
  }, []);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceDetail, setDeviceDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('1h');
  const [maintenanceVisible, setMaintenanceVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const temperatureChartRef = useRef(null);
  const vibrationChartRef = useRef(null);
  const modelContainerRef = useRef(null);

  const loadDeviceDetail = async (deviceId) => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const res = await getDeviceDetail(deviceId);
      if (res.code === 200) {
        setDeviceDetail(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时默认选中第一个设备
  useEffect(() => {
    if (deviceList.length > 0 && !selectedDevice) {
      const first = deviceList[0];
      setSelectedDevice(first);
      loadDeviceDetail(first.deviceId);
    }
  }, [deviceList, selectedDevice]);

  // 修改设备选择处理函数
  const handleDeviceSelect = async (device) => {
    setSelectedDevice(device);
    await loadDeviceDetail(device.deviceId);
    setDetailModalVisible(true);
  };

  // 初始化图表
  useEffect(() => {
    if (!loading && deviceDetail && temperatureChartRef.current && vibrationChartRef.current) {
      // 温度图表
      const tempChart = echarts.init(temperatureChartRef.current);
      tempChart.setOption({
        title: {
          text: '设备温度实时监控',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br />{a}: {c}°C'
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
          data: deviceDetail.metrics.temperature.history.map(item => item.time)
        },
        yAxis: {
          type: 'value',
          name: '温度 (°C)',
          axisLabel: {
            formatter: '{value} °C'
          }
        },
        series: [
          {
            name: '温度',
            type: 'line',
            smooth: true,
            data: deviceDetail.metrics.temperature.history.map(item => item.value),
            markPoint: {
              data: [
                { type: 'max', name: '最高温度' },
                { type: 'min', name: '最低温度' }
              ]
            },
            markLine: {
              data: [
                { type: 'average', name: '平均温度' },
                {
                  yAxis: deviceDetail.metrics.temperature.warning,
                  lineStyle: { color: '#FF4D4F' },
                  label: { formatter: '警戒线: ' + deviceDetail.metrics.temperature.warning + '°C', position: 'end' }
                }
              ]
            },
            lineStyle: {
              width: 3,
              color: '#0A1F3C'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(10, 31, 60, 0.3)' },
                  { offset: 1, color: 'rgba(10, 31, 60, 0.1)' }
                ]
              }
            }
          }
        ]
      });

      // 振动图表
      const vibrationChart = echarts.init(vibrationChartRef.current);
      vibrationChart.setOption({
        title: {
          text: '设备振动实时监控',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br />{a}: {c} m/s²'
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
          data: deviceDetail.metrics.vibration.history.map(item => item.time)
        },
        yAxis: {
          type: 'value',
          name: '振动 (m/s²)',
          axisLabel: {
            formatter: '{value} m/s²'
          }
        },
        series: [
          {
            name: '振动',
            type: 'line',
            smooth: true,
            data: deviceDetail.metrics.vibration.history.map(item => item.value),
            markPoint: {
              data: [
                { type: 'max', name: '最大振动' },
                { type: 'min', name: '最小振动' }
              ]
            },
            markLine: {
              data: [
                { type: 'average', name: '平均振动' },
                {
                  yAxis: deviceDetail.metrics.vibration.warning,
                  lineStyle: { color: '#FAAD14' },
                  label: { formatter: '警戒线: ' + deviceDetail.metrics.vibration.warning + ' m/s²', position: 'end' }
                }
              ]
            },
            lineStyle: {
              width: 3,
              color: '#FAAD14'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(250, 173, 20, 0.3)' },
                  { offset: 1, color: 'rgba(250, 173, 20, 0.1)' }
                ]
              }
            }
          }
        ]
      });

      // 窗口大小调整时重绘图表
      const handleResize = () => {
        tempChart.resize();
        vibrationChart.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        tempChart.dispose();
        vibrationChart.dispose();
      };
    }
  }, [loading, deviceDetail]);
  // 表格列定义
  const columns = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      render: (text, record) => (
        <a onClick={() => handleDeviceSelect(record)}>{text}</a>
      ),
    },
    {
      title: '生产线',
      dataIndex: 'productionLine',
      key: 'productionLine',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let text = '';

        switch (status) {
          case 'normal':
          case '正常':
            color = 'success';
            text = '正常';
            break;
          case 'warning':
          case '预警':
            color = 'warning';
            text = '预警';
            break;
          case 'fault':
          case '故障':
            color = 'error';
            text = '故障';
            break;
          default:
            color = 'default';
            text = '未知';
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '上次维护',
      dataIndex: 'lastMaintenance',
      key: 'lastMaintenance',
      sorter: (a, b) => new Date(a.lastMaintenance) - new Date(b.lastMaintenance),
    },
  ];

  // 处理维护建议
  const handleMaintenance = () => {
    setMaintenanceVisible(true);
  };

  // 处理时间范围变更
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  // 处理数据导出
  const handleExportData = () => {
    Modal.info({
      title: '导出数据',
      content: '数据导出功能正在开发中...',
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={3}>设备监控</Title>
            <Space>
              <Input.Search
                placeholder="搜索设备"
                style={{ width: 200 }}
                onSearch={(value) => console.log('搜索:', value)}
              />
              <Dropdown
                menu={{
                  items: [
                    { key: '1', label: '按温度排序' },
                    { key: '2', label: '按振动排序' },
                    { key: '3', label: '按状态排序' },
                  ],
                }}
              >
                <Button icon={<FilterOutlined />}>
                  筛选
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="设备列表" variant="borderless">
            <Table
              dataSource={deviceList}
              columns={columns}
              rowKey="deviceId"
              size="small"
              pagination={{ pageSize: 10 }}
              rowClassName={(record) => record.deviceId === selectedDevice?.deviceId ? 'ant-table-row-selected' : ''}
              onRow={(record) => ({
                onClick: () => handleDeviceSelect(record),
              })}
            />
          </Card>
        </Col>
      </Row>

      <DeviceDetailModal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        deviceDetail={deviceDetail}
        loading={loading}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefreshData={() => loadDeviceDetail(selectedDevice?.deviceId)}
        onMaintenance={handleMaintenance}
        onExportData={handleExportData}
        modelContainerRef={modelContainerRef}
        temperatureChartRef={temperatureChartRef}
        vibrationChartRef={vibrationChartRef}
      />

      <MaintenanceModal
        visible={maintenanceVisible}
        onCancel={() => setMaintenanceVisible(false)}
        onSubmit={() => {
          setMaintenanceVisible(false);
          Modal.success({
            title: '维护已提交',
            content: '维护工单已提交成功，请等待维护人员处理。',
          });
        }}
        loading={false}
      />
    </div>
  );
};

export default DeviceMonitoring; 
