import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';

const { Option } = Select;

// 模拟可选的维护人员列表
const mockMaintenancePersonnel = [
  { id: 'user1', name: '张三' },
  { id: 'user2', name: '李四' },
  { id: 'user3', name: '王五' },
  { id: 'user4', name: '赵六' },
];

const MaintenanceScheduleModal = ({ visible, onCancel, onConfirm, suggestion }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (suggestion && visible) {
      form.setFieldsValue({
        deviceId: suggestion.deviceId,
        deviceName: suggestion.deviceName,
        faultType: suggestion.faultType,
      });
    } else {
      form.resetFields();
    }
  }, [suggestion, visible, form]);

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500)); 
      onConfirm({ 
        ...values, 
        scheduledDate: values.scheduledDate ? values.scheduledDate.format('YYYY-MM-DD HH:mm') : null
      });
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
      message.error('请填写所有必填项！');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  }

  if (!suggestion) return null;

  return (
    <Modal
      title={`为 ${suggestion.deviceName} (${suggestion.deviceId}) 安排维护`}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnHidden
      width={600}
      footer={[
        <Button key="back" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
          确认安排
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="maintenanceScheduleForm">
        <Form.Item name="deviceId" label="设备ID">
          <Input disabled />
        </Form.Item>
        <Form.Item name="deviceName" label="设备名称">
          <Input disabled />
        </Form.Item>
        <Form.Item name="faultType" label="预测故障类型">
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="assignedPersonnel"
          label="指派人员"
          rules={[{ required: true, message: '请选择指派人员!' }]}
        >
          <Select mode="multiple" placeholder="请选择维护人员">
            {mockMaintenancePersonnel.map(person => (
              <Option key={person.id} value={person.name}>{person.name}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="scheduledDate"
          label="计划维护日期"
          rules={[{ required: true, message: '请选择计划维护日期!' }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="remarks" label="备注">
          <Input.TextArea rows={3} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MaintenanceScheduleModal;
