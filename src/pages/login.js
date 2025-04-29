import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { ethers } from 'ethers';
import { useMutation, gql } from '@apollo/client';
import GoogleIcon from '@mui/icons-material/Google';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const GET_NONCE = gql`
  mutation GetNonce($walletAddress: String!) {
    getNonce(walletAddress: $walletAddress)
  }
`;

const VERIFY_SIGNATURE = gql`
  mutation VerifySignature($walletAddress: String!, $signature: String!) {
    verifySignature(walletAddress: $walletAddress, signature: $signature) {
      token
      user {
        id
        walletAddress
        name
        email
        role
      }
    }
  }
`;

const Login = () => {
  const router = useRouter();
  const { error: routeError } = router.query;
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(!!routeError);

  const [getNonce] = useMutation(GET_NONCE);
  const [verifySignature] = useMutation(VERIFY_SIGNATURE);

  const handleWalletLogin = async () => {
    if (!window.ethereum) {
      setError('请安装 MetaMask 或其他兼容的钱包以继续');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 请求用户连接钱包
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();

      // 获取服务器提供的 nonce
      const { data: nonceData } = await getNonce({ variables: { walletAddress } });
      const nonce = nonceData.getNonce;

      // 请求用户签名
      const signature = await signer.signMessage(nonce);

      // 验证签名
      const { data } = await verifySignature({
        variables: { walletAddress, signature }
      });

      // 保存令牌并更新认证状态
      const { token } = data.verifySignature;
      localStorage.setItem('token', token);
      login(token);

      // 重定向到个人资料页面
      router.push('/profile');
    } catch (err) {
      console.error('登录错误:', err);
      setError(err.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `https://www.web3hire.xyz/api/auth/${provider}`;
  };

  const getErrorMessage = () => {
    if (routeError === 'auth_failed') return '认证失败，请重试';
    if (routeError === 'no_token') return '未收到认证令牌，请重试';
    return error;
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            登录 Web3Hire
          </Typography>

          {getErrorMessage() && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {getErrorMessage()}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleWalletLogin}
            disabled={loading}
            sx={{ 
              py: 1.5, 
              mb: 2,
              background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #5254cc 0%, #7a4fd8 100%)',
              }
            }}
          >
            {loading ? '连接中...' : '使用钱包登录'}
          </Button>

          <Divider sx={{ width: '100%', my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              或使用社交媒体账号
            </Typography>
          </Divider>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={() => handleSocialLogin('google')}
                sx={{ py: 1 }}
              >
                Google
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TwitterIcon />}
                onClick={() => handleSocialLogin('twitter')}
                sx={{ py: 1 }}
              >
                Twitter
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                onClick={() => handleSocialLogin('facebook')}
                sx={{ py: 1 }}
              >
                Facebook
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LinkedInIcon />}
                onClick={() => handleSocialLogin('linkedin')}
                sx={{ py: 1 }}
              >
                LinkedIn
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
            <Typography variant="body2">
              还没有账号？{' '}
              <Link href="/register" passHref>
                <Typography component="a" variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                  注册
                </Typography>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={getErrorMessage()}
      />
    </Container>
  );
};

export default Login;
