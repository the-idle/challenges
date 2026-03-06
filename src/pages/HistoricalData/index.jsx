import { useState, useEffect, useRef } from 'react';
import {
  Row,
  Col,
  Card,
  DatePicker,
  Select,
  Button,
  Space,
  Table,
  Typography,
  Spin,
  Checkbox,
  Modal,
  Form,
  Input,
  Radio,
  message
} from 'antd';
import {
  DownloadOutlined,
  SearchOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import * as echarts from 'echarts';
import { mockDeviceList, mockHistoricalData } from './data.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const HistoricalData = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [timeGranularity, setTimeGranularity] = useState('hour');
  const [deviceList] = useState(mockDeviceList);
  const [selectedDevices, setSelectedDevices] = useState(mockDeviceList.slice(0, 5).map(d => d.id));
  const [dataType, setDataType] = useState('temperature');
  const [historicalData, setHistoricalData] = useState(mockHistoricalData);
  const [chartType, setChartType] = useState('line');
  const [exportVisible, setExportVisible] = useState(false);
  const [faultExportVisible, setFaultExportVisible] = useState(false);
  const [tableExportVisible, setTableExportVisible] = useState(false);

  const chartRef = useRef(null);
  const scatterChartRef = useRef(null);
  const tableRef = useRef(null);

  // 渲染图表
  useEffect(() => {
    if (!loading && historicalData && chartRef.current) {
      const chart = echarts.init(chartRef.current);

      // 折线图或柱状图配置
      if (chartType === 'line' || chartType === 'bar') {
        const series = selectedDevices.map((deviceId) => {
          const deviceName = deviceList.find(d => d.id === deviceId)?.name || deviceId;
          return {
            name: deviceName,
            type: chartType,
            data: historicalData.metrics[dataType].map(metric => metric.value),
            ...(chartType === 'line' ? {
              smooth: true,
              symbol: 'circle',
              symbolSize: 5,
              sampling: 'average',
              lineStyle: {
                width: 2
              }
            } : {})
          };
        });

        chart.setOption({
          title: {
            text: `设备${dataType === 'temperature' ? '温度' : dataType === 'vibration' ? '振动' : '电流'}历史数据对比`,
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              let result = params[0].axisValueLabel + '<br/>';
              params.forEach(param => {
                const color = param.color;
                const seriesName = param.seriesName;
                const value = param.value;
                const unit = dataType === 'temperature' ? '°C' :
                  dataType === 'vibration' ? 'm/s²' : 'A';
                result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span> ${seriesName}: ${value} ${unit}<br/>`;
              });
              return result;
            }
          },
          legend: {
            data: selectedDevices.map(deviceId => {
              const device = deviceList.find(d => d.id === deviceId);
              return device ? device.name : deviceId;
            }),
            bottom: 0
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: chartType === 'bar',
            data: historicalData.timestamps,
            axisLabel: {
              formatter: function (value) {
                if (timeGranularity === 'hour') {
                  return value.substring(11, 16); // 只显示时:分
                } else if (timeGranularity === 'day') {
                  return value.substring(5, 10); // 只显示月-日
                } else {
                  return value.substring(0, 10); // 只显示年-月-日
                }
              }
            }
          },
          yAxis: {
            type: 'value',
            name: dataType === 'temperature' ? '温度 (°C)' :
              dataType === 'vibration' ? '振动 (m/s²)' : '电流 (A)',
            axisLabel: {
              formatter: function (value) {
                return value + (dataType === 'temperature' ? ' °C' :
                  dataType === 'vibration' ? ' m/s²' : ' A');
              }
            }
          },
          series: series
        });
      } else if (chartType === 'scatter') {
        // 渲染温度与振动关系散点图
        const scatterData = historicalData.metrics.temperature.map((item, idx) => [item.value, historicalData.metrics.vibration[idx]?.value]);
        chart.setOption({
          title: {
            text: '温度与振动关系散点图',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: function (param) {
              return `温度: ${param.value[0]} °C<br/>振动: ${param.value[1]} m/s²`;
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'value',
            name: '温度 (°C)',
            axisLabel: {
              formatter: '{value} °C'
            }
          },
          yAxis: {
            type: 'value',
            name: '振动 (m/s²)',
            axisLabel: {
              formatter: '{value} m/s²'
            }
          },
          series: [{
            name: '温度-振动',
            type: 'scatter',
            data: scatterData,
            symbolSize: 10
          }]
        });
      }

      // 窗口大小调整时重绘图表
      const handleResize = () => {
        chart.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, [loading, historicalData, chartType, selectedDevices, deviceList, dataType, timeGranularity]);

  // 渲染故障率与运行参数关系的散点图
  useEffect(() => {
    if (!loading && historicalData && scatterChartRef.current) {
      const scatterChart = echarts.init(scatterChartRef.current);

      // 组装散点数据：每个设备一组，x为温度/振动，y为故障率
      const scatterSeries = selectedDevices.map(deviceId => {
        const deviceName = deviceList.find(d => d.id === deviceId)?.name || deviceId;
        // 取温度和故障率一一对应
        const xArr = historicalData.metrics[dataType];
        const yArr = historicalData.metrics.faultRate;
        const scatterData = xArr.map((item, idx) => [item.value, yArr[idx]?.value]);
        return {
          name: deviceName,
          type: 'scatter',
          data: scatterData,
          symbolSize: function (data) {
            return Math.sqrt(data[1]) + 5;
          }
        };
      });

      scatterChart.setOption({
        title: {
          text: '故障率与运行参数关系',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: function (param) {
            const deviceName = param.seriesName;
            return `${deviceName}<br/>${dataType === 'temperature' ? '温度' : '振动'}: ${param.value[0]}${dataType === 'temperature' ? ' °C' : ' m/s²'}<br/>故障率: ${param.value[1]}%`;
          }
        },
        legend: {
          data: selectedDevices.map(deviceId => {
            const device = deviceList.find(d => d.id === deviceId);
            return device ? device.name : deviceId;
          }),
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: dataType === 'temperature' ? '温度 (°C)' : '振动 (m/s²)',
          axisLabel: {
            formatter: function (value) {
              return value + (dataType === 'temperature' ? ' °C' : ' m/s²');
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '故障率 (%)',
          axisLabel: {
            formatter: '{value} %'
          },
          max: 100
        },
        series: scatterSeries,
        visualMap: {
          min: 0,
          max: 100,
          dimension: 1, // 基于故障率（Y轴值）
          orient: 'vertical',
          right: 10,
          top: 'center',
          text: ['高', '低'],
          calculable: true,
          inRange: {
            color: ['#52C41A', '#FAAD14', '#FF4D4F']
          }
        }
      });

      // 窗口大小调整时重绘图表
      const handleResize = () => {
        scatterChart.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        scatterChart.dispose();
      };
    }
  }, [loading, historicalData, selectedDevices, deviceList, dataType]);

  // 渲染历史数据表格
  const renderDataTable = () => {
    if (!historicalData) return null;

    const columns = [
      {
        title: '时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        fixed: 'left',
        width: 180
      }
    ];

    // 为每个选中的设备添加列
    selectedDevices.forEach(deviceId => {
      const deviceName = deviceList.find(d => d.id === deviceId)?.name || deviceId;
      columns.push({
        title: deviceName,
        dataIndex: deviceId,
        key: deviceId,
        render: (value) => value !== undefined ? `${value} ${dataType === 'temperature' ? '°C' : dataType === 'vibration' ? 'm/s²' : 'A'}` : '--'
      });
    });

    // 构建表格数据
    const dataSource = historicalData.timestamps.map((timestamp, index) => {
      const row = {
        key: index,
        timestamp: timestamp
      };
      selectedDevices.forEach(deviceId => {
        // 这里假设所有设备用同一组 mock 数据
        row[deviceId] = historicalData.metrics[dataType][index]?.value;
      });
      return row;
    });

    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
        size="small"
      />
    );
  };

  // 处理导出数据
  const handleExportData = () => {
    setExportVisible(true);
  };

  // 准备导出数据
  const prepareExportData = () => {
    const data = [];
    const headers = ['时间'];

    // 添加选中的设备列
    selectedDevices.forEach(deviceId => {
      const deviceName = deviceList.find(d => d.id === deviceId)?.name || deviceId;
      headers.push(deviceName);
    });

    // 添加数据行
    historicalData.timestamps.forEach((timestamp, index) => {
      const row = [timestamp];
      selectedDevices.forEach(() => {
        row.push(historicalData.metrics[dataType][index]?.value || '--');
      });
      data.push(row);
    });

    return { headers, data };
  };

  // 准备故障分析数据
  const prepareFaultAnalysisData = () => {
    const data = [];
    const headers = ['设备名称', '温度/振动', '故障率'];

    // 为每个设备添加数据行
    selectedDevices.forEach(deviceId => {
      const deviceName = deviceList.find(d => d.id === deviceId)?.name || deviceId;
      historicalData.metrics[dataType].forEach((item, idx) => {
        data.push([
          deviceName,
          item.value,
          historicalData.metrics.faultRate[idx]?.value || '--'
        ]);
      });
    });

    return { headers, data };
  };

  // 导出Excel
  const exportToExcel = (fileName) => {
    const { headers, data } = prepareExportData();

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // 设置列宽
    const colWidths = headers.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '历史数据');

    // 导出文件
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  // 导出PDF
  const exportToPDF = async (fileName) => {
    try {
      // 创建临时容器
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '1200px';
      container.style.padding = '20px';
      container.style.backgroundColor = 'white';

      // 添加标题
      container.innerHTML = `
        <h1 style="text-align: center; margin-bottom: 20px;">历史数据分析报告</h1>
      `;

      // 添加历史数据表格
      const { headers, data } = prepareExportData();
      const tableHtml = `
        <div style="margin-bottom: 30px;">
          <h2 style="margin-bottom: 15px;">历史数据</h2>
          <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
            <thead>
              <tr style="background-color: #2980b9; color: white;">
                ${headers.map(header => `<th style="padding: 8px; border: 1px solid #ddd;">${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${row.map(cell => `<td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      container.innerHTML += tableHtml;

      // 添加故障分析表格
      const faultData = prepareFaultAnalysisData();
      const faultTableHtml = `
        <div style="margin-bottom: 30px;">
          <h2 style="margin-bottom: 15px;">故障分析</h2>
          <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
            <thead>
              <tr style="background-color: #2980b9; color: white;">
                ${faultData.headers.map(header => `<th style="padding: 8px; border: 1px solid #ddd;">${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${faultData.data.map(row => `
                <tr>
                  ${row.map(cell => `<td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      container.innerHTML += faultTableHtml;

      // 添加图表
      if (chartRef.current && scatterChartRef.current) {
        const chartCanvas = await html2canvas(chartRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        const scatterCanvas = await html2canvas(scatterChartRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const chartsHtml = `
          <div style="margin-bottom: 30px;">
            <h2 style="margin-bottom: 15px;">数据可视化</h2>
            <div style="margin-bottom: 20px;">
              <img src="${chartCanvas.toDataURL('image/png')}" style="width: 100%;" />
            </div>
            <div>
              <img src="${scatterCanvas.toDataURL('image/png')}" style="width: 100%;" />
            </div>
          </div>
        `;
        container.innerHTML += chartsHtml;
      }

      document.body.appendChild(container);

      // 使用html2canvas将整个内容转换为图片
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      // 创建PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 宽度
      const imgHeight = canvas.height * imgWidth / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // 清理临时元素
      document.body.removeChild(container);

      // 保存PDF
      pdf.save(`${fileName}.pdf`);

      message.success('PDF导出成功');
    } catch (error) {
      console.error('PDF导出失败:', error);
      message.error('PDF导出失败，请重试');
    }
  };

  // 完成导出
  const handleExportSubmit = (values) => {
    const { exportType, fileName } = values;

    try {
      if (exportType === 'excel') {
        exportToExcel(fileName);
      } else {
        exportToPDF(fileName);
      }
      setExportVisible(false);
      message.success('数据导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  // 故障分析导出表格数据
  const prepareFaultExportData = () => {
    const data = [];
    const headers = ['设备名称', dataType === 'temperature' ? '温度 (°C)' : '振动 (m/s²)', '故障率 (%)'];
    selectedDevices.forEach(deviceId => {
      const deviceName = deviceList.find(d => d.id === deviceId)?.name || deviceId;
      historicalData.metrics[dataType].forEach((item, idx) => {
        data.push([
          deviceName,
          item.value,
          historicalData.metrics.faultRate[idx]?.value || '--'
        ]);
      });
    });
    return { headers, data };
  };

  // 故障分析导出Excel
  const exportFaultToExcel = (fileName) => {
    const { headers, data } = prepareFaultExportData();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = headers.map(() => ({ wch: 15 }));
    XLSX.utils.book_append_sheet(wb, ws, '故障分析');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  // 故障分析导出PDF
  const exportFaultToPDF = async (fileName) => {
    try {
      // 1. 构造表格HTML
      const { headers, data } = prepareFaultExportData();
      const tableDiv = document.createElement('div');
      tableDiv.style.position = 'absolute';
      tableDiv.style.left = '-9999px';
      tableDiv.style.top = '-9999px';
      tableDiv.innerHTML = `
        <h2 style='margin-bottom: 15px;'>故障分析</h2>
        <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
          <thead>
            <tr style="background-color: #2980b9; color: white;">
              ${headers.map(header => `<th style="padding: 8px; border: 1px solid #ddd;">${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${row.map(cell => `<td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      document.body.appendChild(tableDiv);
      // 2. 截图表格
      const tableCanvas = await html2canvas(tableDiv, { scale: 2, useCORS: true, logging: false });
      document.body.removeChild(tableDiv);
      // 3. 截图故障率分析图表
      let scatterImgData = '';
      if (scatterChartRef.current) {
        const scatterCanvas = await html2canvas(scatterChartRef.current, { scale: 2, useCORS: true, logging: false });
        scatterImgData = scatterCanvas.toDataURL('image/png');
      }
      // 4. 生成PDF
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.setFontSize(16);
      pdf.text('故障率分析报告', 14, 15);
      // 插入表格图片
      const imgWidth = 270, imgHeight = tableCanvas.height * imgWidth / tableCanvas.width;
      pdf.addImage(tableCanvas.toDataURL('image/png'), 'PNG', 14, 25, imgWidth, imgHeight);
      // 插入图表图片
      if (scatterImgData) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text('故障率分析图表', 14, 15);
        pdf.addImage(scatterImgData, 'PNG', 14, 25, imgWidth, 120);
      }
      pdf.save(`${fileName}.pdf`);
      message.success('PDF导出成功');
    } catch {
      message.error('PDF导出失败，请重试');
    }
  };

  // 故障分析导出提交
  const handleFaultExportSubmit = async (values) => {
    const { exportType, fileName } = values;
    try {
      if (exportType === 'excel') {
        exportFaultToExcel(fileName);
      } else {
        await exportFaultToPDF(fileName);
      }
      setFaultExportVisible(false);
    } catch {
      message.error('导出失败');
    }
  };

  // 历史数据表格导出Excel
  const exportTableToExcel = (fileName) => {
    const { headers, data } = prepareExportData(); // 复用已有逻辑
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = headers.map(() => ({ wch: 15 }));
    XLSX.utils.book_append_sheet(wb, ws, '历史数据');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  // 历史数据表格导出PDF
  const exportTableToPDF = async (fileName) => {
    try {
      // 1. 构造表格HTML
      const { headers, data } = prepareExportData();
      const tableDiv = document.createElement('div');
      tableDiv.style.position = 'absolute';
      tableDiv.style.left = '-9999px';
      tableDiv.style.top = '-9999px';
      tableDiv.innerHTML = `
        <h2 style='margin-bottom: 15px;'>历史数据表格</h2>
        <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
          <thead>
            <tr style="background-color: #2980b9; color: white;">
              ${headers.map(header => `<th style="padding: 8px; border: 1px solid #ddd;">${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${row.map(cell => `<td style="padding: 8px; border: 1px solid #ddd;">${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      document.body.appendChild(tableDiv);
      // 2. 截图表格
      const tableCanvas = await html2canvas(tableDiv, { scale: 2, useCORS: true, logging: false });
      document.body.removeChild(tableDiv);
      // 3. 生成PDF
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.setFontSize(16);
      pdf.text('历史数据表格', 14, 15);
      const imgWidth = 270, imgHeight = tableCanvas.height * imgWidth / tableCanvas.width;
      pdf.addImage(tableCanvas.toDataURL('image/png'), 'PNG', 14, 25, imgWidth, imgHeight);
      pdf.save(`${fileName}.pdf`);
      message.success('PDF导出成功');
    } catch {
      message.error('PDF导出失败，请重试');
    }
  };

  // 历史数据表格导出提交
  const handleTableExportSubmit = async (values) => {
    const { exportType, fileName } = values;
    try {
      if (exportType === 'excel') {
        exportTableToExcel(fileName);
      } else {
        await exportTableToPDF(fileName);
      }
      setTableExportVisible(false);
    } catch {
      message.error('导出失败');
    }
  };

  // 处理搜索
  const handleSearch = () => {
    if (selectedDevices.length === 0) {
      message.warning('请至少选择一个设备');
      return;
    }

    if (dateRange.length !== 2) {
      message.warning('请选择日期范围');
      return;
    }

    // 触发历史数据加载
    setHistoricalData(mockHistoricalData); // 使用静态数据
  };

  useEffect(() => {
    setLoading(false);
    setSelectedDevices(mockDeviceList.slice(0, 5).map(d => d.id));
    setHistoricalData(mockHistoricalData);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Spin spinning={loading && !historicalData}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card variant="borderless">
              <Title level={3}>历史数据分析</Title>

              <Form layout="horizontal">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="设备选择" required>
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="请选择设备"
                        value={selectedDevices}
                        onChange={setSelectedDevices}
                        maxTagCount={2}
                      >
                        {deviceList.map(device => (
                          <Option key={device.id} value={device.id}>
                            {device.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item label="日期范围" required>
                      <RangePicker
                        showTime
                        style={{ width: '100%' }}
                        onChange={setDateRange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={3}>
                    <Form.Item label="时间粒度">
                      <Select
                        value={timeGranularity}
                        onChange={setTimeGranularity}
                        style={{ width: '100%' }}
                      >
                        <Option value="hour">小时</Option>
                        <Option value="day">天</Option>
                        <Option value="month">月</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={3}>
                    <Form.Item label="数据类型">
                      <Select
                        value={dataType}
                        onChange={setDataType}
                        style={{ width: '100%' }}
                      >
                        <Option value="temperature">温度</Option>
                        <Option value="vibration">振动</Option>
                        <Option value="current">电流</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={3} style={{ textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={handleSearch}
                      style={{ width: 100, marginTop: 0 }}
                    >
                      查询
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>

        {historicalData && (
          <>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card
                  title="数据可视化"
                  variant="borderless"
                  extra={
                    <Space>
                      <Button
                        type={chartType === 'line' ? 'primary' : 'default'}
                        icon={<LineChartOutlined />}
                        onClick={() => setChartType('line')}
                        title="折线图"
                      />
                      <Button
                        type={chartType === 'bar' ? 'primary' : 'default'}
                        icon={<BarChartOutlined />}
                        onClick={() => setChartType('bar')}
                        title="柱状图"
                      />
                      <Button
                        type={chartType === 'scatter' ? 'primary' : 'default'}
                        icon={<PieChartOutlined />}
                        onClick={() => setChartType('scatter')}
                        title="散点图"
                      />
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExportData}
                      >
                        导出数据
                      </Button>
                    </Space>
                  }
                >
                  <div ref={chartRef} style={{ height: 400, width: '100%' }} />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="故障率分析" variant="borderless"
                  extra={
                    <Button icon={<DownloadOutlined />} onClick={() => setFaultExportVisible(true)}>
                      导出数据
                    </Button>
                  }
                >
                  <div ref={scatterChartRef} style={{ height: 400, width: '100%' }} />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="历史数据表格" variant="borderless"
                  extra={
                    <Button icon={<DownloadOutlined />} onClick={() => setTableExportVisible(true)}>
                      导出数据
                    </Button>
                  }
                >
                  <div ref={tableRef}>
                    {renderDataTable()}
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}

        <Modal
          title="导出数据"
          open={exportVisible}
          onCancel={() => setExportVisible(false)}
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

            <Form.Item name="fileName" label="文件名称" initialValue="历史数据">
              <Input placeholder="请输入文件名称" />
            </Form.Item>

            <Form.Item name="exportContent" label="导出内容">
              <Checkbox.Group>
                <Row>
                  <Col span={8}>
                    <Checkbox value="timestamps" defaultChecked>时间戳</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="temperature" defaultChecked>温度数据</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="vibration" defaultChecked>振动数据</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="current">电流数据</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="faultRate">故障率</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Button style={{ marginRight: 8 }} onClick={() => setExportVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                导出
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* 故障分析导出弹窗 */}
        <Modal
          title="导出故障分析数据"
          open={faultExportVisible}
          onCancel={() => setFaultExportVisible(false)}
          footer={null}
        >
          <Form onFinish={handleFaultExportSubmit} layout="vertical">
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
            <Form.Item name="fileName" label="文件名称" initialValue="故障分析">
              <Input placeholder="请输入文件名称" />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Button style={{ marginRight: 8 }} onClick={() => setFaultExportVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                导出
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* 历史数据表格导出弹窗 */}
        <Modal
          title="导出历史数据表格"
          open={tableExportVisible}
          onCancel={() => setTableExportVisible(false)}
          footer={null}
        >
          <Form onFinish={handleTableExportSubmit} layout="vertical">
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
            <Form.Item name="fileName" label="文件名称" initialValue="历史数据表格">
              <Input placeholder="请输入文件名称" />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Button style={{ marginRight: 8 }} onClick={() => setTableExportVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                导出
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default HistoricalData; 
