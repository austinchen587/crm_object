import React, {useState} from 'react';
import axios from 'axios'; // 引入axios用于发送HTTP请求

const Register = () => {
    // 定义组件状态变量
    const [username, setUsername] = useState('');  // 用于存储用户名
    const [password, setPassword] = useState('');  // 用于存储密码
    const [confirmPassword, setConfirmPassword] = useState('');  // 用于存储确认密码
    const [message, setMessage] = useState('');    // 用于显示注册的反馈信息
    const [loading, setLoading] = useState(false); // 显示请求是否正在处理
  
    // 处理注册逻辑
    const handleRegister = async (event) => {
      event.preventDefault();  // 防止表单自动提交刷新页面
  
      // 前端检测密码是否匹配
      if (password !== confirmPassword) {
        setMessage('两次密码输入不一致');
        console.warn("密码不匹配，注册失败");  // 日志检测点1：密码不一致
        return;
      }
  
      setLoading(true);  // 设置为正在加载状态
  
      console.log("开始注册请求...");  // 日志检测点2：用户点击注册按钮
      console.log(`用户名: ${username}, 密码: ${password}`);  // 打印用户输入的信息
  
      try {
        // 发送注册请求到后端API
        const response = await axios.post('http://127.0.0.1:8000/register/', {
          username,
          password,
        });
  
        // 处理成功响应
        if (response.status === 201) {
          setMessage('注册成功！');
          console.log("注册成功，服务器响应:", response.data);  // 日志检测点3：注册成功
        } else {
          setMessage('注册失败，请稍后重试。');
          console.warn("注册失败，未返回201:", response);  // 日志检测点4：注册失败
        }
      } catch (error) {
        // 处理错误响应
        if (error.response) {
          setMessage(`注册错误: ${error.response.data.message}`);
          console.error("注册时出错:", error.response.data);  // 日志检测点5：显示错误信息
        } else {
          setMessage('无法连接到服务器，请稍后重试。');
          console.error("网络连接错误:", error);  // 日志检测点6：网络问题
        }
      } finally {
        setLoading(false);  // 请求完成后取消加载状态
      }
    };
  
    return (
      <div className="register-container">
        <h2>用户注册</h2>
        <form onSubmit={handleRegister}>
          <div>
            <label>用户名:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>密码:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>确认密码:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        {/* 如果有消息，显示在页面上 */}
        {message && <p>{message}</p>}
      </div>
    );
  };
  
  export default Register;