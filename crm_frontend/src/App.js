import React, { useEffect, useState } from 'react';  // 导入React和必要的Hook
import './App.css';  // 导入CSS样式
import CustomerList from './CustomerList';  // 导入CustomerList组件
import CustomerForm from './components/CustomerForm';
import CustomerDetail from './components/CustomerDetail';
import axios from 'axios';  // 导入axios库用于发送HTTP请求
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Register from './components/Register'; // 引入注册组件
import EditCustomer from './components/EditCustomer';


// App组件，包含整个应用的主要结构
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // 管理用户是否已登录的状态
  const [username, setUsername] = useState('');  // 管理用户名的状态
  const [password, setPassword] = useState('');  // 管理密码的状态
  const [errorMessage, setErrorMessage] = useState('');  // 管理错误信息
  const [loading, setLoading] = useState(true);  // 管理加载状态
  const [token, setToken] = useState(localStorage.getItem('token') || '');  // 自动获取Token
  const [customerUpdated, setCustomerUpdated] = useState(false);  // 这个状态用于跟踪客户更新情况
  const [role, setRole] = useState(localStorage.getItem('role') || ''); // 用户角色状态（如user、组长、管理员）


  // 使用useEffect在组件加载时发起HTTP请求验证Token
  useEffect(() => {
    console.log('Initial loading state:', loading);
    const token = localStorage.getItem('token');  // 从localStorage中获取Token
    const storedRole = localStorage.getItem('role'); // 从localStorage中获取role
    console.log('Token found:', token);
    console.log('Role found:', storedRole);

    if (token) {
      console.log('Sending token to verify...');  // 调试点：检查发送到后端的Token验证
      // 验证Token
      axios.get('http://localhost:8000/token-verify/', {
        headers: { Authorization: `Token ${token}` },
      })
      .then(response => {
        if (response.status === 200) {
          console.log('Token is valid, setting isLoggedIn to true');  // 调试点：token验证成功
          setIsLoggedIn(true);  // 如果Token验证成功，则设置登录状态为true
          setRole(storedRole);  // 设置角色状态，确保获取到当前用户角色
        }
      })
      .catch(error => {
        console.error('Token verification failed:', error);
        setIsLoggedIn(false);  // 如果Token验证失败，设置登录状态为false
      })
      .finally(() => {
        console.log('Finished token verification');  // 调试点：完成Token验证
        setLoading(false);  // 无论验证成功或失败，结束加载状态
      });
    } else {
      console.log('No token found, setting loading to false');  // 调试点：没有token的情况
      setLoading(false);  // 没有Token，直接结束加载状态
    }
  }, []);

  // 处理登录逻辑
  const handleLogin = () => {
    console.log("Username:", username);  // 检查用户名
    console.log("Password:", password);  // 检查密码
    axios.post('http://localhost:8000/login/', {
      username: username,
      password: password,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
    .then(response => {
      console.log('登录请求成功，响应数据:', response.data);
      const token = response.data.token;  // 假设后端返回Token
      const returnedUsername = response.data.username;  // 假设后端返回用户名
      const returnedRole = response.data.role;  // 假设后端返回角色

      // 检查是否有role返回
      if (!returnedRole) {
        console.error('No role returned from server.');
      } else {
        console.log('Role received from server:', returnedRole);
      }


      // 存储Token到localStorage
      localStorage.setItem('token', token);  // 将Token存储到localStorage
      localStorage.setItem('username', returnedUsername);  // 确保用户名存储
      localStorage.setItem('role', returnedRole); // 确保角色存储
      
      console.log('Token存储成功:', token);
      setToken(token);  // 更新Token
      setRole(returnedRole || ''); // 更新角色
      setIsLoggedIn(true);  // 登录成功后更新状态
      setErrorMessage('');  // 清除错误信息
    })
    .catch(error => {
      console.error('Login failed', error);
      setErrorMessage('Login failed: ' + (error.response?.data?.message || 'Unknown error'));  // 显示错误信息
    });
  };

  // 处理登出逻辑
  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');  // 清除Token
    localStorage.removeItem('username'); // 清除用户名
    localStorage.removeItem('role'); // 清除角色
    setIsLoggedIn(false); // 设置为未登录状态
    setToken('');  // 清空token
    setRole('');   // 清空角色
    console.log('User logged out successfully');
  };


  // 处理客户更新的回调函数
  const handleCustomerUpdate = () => {
    console.log('Customer updated, triggering re-fetch...');  // 调试点：客户更新
    setCustomerUpdated(!customerUpdated);  // 切换customerUpdated的值以触发CustomerList更新
  };



  // 如果正在加载Token验证，显示一个加载状态
  if (loading) {
    return <div>Loading...</div>;
  }

  console.log('Current isLoggedIn state:', isLoggedIn);  // 调试点：当前登录状态
  console.log('User role:', role); //调试点：当前用户角色

  // 渲染登录表单、注册表单或客户列表
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>CRM系统</h1>
          {isLoggedIn && <button onClick={handleLogout}>登出</button>}  {/* 登出按钮 */}
        </header>
        <Routes>
          {/* 确保登入和登出页面逻辑正确 */}
          {!isLoggedIn ? (
            <>
              <Route
                path="/login"
                element={
                  <div>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}  {/* 显示错误信息 */}
                    <input
                      type="text"
                      placeholder="用户名"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin}>登录</button>
                    <p>没有账号？<a href="/register">去注册</a></p>  {/* 注册页面链接 */}
                  </div>
                }
              />
              
              {/* 注册页面 */}
              <Route
                path="/register"
                element={<Register />}
              />
            </>
          ) : (
            <>
              <Route
                path="/customers"
                element={<CustomerList token={token} customerUpdated={customerUpdated} role={role} />}  // 传递token和customerUpdated
              />
              {/* 客户详细信息页面 */}
              <Route
                path="/customer-detail/:id"
                element={<CustomerDetail token={token} role={role} />}
              />
              {/* 客户信息修改页面 */}
              <Route
                path="/edit-customer/:id"
                element={<EditCustomer token={token} />}  // 传递Token确保授权
              />

              <Route
                path="/add-customer"
                element={<CustomerForm token={token} onCustomerAdded={handleCustomerUpdate} />}  // 传递handleCustomerUpdate函数
              />
            </>
          )}
          
          {/* 未登录时重定向到登录或注册页面 */}
          <Route path="*" element={!isLoggedIn ? <Navigate to="/login" /> : <Navigate to="/customers" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;