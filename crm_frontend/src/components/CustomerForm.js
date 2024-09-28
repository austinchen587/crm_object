import React, { useState } from "react";  // 导入React和useState
import axios from 'axios' // 导入axios库用于发送HTTP请求
import { useNavigate } from "react-router-dom";  // 导入React Router的useNavigate用于跳转

const CustomerForm = ({ token, onCustomerAdded }) => {
    
  console.log("Token received in CustomerForm:", token);
  
  // 定义状态
    const [name, setName] = useState('');  // 客户姓名
    const [phone, setPhone] = useState('');  // 客户电话
    const [wechatId, setWechatId] = useState('');  // 客户微信号
    const [address, setAddress] = useState('');  // 客户地址
    const [education, setEducation] = useState('');  // 学历
    const [majorCategory, setMajorCategory] = useState('');  // 专业类别
    const [majorDetail, setMajorDetail] = useState('');  // 专业详细信息
    const [status, setStatus] = useState('');  // 状态
    const [description, setDescription] = useState('');  // 客户描述
    const [errorMessage, setErrorMessage] = useState('');  // 错误信息
    
    const navigate = useNavigate();  // 使用useNavigate进行页面跳转


    // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();  // 阻止默认表单提交行为

    const newCustomer = {
      name,
      phone,
      wechat_id: wechatId,
      address,
      education,
      major_category: majorCategory,
      major_detail: majorDetail,
      status,
      description,  // 添加描述字段
    };

    console.log('Submitting new customer:', newCustomer);  // 输出提交的数据

    axios.post('http://localhost:8000/customers/', newCustomer, {
      headers: {
        Authorization: `Token ${token}`,  // 在请求头中添加Token
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      console.log('Customer added:', response.data);
      onCustomerAdded();  // 调用父组件传递的回调函数，通知新客户已添加

      // 清空表单
      setName('');
      setPhone('');
      setWechatId('');
      setAddress('');
      setEducation('');
      setMajorCategory('');
      setMajorDetail('');
      setStatus('');
      setDescription('');  // 清空描述字段
    })
    .catch(error => {
      console.error('Error adding customer:', error.response?.data || error.message);  // 打印服务器的详细错误信息
      setErrorMessage('Failed to add customer: ' + (error.response?.data?.message || 'Unknown error'));
    });
  };

   // 返回客户列表
   const handleGoBack = () => {
    navigate('/customers');  // 跳转到客户列表页面
  };

  return (
    <div>
      <h2>添加新客户</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}  {/* 显示错误信息 */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>姓名:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>电话:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>微信号:</label>
          <input
            type="text"
            value={wechatId}
            onChange={(e) => setWechatId(e.target.value)}
          />
        </div>
        <div>
          <label>地址:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <label>学历:</label>
          <select value={education} onChange={(e) => setEducation(e.target.value)} required>
            <option value="">选择学历</option>
            <option value="below_college">大专以下</option>
            <option value="college">大专</option>
            <option value="bachelor">本科</option>
            <option value="master_above">研究生及以上</option>
          </select>
        </div>
        <div>
          <label>专业类别:</label>
          <select
            value={majorCategory}
            onChange={(e) => setMajorCategory(e.target.value)}
            required
          >
            <option value="">选择专业类别</option>
            <option value="it">IT</option>
            <option value="non_it">非IT</option>
          </select>
        </div>
        {majorCategory && (
          <div>
            <label>专业详细信息:</label>
            <input
              type="text"
              value={majorDetail}
              onChange={(e) => setMajorDetail(e.target.value)}
              placeholder={`输入${majorCategory}相关专业`}
            />
          </div>
        )}
        <div>
          <label>状态:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="">选择状态</option>
            <option value="employed">在职</option>
            <option value="unemployed">待业</option>
          </select>
          </div>
          <div>
          <label>客户描述:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="输入客户描述"
          />
        </div>
        <button type="submit">添加客户</button>
      </form>
      <button onClick={handleGoBack}>返回客户列表</button>  {/* 返回客户列表按钮 */}
    </div>
  );
};

export default CustomerForm;