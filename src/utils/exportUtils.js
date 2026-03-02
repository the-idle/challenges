import * as XLSX from 'xlsx';

/**
 * 导出数据到Excel文件
 * @param {Array} data - 要导出的数据数组
 * @param {string} fileName - 导出文件名（不需要包含扩展名）
 * @param {Array} headers - 表头配置，格式：[{ title: '显示名称', dataIndex: '数据字段名' }]
 * @param {string} sheetName - 工作表名称，默认为'Sheet1'
 */
export const exportToExcel = (data, fileName, headers, sheetName = 'Sheet1') => {
  try {
    // 转换数据格式
    const exportData = data.map(item => {
      const row = {};
      headers.forEach(header => {
        row[header.title] = item[header.dataIndex];
      });
      return row;
    });

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 设置列宽
    const colWidths = headers.map(header => ({ wch: Math.max(header.title.length * 2, 15) }));
    ws['!cols'] = colWidths;

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 导出文件
    XLSX.writeFile(wb, `${fileName}_${new Date().toLocaleDateString()}.xlsx`);

    return true;
  } catch (error) {
    console.error('导出Excel文件失败:', error);
    throw new Error('导出文件失败，请稍后重试');
  }
};

/**
 * 导出数据到CSV文件
 * @param {Array} data - 要导出的数据数组
 * @param {string} fileName - 导出文件名（不需要包含扩展名）
 * @param {Array} headers - 表头配置，格式：[{ title: '显示名称', dataIndex: '数据字段名' }]
 */
export const exportToCSV = (data, fileName, headers) => {
  try {
    // 转换数据格式
    const exportData = data.map(item => {
      const row = {};
      headers.forEach(header => {
        row[header.title] = item[header.dataIndex];
      });
      return row;
    });

    // 创建工作簿
    const wb = XLSX.utils.book_new();

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // 导出文件
    XLSX.writeFile(wb, `${fileName}_${new Date().toLocaleDateString()}.csv`);

    return true;
  } catch (error) {
    console.error('导出CSV文件失败:', error);
    throw new Error('导出文件失败，请稍后重试');
  }
}; 