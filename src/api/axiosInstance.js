import axios from 'axios';
import { goTo } from '../utils/navigate';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL + '/api/v1',
  withCredentials: true, // refreshToken 쿠키 자동 포함
});

// 요청 인터셉터: accessToken 자동 헤더 추가
instance.interceptors.request.use(
  (config) => {
    // 로그인, 회원가입 등 특정 요청에는 Authorization 헤더를 추가하지 않음
    const excludedPaths = ['/auth/login', '/auth/register'];
    const isExcluded = excludedPaths.some((path) => config.url?.includes(path));

    if (!isExcluded) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh Token 로직
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

// 응답 인터셉터: 403 처리 및 refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const path = window.location.pathname;

    // 403이면서 로그인 페이지가 아닐 때
    if (
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry &&
      !/^\/(admin|inspector)\/login/.test(path)
    ) {
      // accessToken 삭제 (만료로 간주)
      localStorage.removeItem('accessToken');
      originalRequest._retry = true;

      // refreshToken 재발급 시도
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // refresh 요청
          const res = await instance.get('/auth/refresh', {
            withCredentials: true,
          });
          const newAccessToken = res.data.response.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          instance.defaults.headers[
            'Authorization'
          ] = `Bearer ${newAccessToken}`;
          onRefreshed(newAccessToken);
        } catch (e) {
          // refresh도 실패하면 로그인 페이지로 이동
          if (path.startsWith('/admin')) {
            goTo('/admin/login');
          } else if (path.startsWith('/inspector')) {
            goTo('/inspector/login');
          } else {
            goTo('/login');
          }
          return Promise.reject(e);
        } finally {
          isRefreshing = false;
        }
      }
      // refresh 완료까지 대기
      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          resolve(instance(originalRequest));
        });
      });
    }

    // 로그인 페이지이거나 기타 에러는 그대로
    return Promise.reject(error);
  }
);

export default instance;
