import { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Statistic, Progress, Badge, Select, Typography, Spin, Button, Divider, Space, Tag, Avatar, List, Timeline, Modal, message, Dropdown } from 'antd';
import './index.css'; // 添加自定义样式文件
import {
  ArrowUpOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  PieChartOutlined,
  GlobalOutlined,
  DesktopOutlined,
  CalendarOutlined,
  SettingOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import { useNavigate } from 'react-router-dom';
import {
  mockDashboardStats,
  mockDevicePerformance,
  mockAlarmStatistics,
  mockWarningList,
  mockRegionalDeviceData
} from './data.js';
import BigScreen from '../BigScreen';
import * as XLSX from 'xlsx';
import { getDashboardData } from '../../services/dashboardService';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';

const { Title, Text } = Typography;
const { Option } = Select;

// 增加事件流数据
const mockEventData = [
  { id: 1, time: '2024-01-07 19:10:01', deviceName: '电机A-001', content: '正常启动', status: 'normal', details: '设备启动正常，所有参数在正常范围内' },
  { id: 2, time: '2024-01-07 19:09:45', deviceName: '泵B-002', content: '温度偏高', status: 'warning', details: '当前温度75°C，接近阈值80°C，建议关注' },
  { id: 3, time: '2024-01-07 19:08:30', deviceName: '阀门C-003', content: '故障停机', status: 'error', details: '压力骤降，系统自动关闭，需要维修' },
  { id: 4, time: '2024-01-07 19:07:12', deviceName: '电机A-001', content: '维护完成', status: 'normal', details: '定期维护已完成，设备状态良好' },
  { id: 5, time: '2024-01-07 19:06:23', deviceName: '传感器D-004', content: '预防性维护', status: 'normal', details: '按计划进行预防性维护，更换易损部件' },
  { id: 6, time: '2024-01-07 19:05:10', deviceName: '风机E-005', content: '连接中断', status: 'error', details: '通信连接中断，无法获取实时数据，请检查网络' },
  { id: 7, time: '2024-01-07 19:03:45', deviceName: '压缩机F-006', content: '温度异常', status: 'warning', details: '温度升高至95°C，超过正常工作温度，需要观察' },
  { id: 8, time: '2024-01-07 19:01:30', deviceName: '控制器G-007', content: '系统更新', status: 'normal', details: '固件更新完成，版本号v2.3.5' },
  { id: 9, time: '2024-01-07 19:00:15', deviceName: '电机H-008', content: '启动失败', status: 'error', details: '多次启动失败，可能是电源问题，需要检查线路' },
  { id: 10, time: '2024-01-07 18:58:40', deviceName: '变频器I-009', content: '参数调整', status: 'normal', details: '根据生产需要调整频率参数，从50Hz改为60Hz' },
  { id: 11, time: '2024-01-07 18:55:22', deviceName: '泵J-010', content: '振动增大', status: 'warning', details: '振动值达到3.2mm/s，接近警戒值3.5mm/s，建议检查' },
  { id: 12, time: '2024-01-07 18:50:10', deviceName: '阀门K-011', content: '泄漏检测', status: 'normal', details: '例行泄漏检测完成，未发现异常' }
];
import { getDeviceList } from '@/api/devic'
const Dashboard = () => {
  // 获取设备列表
  const [deviceList, setDeviceList] = useState([]);
  const fetchDeviceList = async () => {
    const res = await getDeviceList();
    if (res.code === 200) {
      setDeviceList(res.rows);
    }
  }
  useEffect(() => {
    fetchDeviceList();
  }, []);

  // 工业风格的颜色定义
  const INDUSTRIAL_COLORS = {
    primary: '#34495E',
    secondary: '#7F8C8D',
    success: '#2ECC71',
    warning: '#F1C40F',
    error: '#E74C3C',
    info: '#3498DB',
    background: '#F5F6FA',
    cardBackground: '#ECF0F1',
    metal: '#BDC3C7',
    darkMetal: '#2C3E50'
  };

  const getIndustrialStyle = (type) => {
    switch (type) {
      case 'normal':
        return INDUSTRIAL_COLORS.success;
      case 'warning':
        return INDUSTRIAL_COLORS.warning;
      case 'error':
        return INDUSTRIAL_COLORS.error;
      default:
        return INDUSTRIAL_COLORS.primary;
    }
  };

  const getCardStyle = () => ({
    backgroundColor: INDUSTRIAL_COLORS.cardBackground,
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    border: '1px solid #D5D8DC'
  });

  const getTextStyle = (color = INDUSTRIAL_COLORS.primary) => ({
    color: color,
    fontFamily: 'Arial, sans-serif'
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(mockDashboardStats);
  const [performance, setPerformance] = useState(mockDevicePerformance);
  const [alarmStats, setAlarmStats] = useState(mockAlarmStatistics);
  const [warningList, setWarningList] = useState(mockWarningList);
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [refreshing, setRefreshing] = useState(false);
  const [eventData, setEventData] = useState(mockEventData);
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [bigScreenVisible, setBigScreenVisible] = useState(false);

  const deviceHealthChartRef = useRef(null);

  // 添加详情弹框相关状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  // 刷新数据函数
  const refreshData = () => {
    setRefreshing(true);
    // 模拟数据加载
    setTimeout(() => {
      setRefreshing(false);
      // 这里可以添加实际的数据刷新逻辑
    }, 1500);
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    // 根据时间范围筛选数据的逻辑
  };

  // 处理事件状态筛选
  const handleEventStatusChange = (value) => {
    setEventStatusFilter(value);
  };

  // 获取筛选后的事件数据
  const getFilteredEvents = () => {
    if (eventStatusFilter === 'all') {
      return eventData;
    }
    return eventData.filter(event => event.status === eventStatusFilter);
  };

  // 添加导出功能
  const handleExport = async (type) => {
    try {
      const exportData = eventData.map(event => ({
        time: event.time,
        deviceName: event.deviceName,
        content: event.content,
        status: event.status,
        details: event.details
      }));

      if (type === 'excel') {
        await exportToExcel(exportData, '设备事件数据', [
          { title: '事件时间', dataIndex: 'time' },
          { title: '设备名称', dataIndex: 'deviceName' },
          { title: '事件内容', dataIndex: 'content' },
          { title: '事件状态', dataIndex: 'status' },
          { title: '详细信息', dataIndex: 'details' }
        ]);
        message.success('Excel文件导出成功');
      } else if (type === 'csv') {
        await exportToCSV(exportData, '设备事件数据', [
          { title: '事件时间', dataIndex: 'time' },
          { title: '设备名称', dataIndex: 'deviceName' },
          { title: '事件内容', dataIndex: 'content' },
          { title: '事件状态', dataIndex: 'status' },
          { title: '详细信息', dataIndex: 'details' }
        ]);
        message.success('CSV文件导出成功');
      }
    } catch (error) {
      message.error(error.message || '导出失败');
    }
  };

  // 导出菜单项
  const exportMenuItems = [
    {
      key: 'excel',
      label: '导出为Excel',
      icon: <FileExcelOutlined />,
      onClick: () => handleExport('excel')
    },
    {
      key: 'csv',
      label: '导出为CSV',
      icon: <FileTextOutlined />,
      onClick: () => handleExport('csv')
    }
  ];

  useEffect(() => {
    setLoading(false);
    if (!loading && Object.keys(performance).length > 0) {
      // 设备健康状态饼图
      if (deviceHealthChartRef.current && deviceList.length > 0) {
        const deviceHealthChart = echarts.init(deviceHealthChartRef.current);
        deviceHealthChart.setOption({
          title: {
            text: '设备健康状态分布',
            left: 'center',
            textStyle: {
              fontWeight: 'normal',
              fontSize: 16,
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: '#eee',
            borderWidth: 1,
            textStyle: {
              color: '#333'
            },
            formatter: function (params) {
              return `<div style="font-weight:bold;">${params.name}</div>
                <div style="display:flex;align-items:center;margin-top:5px;">
                  <span style="display:inline-block;width:10px;height:10px;background-color:${params.color};margin-right:5px;"></span>
                  <span>${params.value}台 (${params.percent}%)</span>
                </div>`;
            }
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            itemWidth: 14,
            itemHeight: 14,
            itemGap: 15,
            textStyle: {
              color: '#666'
            }
          },
          series: [
            {
              name: '设备健康状态',
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['40%', '50%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: 'bold'
                },
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                {
                  value: deviceList.filter(item => item.status !== '预警' && item.status !== '故障').length,
                  name: '正常运行',
                  itemStyle: { color: '#52C41A' }
                },
                {
                  value: deviceList.filter(item => item.status === '预警').length,
                  name: '轻微异常',
                  itemStyle: { color: '#FAAD14' }
                },
                {
                  value: deviceList.filter(item => item.status === '故障').length,
                  name: '需要维护',
                  itemStyle: { color: '#FF4D4F' }
                }
              ]
            }
          ]
        });

        // 添加窗口大小变化的监听
        const handleResize = () => {
          deviceHealthChart.resize();
        };
        window.addEventListener('resize', handleResize);

        // 清理函数
        return () => {
          window.removeEventListener('resize', handleResize);
          deviceHealthChart.dispose();
        };
      }
    }
  }, [loading, performance, deviceList]);

  // 显示详情弹框
  const showEventDetail = (event) => {
    setCurrentEvent(event);
    setDetailModalVisible(true);
  };

  // 关闭详情弹框
  const handleDetailModalClose = () => {
    setDetailModalVisible(false);
    setCurrentEvent(null);
  };

  // 渲染设备事件流
  const renderEventStream = () => {
    const filteredEvents = getFilteredEvents();

    return (
      <div className="custom-timeline-container">
        {filteredEvents.map((event, index) => (
          <div key={index} className="event-timeline-item">
            <div className="event-time">
              <div className="event-time-value">{event.time.split(' ')[1]}</div>
              <div className="event-time-date">{event.time.split(' ')[0]}</div>
            </div>
            <div className="event-status-line">
              <div
                className={`event-status-dot ${event.status}`}
              >
                {event.status === 'normal' ? <CheckCircleOutlined /> :
                  event.status === 'warning' ? <WarningOutlined /> :
                    <ExclamationCircleOutlined />}
              </div>
              <div
                className={`event-status-bar ${event.status}`}
              ></div>
            </div>
            <div className="event-content">
              <Card
                className={`event-card ${event.status}`}
                size="small"
                variant="borderless"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  borderRadius: '4px',
                  padding: '6px',
                }}
              >
                <div style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{event.deviceName}</span>
                    <Tag
                      color={event.status === 'normal' ? 'success' : event.status === 'warning' ? 'warning' : 'error'}
                      style={{ margin: 0, fontSize: '12px', lineHeight: '16px', padding: '0 4px' }}
                    >
                      {event.status === 'normal' ? '正常' : event.status === 'warning' ? '警告' : '错误'}
                    </Tag>
                  </div>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => showEventDetail(event)}
                    style={{ fontSize: '12px', height: '22px', padding: '0 8px' }}
                  >
                    查看详情
                  </Button>
                </div>
                <div style={{ marginBottom: '4px', fontSize: '13px' }}>{event.content}</div>
                <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.details}
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Spin spinning={refreshing} tip="刷新中...">
      <div>
        {/* 页面标题和工具栏 */}
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DashboardOutlined style={{ fontSize: 22, marginRight: 10, color: '#1890FF' }} />
            <Title level={4} style={{ margin: 0 }}>系统监控中心</Title>
          </div>
          <div>
            <Space>
              <Select
                defaultValue="today"
                style={{ width: 120 }}
                onChange={handleTimeRangeChange}
                prefix={<CalendarOutlined />}
              >
                <Option value="today">今日</Option>
                <Option value="week">本周</Option>
                <Option value="month">本月</Option>
                <Option value="quarter">本季度</Option>
              </Select>
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={(value) => setFilterType(value)}
                popupMatchSelectWidth={false}
              >
                <Option value="all">全部设备</Option>
                <Option value="line1">生产线1</Option>
                <Option value="line2">生产线2</Option>
                <Option value="line3">生产线3</Option>
              </Select>
              <Dropdown
                menu={{ items: exportMenuItems }}
                placement="bottomRight"
              >
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  title="导出数据"
                >
                  导出数据
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={refreshData}
                loading={refreshing}
                title="刷新数据"
              />
              <Button
                icon={<SettingOutlined />}
                onClick={() => navigate('/settings')}
                title="设置"
              />
            </Space>
          </div>
        </div>

        {/* 设备状态概览卡片 */}
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Card
              title="设备状态概览"
              variant="borderless"
              styles={{
                body: {
                  padding: '16px'
                }
              }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Card
                    variant="borderless"
                    className="stat-card"
                    styles={{
                      body: {
                        padding: '20px'
                      }
                    }}
                  >
                    <Statistic
                      title="设备总数"
                      value={deviceList.length || stats.totalDevices}
                      prefix={<DesktopOutlined />}
                      valueStyle={getTextStyle()}
                    />
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#999' }}>
                      较上月 <span style={{ color: '#52C41A' }}><ArrowUpOutlined /> 5.2%</span>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Card
                    variant="borderless"
                    className="stat-card"
                    styles={{
                      body: {
                        padding: '20px'
                      }
                    }}
                  >
                    <Statistic
                      title="在线设备"
                      value={deviceList.filter(item => item.status !== '预警' && item.status !== '故障').length || stats.onlineDevices}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={getTextStyle(INDUSTRIAL_COLORS.success)}
                    />
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#999' }}>
                      在线率 <span style={{ color: '#52C41A' }}>{Math.round(deviceList.filter(item => item.status !== '预警' && item.status !== '故障').length / deviceList.length * 100 || 0)}%</span>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Card
                    variant="borderless"
                    className="stat-card"
                    styles={{
                      body: {
                        padding: '20px'
                      }
                    }}
                  >
                    <Statistic
                      title="预警设备"
                      value={deviceList.filter(item => item.status === '预警').length || stats.warningDevices}
                      prefix={<WarningOutlined />}
                      valueStyle={getTextStyle(INDUSTRIAL_COLORS.warning)}
                    />
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#999' }}>
                      故障率 <span style={{ color: '#FF4D4F' }}>{Math.round(deviceList.filter(item => item.status === '预警').length / deviceList.length * 100 || 0)}%</span>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Card
                    variant="borderless"
                    className="stat-card"
                    styles={{
                      body: {
                        padding: '20px'
                      }
                    }}
                  >
                    <Statistic
                      title="离线设备"
                      value={deviceList.filter(item => item.status === '故障').length || stats.offlineDevices}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={getTextStyle(INDUSTRIAL_COLORS.error)}
                    />
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#999' }}>
                      离线率 <span style={{ color: '#FF4D4F' }}>{Math.round(deviceList.filter(item => item.status === '故障').length / deviceList.length * 100 || 0)}%</span>
                    </div>
                  </Card>
                </Col>
              </Row>
              <Divider style={{ margin: '24px 0 16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>设备运行状态</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>({Math.round((deviceList.filter(item => item.status !== '预警' && item.status !== '故障').length / deviceList.length * 100))}% 在线)</Text>
                </div>
                <Text type="secondary">{deviceList.filter(item => item.status !== '预警' && item.status !== '故障').length}/{deviceList.length}</Text>
              </div>
              <Progress
                percent={Math.round((deviceList.filter(item => item.status !== '预警' && item.status !== '故障').length / deviceList.length * 100))}
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表和事件流区域 */}
        <Row gutter={[12, 12]} style={{ marginTop: '12px' }}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Card
              className="dashboard-card"
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PieChartOutlined style={{ marginRight: 8, color: '#1890FF' }} />
                  <span>设备健康状态分布</span>
                </div>
              }
              extra={<Button type="link" size="small" onClick={() => setBigScreenVisible(true)}>查看详情</Button>}
              styles={{
                body: {
                  padding: '12px',
                  height: '360px'
                }
              }}
            >
              <div ref={deviceHealthChartRef} style={{ height: '320px', width: '100%' }} />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Card
              title="设备事件流"
              variant="borderless"
              styles={{
                body: {
                  padding: '12px',
                  height: '360px'
                }
              }}
            >
              {renderEventStream()}
            </Card>
          </Col>
        </Row>

        {/* 设备事件详情弹框 */}
        <Modal
          title={null}
          open={detailModalVisible}
          onCancel={handleDetailModalClose}
          footer={null}
          width={600}
          className="event-detail-modal"
          styles={{
            body: {
              padding: 0
            }
          }}
        >
          {currentEvent && (
            <div className="event-detail-container">
              <div
                className={`event-detail-header ${currentEvent.status}`}
                style={{
                  background: currentEvent.status === 'normal'
                    ? 'linear-gradient(to right, #f6ffed, #e6f7ff)'
                    : currentEvent.status === 'warning'
                      ? 'linear-gradient(to right, #fffbe6, #fff7e6)'
                      : 'linear-gradient(to right, #fff1f0, #fff2f0)'
                }}
              >
                <div className="event-device">
                  <div className="device-id">{currentEvent.deviceName}</div>
                  <div className={`device-status ${currentEvent.status}`}>
                    {currentEvent.status === 'normal' ? '正常' :
                      currentEvent.status === 'warning' ? '警告' : '错误'}
                  </div>
                </div>
                <Button
                  className="close-button"
                  onClick={handleDetailModalClose}
                  type="text"
                >
                  关闭
                </Button>
              </div>

              <div className="event-detail-content">
                <div className="detail-row">
                  <div className="detail-label">事件时间：</div>
                  <div className="detail-value">{currentEvent.time}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">事件内容：</div>
                  <div className="detail-value">{currentEvent.content}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">详细信息：</div>
                  <div className="detail-value">{currentEvent.details}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">设备状态：</div>
                  <div className="detail-value">
                    <span className={`status-tag ${currentEvent.status}`}>
                      {currentEvent.status === 'normal' ? '正常' :
                        currentEvent.status === 'warning' ? '警告' : '错误'}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">建议操作：</div>
                  <div className="detail-value">
                    {currentEvent.status === 'normal'
                      ? '继续正常监控，无需额外操作。'
                      : currentEvent.status === 'warning'
                        ? '建议安排技术人员检查设备，预防性维护。'
                        : '请立即安排维修人员处理，避免设备损坏或安全事故。'}
                  </div>
                </div>

                {currentEvent.status !== 'normal' && (
                  <div className="action-buttons">
                    <Button type="primary" style={{ marginRight: 8 }}>
                      派单处理
                    </Button>
                    <Button>忽略警告</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>

      {/* 添加自定义样式 */}
      <style jsx="true">{`
        .stat-card {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
          transition: all 0.3s;
        }
        .stat-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        .dashboard-card {
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }
        .dashboard-card:hover {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .event-card {
          transition: all 0.3s;
          width: 100%;
        }
        .event-card:hover {
          transform: translateX(5px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .event-card.normal:hover {
          border-left-color: #52C41A;
        }
        .event-card.warning:hover {
          border-left-color: #FAAD14;
        }
        .event-card.error:hover {
          border-left-color: #FF4D4F;
        }

        /* 自定义时间轴样式 */
        .custom-timeline-container {
          padding: 0;
          margin: 0;
        }
        
        .event-timeline-item {
          display: flex;
          padding-bottom: 12px;
          position: relative;
        }
        
        .event-time {
          width: 80px;
          padding-right: 5px;
          text-align: right;
          flex-shrink: 0;
        }
        
        .event-time-value {
          font-weight: bold;
          font-size: 14px;
        }
        
        .event-time-date {
          font-size: 12px;
          color: #999;
        }
        
        .event-status-line {
          width: 30px;
          position: relative;
          flex-shrink: 0;
        }
        
        .event-status-dot {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
        }
        
        .event-status-dot.normal {
          background-color: #52C41A;
        }
        
        .event-status-dot.warning {
          background-color: #FAAD14;
        }
        
        .event-status-dot.error {
          background-color: #FF4D4F;
        }
        
        .event-status-bar {
          position: absolute;
          left: 50%;
          top: 20px;
          bottom: 0;
          width: 2px;
          transform: translateX(-50%);
        }
        
        .event-status-bar.normal {
          background-color: #52C41A;
        }
        
        .event-status-bar.warning {
          background-color: #FAAD14;
        }
        
        .event-status-bar.error {
          background-color: #FF4D4F;
        }
        
        .event-content {
          flex-grow: 1;
          padding-left: 10px;
          padding-right: 5px;
        }
      `}</style>

      {/* 大屏模式组件 */}
      <BigScreen
        visible={bigScreenVisible}
        onClose={() => setBigScreenVisible(false)}
      />
    </Spin>
  );
};

export default Dashboard;
