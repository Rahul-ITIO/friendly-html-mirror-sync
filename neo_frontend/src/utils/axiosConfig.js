import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || 'http://localhost:9003' || 'http://localhost:3000',
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Get the specific token based on user type
    const adminToken = sessionStorage.getItem("admin-jwtToken");
    const customerJwtToken = sessionStorage.getItem("customer-jwtToken");
    const customerToken = sessionStorage.getItem("active-customer");
    const bankToken = sessionStorage.getItem("active-bank");
    const merchantToken = sessionStorage.getItem("active-merchant");

    // Use the appropriate token based on which one exists
    let token;
    if (adminToken) {
      token = adminToken;
    } else if (customerJwtToken) {
      token = customerJwtToken;
    } else if (customerToken) {
      token = customerToken;
    } else if (bankToken) {
      token = bankToken;
    } else if (merchantToken) {
      token = merchantToken;
    }

    if (!token) {
      console.warn('No valid token found');
      window.location.href = '/login';
      return Promise.reject(new Error('No valid token'));
    }

    config.headers.Authorization = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
