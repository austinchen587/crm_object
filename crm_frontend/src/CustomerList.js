import React, { useState, useEffect } from 'react';  
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // 导入useNavigate用于页面跳转

const CustomerList = ({ token, customerUpdated }) => {
  const [customers, setCustomers] = useState([]);   // 初始化客户列表的状态为空数组
  const [errorMessage, setErrorMessage] = useState('');
  const [startDate, setStartDate] = useState('') // 过滤开始日期
  const [endDate, setEndDate] = useState('') // 过滤结束日期
  const [loading, setLoading] = useState(true) // 增加一个loading状态来检测请求是否完成
  const [dateError, setDateError] = useState('')  // 日期选择错误的状态
  const navigate = useNavigate();  // 用于导航到客户详细页面


  // 使用useEffect在组件加载时发起HTTP请求
  useEffect(() => {
    if (token) {
      console.log("Token received in CustomerList:", token);

      // 验证日期逻辑
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setDateError('开始时间不能晚于截止日期');
        setCustomers([]); // 清空客户数据
        setLoading(false);
        return;
      }

      // 构建请求URL，包含可选的日期过滤参数
      let url = `http://localhost:8000/customers/`;
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      }

      setLoading(true);  // 请求开始，设置loading为true
      axios.get(url, {
        headers: { Authorization: `Token ${token}` },    // 确保在请求头中传递Token
      })
        .then(response => {
          const responseData = response.data;
          console.log("Response from backend:", responseData);

          // 提取客户数据，将所有创建者下的客户整合成一个数组
          const allCustomers = Object.values(responseData).flat(); // 将对象中的所有数组合并为一个大数组

          setCustomers(allCustomers); // 更新客户列表
          console.error("Customer list parsed and set:", allCustomers);
          setLoading(false)  // 请求结束，设置loading为false
          
        })
        .catch(error => {
          console.error("Error fetching customers:", error.response?.data || error.message);  // 打印详细错误信息
          setErrorMessage("Failed to fetch customers: " + (error.response?.data?.message || 'Unknown error'));
          setLoading(false); // 请求结束，设置loading为false
        });
    } else {
      console.log("No token provided!");
      setLoading(false);  // 如果没有token，停止loading
    }
  }, [token, customerUpdated,startDate,endDate]);  // 每当token或customerUpdated变化时重新获取客户数据 // 监听日期和客户更新变化

  // 处理按照创建者分组的函数
  const groupCustomersByUser = (customerList) => {
    console.log("Grouping customers by user", customerList);
    return customers.reduce((acc,customer) => {
      const creator = customer.created_by || '未知用户';
      if (!acc[creator]) {
        acc[creator] = [];
      }
      acc[creator].push(customer);
      return acc;
    }, {});
  };

  // 如果loading中，显示加载中信息
  if (loading) {
    return <div>加载中...</div>
  }

  // 日期选择错误时，显示错误信息
  if (dateError) {
    return(
      <div>
        <h1>客户列表</h1>
        <p style={{color:'red'}}>{dateError}</p>  {/* 显示日期错误信息 */}
        <button onClick={() => setDateError('')}>返回</button> {/* 返回上一步 */}
      </div>
    );
  }

  // 如果没有客户，显示增加客户的功能
  if (!customers.length && !dateError) {
    console.log("No customers found in list:", customers);
    return (
      <div>
        <h1>客户列表</h1>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}  {/* 显示错误信息 */}
        <p>当前没有客户，您可以添加新的客户。</p>  {/* 提示信息 */}
        <button onClick={() => navigate('/add-customer')} style={{ marginTop: '20px' }}>
          添加客户
        </button>
      </div>
    );
  }

  //分组后的客户列表
  const groupedCustomers =groupCustomersByUser(customers);
  console.log("Grouped customers:", groupedCustomers);

  return (
    <div>
      <h1>客户列表</h1>

      {/* 日期过滤器 */}
      <div style={{ marginBottom: '20px' }}>
        <label>开始日期:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <label style={{ marginLeft: '10px' }}>结束日期:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </div>

      {/* 客户列表按创建者分组显示 */}
      {Object.keys(groupedCustomers).map((creator, idx) => (
        <div key={idx}>
          <h3>客户归属: {creator}</h3>
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>创建日期</th>
                <th>最近修改日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {groupedCustomers[creator].map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{new Date(customer.created_at).toLocaleDateString()}</td> {/* 显示年月日 */}
                  <td>{customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : '未修改'}</td>  {/* 显示年月日 */}
                  <td>
                    <button onClick={() => navigate(`/customer-detail/${customer.id}`)}>查看详细信息</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* 添加客户按钮 */}
      <button onClick={() => navigate('/add-customer')} style={{ marginTop: '20px' }}>
        添加客户
      </button>
    </div>
  );
};

export default CustomerList;