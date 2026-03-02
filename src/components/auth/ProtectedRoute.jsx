import { Navigate, useLocation } from 'react-router-dom';
import { getToken, isTokenValid, clearAuth } from '@/utils/auth';

/**
 * 保护路由组件
 * 如果用户已登录，则渲染子组件
 * 如果用户未登录，则重定向到登录页面
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = getToken();
  // 每次渲染进行 token 校验
  if (!isTokenValid(token)) {
    clearAuth();
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;