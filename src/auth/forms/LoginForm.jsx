import React, { useState } from "react";
import { SmileOutlined } from "@ant-design/icons";
import { Form, Input, Button, Checkbox, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 6,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 14,
    },
  },
};

const LoginForm = () => {
  const navigate = useNavigate();
  // const {setToken}=  useUserStore();
  const [form] = Form.useForm();
  const [currentRole, setCurrentRole] = useState("employee");
  const handleRoleChange = (role) => {
    setCurrentRole(role);
  };
  const [loading, setLoading] = useState(false);

  //表单提交事件
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const response = await login(values.username, values.password);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // 保存token和用户信息
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        message.success('登录成功！');
        
        // 根据用户角色跳转
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/employee');
        }
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };
  // 角色配置
  const roleConfig = {
    employee: {
      backgroundImage: "/public/assets/images/stu.png",
      // api: stuLoginAPI,
      // getInfoAPI: getStuInfoAPI,
    },
  
    admin: {
      backgroundImage: "/public/assets/images/manager.png",
      // api: loginAPI,
      // getInfoAPI: getUserInfoAPI,
    },
  };
  return (
    <>
      <h1 className="h3-bold md:h2-bold pb-5 sm:pb-12 text-white font-bold text-2xl">
        人力资源管理
      </h1>

      <p className="text-white font-light text-xl small-medium md:base-regular mt-2 mb-4 ">
       老板我喜欢加班
      </p>
      <div className="w-full  max-w-2xl h-[500px] max-h-2xl mt-4 py-12 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden flex gap-4">
        <Form
          {...formItemLayout}
          className="max-w-[1000px] flex-1 flex flex-col justify-center "
          onFinish={handleLogin}
          form={form}
        >
          <div className="flex justify-center mb-6">
            
            <Button
              color={currentRole === "admin" ? "purple" : ""}
              variant="solid"
              className="mr-4"
              onClick={() => handleRoleChange("admin")}
            >
              我是管理员
            </Button>
            <Button
              color={currentRole === "employee" ? "purple" : ""}
              variant="solid"
              onClick={() => handleRoleChange("employee")}
            >
              我是员工
            </Button>
          </div>
          <div
            className="flex flex-col items-center justify-center flex-1 pl-24"
            style={{
              backgroundImage: `url('${roleConfig[currentRole].backgroundImage}')`,
              backgroundSize: "500px",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.8,
            }}
          >
            <div className="w-[300px] mt-16 ">
              <Form.Item
                name="username"
                label="账号"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "请输入账号",
                  },
                  {
                    min: 2,
                    message: "账号长度不能小于2位",
                  },
                  {
                    max: 20,
                    message: "账号长度不能超过20位",
                  },
                ]}
              >
                <Input placeholder="请输入账号" id="error" />
              </Form.Item>

              <Form.Item
                label="登录密码"
                hasFeedback
                name="password"
                rules={[
                  {
                    required: true,
                    message: "请输入密码",
                  },
                  {
                    min: 6,
                    message: "密码长度不能小于6位",
                  },
                  {
                    max: 20,
                    message: "密码长度不能超过20位",
                  },
                ]}
              >
                <Input.Password
                  placeholder="请输入密码"
                  prefix={<SmileOutlined />}
                />
              </Form.Item>

              {/* {currentRole != "admin" && (
            <Form.Item label="选择学校" name="schoolCode">
              <Select
                placeholder="请选择学校"
                // onChange={handleSchoolSelect}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={schoolList.map((school) => ({
                  value: school.schoolCode,
                  label: `${school.schoolName} (${school.schoolCode})`,
                }))}
              />
            </Form.Item>
          )} */}

              <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
                <Form.Item  valuePropName="checked" noStyle>
                  <Checkbox>记住密码</Checkbox>
                </Form.Item>
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
                <Button
                  variant="solid"
                  color="purple"
                  htmlType="submit"
                  block
                  loading={loading}
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
                {currentRole === "admin" && (
                  <span
                    className="-mt-6 block text-center text-blue-500 cursor-pointer hover:text-blue-700"
                    onClick={() => navigate("/register")}
                  >
                    还没有账号？立即注册
                  </span>
                )}
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </>
    
  )
}

export default LoginForm