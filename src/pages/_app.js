import { ChakraProvider } from '@chakra-ui/react';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocaleProvider } from '../contexts/LocaleContext';
import { Web3Provider } from '../contexts/Web3Context';
import { AuthProvider } from '../contexts/AuthContext';
import { client } from '../utils/apollo';
import Layout from '../components/Layout';
import theme from '../theme';
import muiTheme from '../theme/mui-theme';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <ApolloProvider client={client}>
          <AuthProvider>
            <LocaleProvider>
              <Web3Provider>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </Web3Provider>
            </LocaleProvider>
          </AuthProvider>
        </ApolloProvider>
      </MuiThemeProvider>
    </ChakraProvider>
  );
}

export default MyApp;
