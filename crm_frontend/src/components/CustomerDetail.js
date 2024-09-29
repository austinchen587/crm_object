import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerDetail = ({ token, role: passedRole }) => {
    const { id } = useParams(); // 获取URL中的客户ID
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true); // 添加loading状态用于检查数据是否正在加载
    const [errorMessage, setErrorMessage] = useState(''); // 管理错误信息
    const [role, setRole] = useState(passedRole || localStorage.getItem('role') || '');  // 初始化 role
    const navigate = useNavigate(); // 用于页面跳转

    useEffect(() => {
        // 打印token和role的值
        console.log(`Token: ${token}, Role: ${role}`);

        if (token && id) {
            // 确保 token 和 id 存在
            console.log("Token and ID are both valid. Sending request...");
            axios.get(`http://localhost:8000/customer-detail/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            })
            .then(response => {
                console.log('Customer details fetched:', response.data);
                setCustomer(response.data);  // 获取到客户详细信息
            })
            .catch(error => {
                console.error('Error fetching customer details:', error);
                setErrorMessage('Failed to fetch customer details');
            })
            .finally(() => {
                setLoading(false);  // 数据加载完成
            });
        } else {
            console.log("No token or ID provided for fetching customer details");
            setLoading(false);  // 没有token时，直接结束加载状态
        }
    }, [token, id]);


    // 删除客户的函数，仅允许管理员或组长执行此操作
    const handleDelete = () => {
        if (token && id && (role === 'admin' || role === 'group_leader')) {
            if(role==='group_leader' && customer.created_by_group !== role) {
                setErrorMessage('组长只能删除本组的客户');
                return;
            }
            
            console.log(`Deleting customer ${id} as ${role}`);
            axios.delete(`http://localhost:8000/customer-detail/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            })
            .then(() => {
                console.log('Customer deleted successfully');
                navigate('/customers');  // 删除成功后跳转回客户列表
            })
            .catch(error => {
                console.error('Error deleting customer:', error);
                setErrorMessage('Failed to delete customer');
            });
        } else {
            console.log('User does not have permission to delete this customer.');
            setErrorMessage('You do not have permission to delete this customer');
        }
    };

    // 检查loading状态
    if (loading) {
        return <div>Loading customer details...</div>;
    }

    // 若未找到客户数据，返回错误提示
    if (!customer) {
        return <div>Customer not found</div>;
    }


    // 调试信息，检测 role 和 created_by 的值
    const currentUsername = localStorage.getItem('username'); // 从localStorage获取当前用户名
    console.log("currentRole:", role);
    console.log("customer.created_by:", customer.created_by); // 打印 created_by 直接返回用户名
    console.log("current username from localStorage:", currentUsername);

    // customer.created_by 已经是用户名字符串
    const createdByUsername = customer.created_by || ''; // 如果 created_by 未定义，返回空字符串
    console.log("createdByUsername:", createdByUsername); // 打印实际使用的用户名

    // 判断是否显示修改和删除按钮
    const canEdit = role === 'admin' || role === 'group_leader' || createdByUsername === currentUsername;
    const canDelete = role === 'admin' || (role === 'group_leader' && customer.created_by?.group_leader === role);

    return (
        <div>
          <h2>客户详细信息</h2>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* 显示错误信息 */}
          <p>姓名: {customer.name}</p>
          <p>电话: {customer.phone}</p>
          <p>微信号: {customer.wechat_id}</p>
          <p>地址: {customer.address}</p>
          <p>学历: {customer.education}</p>
          <p>专业类别: {customer.major_category}</p>
          <p>具体专业: {customer.major_detail}</p>
          <p>客户状态: {customer.status}</p>
          <p>客户描述: {customer.description || '无'}</p> {/* 显示客户描述 */}
          <p>创建时间: {new Date(customer.created_at).toLocaleString()}</p>
          <p>最近修改时间: {customer.updated_at ? new Date(customer.updated_at).toLocaleString() : '未修改'}</p>

          {/* 返回客户列表按钮 */}
          <button onClick={() => navigate('/customers')}>返回客户列表</button>

          {/* 显示修改和删除按钮的逻辑 */}
          {canEdit && (
            <>
              <button onClick={() => navigate(`/edit-customer/${id}`)}>修改客户信息</button>
            </>
           )}
           {canDelete && (
             <>
               <button onClick={handleDelete}>删除客户</button>
            </>
           )}          
        </div>
    );
};

export default CustomerDetail;