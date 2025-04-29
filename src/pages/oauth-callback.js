import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const router = useRouter();
  const { token } = router.query;
  const { login } = useAuth();
  const client = useApolloClient();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (token) {
        try {
          // 清除 Apollo 缓存
          await client.resetStore();
          
          // 保存令牌到本地存储
          localStorage.setItem('token', token);
          
          // 更新认证状态
          login(token);
          
          // 重定向到个人资料页面
          router.push('/profile');
        } catch (error) {
          console.error('OAuth 回调处理错误:', error);
          router.push('/login?error=auth_failed');
        }
      }
    };

    if (token) {
      handleOAuthCallback();
    } else if (router.isReady) {
      // 如果没有令牌但路由已准备好，重定向到登录页面
      router.push('/login?error=no_token');
    }
  }, [token, router.isReady, login, client, router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 3 }}>
        正在处理您的登录...
      </Typography>
    </Box>
  );
};

export default OAuthCallback;
