import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditCustomer = ({ token }) => {
  const { id } = useParams(); // 获取URL中的客户ID
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    wechat_id: "",
    address: "",
    education: "below_college",  // 默认值
    major_category: "it",  // 默认值
    status: "employed",  // 默认值
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // 获取当前客户详细信息
    axios
      .get(`http://47.96.23.135:8000/customer-detail/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((response) => {
        console.log("Fetched customer data:", response.data);
        setCustomer(response.data);  // 设置客户详细信息
      })
      .catch((error) => {
        console.error("Error fetching customer details:", error);
        setErrorMessage("Failed to load customer details.");
      });
  }, [id, token]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const requestData = {
      name: customer.name,
      phone: customer.phone,
      wechat_id: customer.wechat_id,
      address: customer.address,
      education: customer.education,
      major_category: customer.major_category,
      status: customer.status,
      description: customer.description,
    };

    console.log("Submitting updated customer data:", requestData);

    axios
      .put(`http://47.96.23.135:8000/customer-detail/${id}/`, requestData, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((response) => {
        console.log("Customer updated successfully:", response.data);
        navigate(`/customer-detail/${id}`);  // 更新成功后跳转到客户详情页面
      })
      .catch((error) => {
        console.error("Error updating customer:", error.response?.data || error.message);
        setErrorMessage("Failed to update customer: " + (error.response?.data?.message || error.message));
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
  };

  return (
    <div>
      <h2>编辑客户信息</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          姓名:
          <input
            type="text"
            name="name"
            value={customer.name}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          电话:
          <input
            type="text"
            name="phone"
            value={customer.phone}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          微信号:
          <input
            type="text"
            name="wechat_id"
            value={customer.wechat_id}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          地址:
          <input
            type="text"
            name="address"
            value={customer.address}
            onChange={handleInputChange}
          />
        </label>
        <br />

        {/* 学历下拉框 */}
        <label>
          学历:
          <select
            name="education"
            value={customer.education}
            onChange={handleInputChange}
          >
            <option value="below_college">大专以下</option>
            <option value="college">大专</option>
            <option value="bachelor">本科</option>
            <option value="master_above">研究生及以上</option>
          </select>
        </label>
        <br />

        {/* 专业类别下拉框 */}
        <label>
          专业类别:
          <select
            name="major_category"
            value={customer.major_category}
            onChange={handleInputChange}
          >
            <option value="it">IT</option>
            <option value="non_it">非IT</option>
          </select>
        </label>
        <br />

        {/* 状态下拉框 */}
        <label>
          状态:
          <select
            name="status"
            value={customer.status}
            onChange={handleInputChange}
          >
            <option value="employed">在职</option>
            <option value="unemployed">待业</option>
          </select>
        </label>
        <br />

        <label>
          描述:
          <textarea
            name="description"
            value={customer.description}
            onChange={handleInputChange}
          />
        </label>
        <br />

        <button type="submit">保存修改</button>
      </form>
    </div>
  );
};

export default EditCustomer;