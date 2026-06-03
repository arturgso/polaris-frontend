import axios from 'axios';

const apiIp = import.meta.env.VITE_API_IP ?? import.meta.env.VITE_API_HOST ?? 'polaris:8089';
const normalizedApiIp = apiIp.replace(/^https?:\/\//, '').replace(/\/$/, '');

export const api = axios.create({
  baseURL: `http://${normalizedApiIp}/api/v1`,
});
