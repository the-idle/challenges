import { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Modal,
  message,
  Badge,
  Tabs,
  Form,
  Radio,
  Input
} from 'antd';
import { ExclamationCircleOutlined, ToolOutlined, HistoryOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { mockMaintenanceSuggestions, mockMaintenanceDetail, mockMaintenanceHistory } from './mockData';
import MaintenanceDetailModal from './components/MaintenanceDetailModal';
import MaintenanceScheduleModal from './components/MaintenanceScheduleModal'; // 引入排班弹窗组件
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const { Title } = Typography;

const MaintenanceSuggestions = () => {
  const [suggestions, setSuggestions] = useState(mockMaintenanceSuggestions);
  const [maintenanceHistory, setMaintenanceHistory] = useState(mockMaintenanceHistory);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [maintenanceDetail, setMaintenanceDetail] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // 新增 State 用于维护安排
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState([]); // 用于存储安排后的任务
  const [currentSuggestionForSchedule, setCurrentSuggestionForSchedule] = useState(null);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const handleModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedSuggestion(null);
    setMaintenanceDetail(null);
  };

  // 处理安排维护弹窗
  const handleOpenScheduleModal = (suggestion) => {
    setCurrentSuggestionForSchedule(suggestion);
    setIsScheduleModalVisible(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalVisible(false);
    setCurrentSuggestionForSchedule(null);
  };

  // 导出Excel
  const exportToExcel = (fileName) => {
    // 再次检查数据
    if (!scheduledTasks || scheduledTasks.length === 0) {
      message.warning('当前没有可导出的维护安排数据');
      return;
    }

    const data = scheduledTasks.map(task => ({
      '设备ID': task.deviceId,
      '设备名称': task.deviceName,
      '预测故障类型': task.faultType,
      '指派人员': Array.isArray(task.assignedPersonnel) ? task.assignedPersonnel.join(', ') : task.assignedPersonnel,
      '计划维护日期': task.scheduledDate,
      '备注': task.remarks,
      '状态': task.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '维护安排表');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  // 导出PDF
  const exportToPDF = async (fileName) => {
    // 再次检查数据
    if (!scheduledTasks || scheduledTasks.length === 0) {
      message.warning('当前没有可导出的维护安排数据');
      return;
    }

    try {
      const pdf = new jsPDF('l', 'mm', 'a4');

      // 添加标题
      pdf.setFontSize(16);
      pdf.text('维护安排表', 14, 20);

      // 准备表格数据
      const tableData = scheduledTasks.map(task => [
        task.deviceId,
        task.deviceName,
        task.faultType,
        Array.isArray(task.assignedPersonnel) ? task.assignedPersonnel.join(', ') : task.assignedPersonnel,
        task.scheduledDate,
        task.remarks,
        task.status
      ]);

      // 添加表格
      autoTable(pdf, {
        head: [['设备ID', '设备名称', '预测故障类型', '指派人员', '计划维护日期', '备注', '状态']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold',
        },
      });

      pdf.save(`${fileName}.pdf`);
      message.success('PDF导出成功');
    } catch (error) {
      console.error('PDF导出失败:', error);
      message.error('PDF导出失败，请重试');
    }
  };

  // 处理导出提交
  const handleExportSubmit = (values) => {
    const { exportType, fileName } = values;

    // 检查是否有数据可导出
    if (!scheduledTasks || scheduledTasks.length === 0) {
      message.warning('当前没有可导出的维护安排数据');
      return;
    }

    try {
      if (exportType === 'excel') {
        exportToExcel(fileName);
      } else {
        exportToPDF(fileName);
      }
      setExportModalVisible(false);
      message.success('数据导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  const handleConfirmSchedule = (scheduleDetails) => {
    if (!currentSuggestionForSchedule) return;

    const newScheduledTask = {
      ...currentSuggestionForSchedule,
      ...scheduleDetails, // 包含 assignedPersonnel, scheduledDate, remarks
      scheduleId: `task-${Date.now()}`,
      status: '已安排', // 新增状态
    };

    setScheduledTasks(prevTasks => [newScheduledTask, ...prevTasks]);
    setSuggestions(prevSuggestions =>
      prevSuggestions.filter(suggestion => suggestion.id !== currentSuggestionForSchedule.id)
    );

    message.success(`设备 "${currentSuggestionForSchedule.deviceName}" 的维护任务已安排!`);
    handleCloseScheduleModal();
  };

  const suggestionColumns = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 100,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 150,
    },
    {
      title: '预测故障类型',
      dataIndex: 'faultType',
      key: 'faultType',
      width: 150,
    },
    {
      title: '处理状态',
      dataIndex: 'processStatus',
      key: 'processStatus',
      width: 100,
      render: (status) => {
        let color = '';
        let text = '';

        switch (status) {
          case 'pending':
            color = 'error';
            text = '待处理';
            break;
          case 'processing':
            color = 'warning';
            text = '处理中';
            break;
          case 'completed':
            color = 'success';
            text = '已完成';
            break;
          default:
            color = 'default';
            text = '未知';
        }

        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '待处理', value: 'pending' },
        { text: '处理中', value: 'processing' },
        { text: '已完成', value: 'completed' },
      ],
      onFilter: (value, record) => record.processStatus === value,
    },
    {
      title: '预计处理时间',
      dataIndex: 'estimatedTime',
      key: 'estimatedTime',
      width: 150,
      render: (text) => {
        const date = new Date(text);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

        return (
          <span>
            {text}
            {diffDays > 0 ? (
              <Tag color="success" style={{ marginLeft: 8 }}>
                剩余 {diffDays} 天
              </Tag>
            ) : (
              <Tag color="error" style={{ marginLeft: 8 }}>
                已逾期 {Math.abs(diffDays)} 天
              </Tag>
            )}
          </span>
        );
      },
      sorter: (a, b) => new Date(a.estimatedTime) - new Date(b.estimatedTime),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (risk) => {
        let color = '';
        let text = '';
        switch (risk) {
          case 'severe': color = 'volcano'; text = '严重'; break;
          case 'moderate': color = 'orange'; text = '中等'; break;
          case 'minor': color = 'green'; text = '轻微'; break;
          default: color = 'default'; text = '未知';
        }
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '严重', value: 'severe' },
        { text: '中等', value: 'moderate' },
        { text: '轻微', value: 'minor' },
      ],
      onFilter: (value, record) => record.riskLevel === value,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            ghost
            onClick={() => handleOpenScheduleModal(record)}
            style={{ marginLeft: 8 }}
          >
            安排维护
          </Button>
          <Button
            size="small"
            danger
            onClick={() => {
              Modal.confirm({
                title: '确认快速处理',
                icon: <ExclamationCircleOutlined />,
                content: `您确定要标记"${record.deviceName}"的维护建议为已处理吗？此操作将直接完成任务，不会进入排班。`,
                onOk() {
                  message.success('已标记为处理完成');
                  // 实际场景中可能需要调用API更新后端数据
                  setSuggestions(prev => prev.filter(item => item.id !== record.id));
                },
                okText: '确认',
                cancelText: '取消',
              });
            }}
            style={{ marginLeft: 8 }}
          >
            快速处理
          </Button>
        </Space>
      ),
    },
  ];

  // 历史维护记录表格列定义
  // 维护安排表列定义
  const scheduleTableColumns = [
    { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', width: 100 },
    { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 150 },
    { title: '预测故障类型', dataIndex: 'faultType', key: 'faultType', width: 150 },
    {
      title: '指派人员',
      dataIndex: 'assignedPersonnel',
      key: 'assignedPersonnel',
      width: 120,
      render: (personnel) => Array.isArray(personnel) ? personnel.join(', ') : personnel,
    },
    { title: '计划维护日期', dataIndex: 'scheduledDate', key: 'scheduledDate', width: 180 },
    { title: '备注', dataIndex: 'remarks', key: 'remarks', width: 200 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <Tag color="processing">{status}</Tag>,
    },
    // TODO: 可以添加操作，例如编辑或取消安排
  ];

  const historyColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => new Date(b.date) - new Date(a.date),
    },
    {
      title: '维护类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      filters: [
        { text: '定期维护', value: '定期维护' },
        { text: '故障维修', value: '故障维修' },
      ],
      onFilter: (value, record) => record.type.indexOf(value) === 0,
    },
    {
      title: '操作人员',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = 'success';
        return <Badge status={color} text={status} />;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            Modal.info({
              title: '维护详情',
              width: 600,
              content: (
                <div>
                  <p><strong>日期：</strong> {record.date}</p>
                  <p><strong>类型：</strong> {record.type}</p>
                  <p><strong>操作人员：</strong> {record.operator}</p>
                  <p><strong>状态：</strong> {record.status}</p>
                  <p><strong>描述：</strong> {record.description}</p>
                </div>
              ),
              okText: '关闭',
            });
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div className="maintenance-suggestions">
      <Card>
        <Tabs
          defaultActiveKey="suggestions"
          tabPosition="top"
          items={[
            {
              key: 'suggestions',
              label: (
                <span>
                  <ToolOutlined />
                  维护建议
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {suggestions.length}
                  </Tag>
                </span>
              ),
              children: (
                <Table
                  columns={suggestionColumns}
                  dataSource={suggestions}
                  rowKey="id"
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                />
              ),
            },
            {
              key: 'schedule',
              label: (
                <span>
                  <ToolOutlined />
                  维护安排表
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={5} style={{ margin: 0 }}>已安排维护任务</Title>
                    <Button onClick={() => setExportModalVisible(true)}>导出安排表</Button>
                  </div>
                  <Table
                    columns={scheduleTableColumns}
                    dataSource={scheduledTasks}
                    rowKey="scheduleId"
                    pagination={{ pageSize: 10 }}
                    scroll={{ y: 400 }}
                  />
                </div>
              ),
            },
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined />
                  历史维护记录
                </span>
              ),
              children: (
                <Table
                  columns={historyColumns}
                  dataSource={maintenanceHistory} // 修正 dataSource
                  rowKey="id"
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                  }}
                />
              ),
            }
          ]}
        />
      </Card>

      {selectedSuggestion && (
        <MaintenanceDetailModal
          visible={isDetailModalVisible}
          onClose={handleModalClose}
          suggestion={selectedSuggestion}
          detail={maintenanceDetail}
        />
      )}

      {/* 启用并传递 props 给 MaintenanceScheduleModal */}
      {isScheduleModalVisible && currentSuggestionForSchedule && (
        <MaintenanceScheduleModal
          visible={isScheduleModalVisible}
          onCancel={handleCloseScheduleModal}
          onConfirm={handleConfirmSchedule}
          suggestion={currentSuggestionForSchedule}
        />
      )}

      {/* 导出弹窗 */}
      <Modal
        title="导出维护安排表"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleExportSubmit} layout="vertical">
          <Form.Item name="exportType" label="导出格式" initialValue="excel">
            <Radio.Group>
              <Radio value="excel">
                <Space>
                  <FileExcelOutlined />
                  Excel
                </Space>
              </Radio>
              <Radio value="pdf">
                <Space>
                  <FilePdfOutlined />
                  PDF
                </Space>
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="fileName" label="文件名称" initialValue="维护安排表">
            <Input placeholder="请输入文件名称" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setExportModalVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              导出
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaintenanceSuggestions;
