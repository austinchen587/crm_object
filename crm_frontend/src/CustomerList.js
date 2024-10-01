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

  // 日期过滤逻辑函数
  const filterCustomersByDate = (allCustomers) => {
    console.log("验证日期过滤逻辑...");
    console.log("开始日期:", startDate);
    console.log("结束日期:", endDate);
    console.log("当前客户列表:", allCustomers);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // 如果开始日期晚于结束日期，设置错误信息并返回空数组
      if (start > end) {
        setDateError('开始时间不能晚于截止日期');
        return [];
      } else {
        setDateError('');
      }

      // 将结束日期设为当天的23:59:59，以包含结束日期整天
      end.setHours(23,59,59,999);

      const filteredCustomers = allCustomers.filter(customer => {
        const createdAt = new Date(customer.created_at);
        return createdAt >= start && createdAt <= end;
      });
      return filteredCustomers;
    } else if (startDate) {
      const start = new Date(startDate);
      const filteredCustomers = allCustomers.filter(customer => {
        const createdAt = new Date(customer.created_at);
        return createdAt >= start;
      });
      setDateError('');
      return filteredCustomers;
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23,59,59,999);
      const filteredCustomers = allCustomers.filter(customer => {
        const createdAt = new Date(customer.created_at);
        return createdAt <= end;
      });
      setDateError('');
      return filteredCustomers;
    } else {
      setDateError('');
      return allCustomers;
    }
  };

  // 计算未更新天数的函数
  const calculateDaysSinceUpdate = (lastUpdated) => {
    const currentDate = new Date();
    const updatedDate = new Date(lastUpdated);
    const timeDiff = currentDate - updatedDate;
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)); // 转换为天数
    return dayDiff >= 0 ? dayDiff : 'N/A'; // 如果计算出有效天数，返回天数；否则返回'N/A'
  };

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
      let url = `http://47.96.23.135:8000/customers/`;

      setLoading(true);  // 请求开始，设置loading为true
      axios.get(url, {
        headers: { Authorization: `Token ${token}` },    // 确保在请求头中传递Token
      })
        .then(response => {
          const responseData = response.data;
          console.log("从后端收到的响应数据:", responseData);

          // 提取客户数据，如果后端返回的是对象，则提取其中的数组
          const allCustomers = Object.values(responseData).flat();
          
          // 过滤客户数据，按照日期范围筛选
          const filteredCustomers = filterCustomersByDate(allCustomers);
          
          setCustomers(filteredCustomers); // 更新客户列表
          console.log("筛选后的客户列表:", filteredCustomers);
          setLoading(false);  // 请求结束，设置loading为false
          
        })
        .catch(error => {
          console.error("获取客户列表时出错:", error.response?.data || error.message);  // 打印详细错误信息
          setErrorMessage("Failed to fetch customers: " + (error.response?.data?.message || 'Unknown error'));
          setLoading(false); // 请求结束，设置loading为false
        });

    }
  }, [token, customerUpdated, startDate, endDate]);  // 每当token或customerUpdated变化时重新获取客户数据 // 监听日期和客户更新变化

  // 处理按照创建者分组的函数
  const groupCustomersByUser = (customerList) => {
    console.log("Grouping customers by user", customerList);
    return customers.reduce((acc, customer) => {
      const creator = customer.created_by || '未知用户';
      if (!acc[creator]) acc[creator] = [];      
      acc[creator].push(customer);
      return acc;
    }, {});
  };

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

  // 如果loading中，显示加载中信息
  if (loading) {
    return <div>加载中...</div>
  }

  // 如果没有客户，显示增加客户的功能
  if (!customers.length) {
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

  // 分组后的客户列表
  const groupedCustomers = groupCustomersByUser(customers);
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
                <th>未更新天数</th> {/* 新增未更新天数列 */}
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {groupedCustomers[creator].map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{new Date(customer.created_at).toLocaleDateString()}</td> {/* 显示年月日 */}
                  <td>{customer.updated_at ? new Date(customer.updated_at).toLocaleDateString() : '未修改'}</td>  {/* 显示年月日 */}
                  <td>{customer.updated_at ? calculateDaysSinceUpdate(customer.updated_at) : 'N/A'}</td> {/* 计算并显示未更新天数 */}
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