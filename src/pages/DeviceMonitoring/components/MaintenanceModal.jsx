import { Modal, Form, Input, Select } from 'antd';

const { Option } = Select;

const MaintenanceModal = ({ visible, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  return (
    <Modal
      title="设备维护"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="type"
          label="维护类型"
          rules={[{ required: true, message: '请选择维护类型' }]}
        >
          <Select>
            <Option value="routine">常规维护</Option>
            <Option value="repair">故障维修</Option>
            <Option value="upgrade">设备升级</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="operator"
          label="维护人员"
          rules={[{ required: true, message: '请输入维护人员' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="维护内容"
          rules={[{ required: true, message: '请输入维护内容' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MaintenanceModal;
