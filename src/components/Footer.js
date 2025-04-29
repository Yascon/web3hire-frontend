import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VisuallyHidden,
  chakra,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTwitter, FaGithub, FaDiscord } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useLocale } from '../contexts/LocaleContext';

const SocialButton = ({ children, label, href }) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      target="_blank"
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

const Footer = () => {
  const { locale } = useLocale();
  const [translations, setTranslations] = useState({});

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const commonTranslations = await import(`../../public/locales/${locale}/common.json`);
        setTranslations(commonTranslations.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
  }, [locale]);

  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      borderTop={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid
          templateColumns={{ sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr 1fr' }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Box>
              <Text 
                fontSize={'lg'} 
                fontWeight="bold" 
                color={useColorModeValue('brand.500', 'white')}
              >
                {translations?.app?.name || 'Web3Hire'}
              </Text>
            </Box>
            <Text fontSize={'sm'}>
              {translations?.app?.tagline || 'Connecting Web3 Talent with Opportunities'}
            </Text>
            <Stack direction={'row'} spacing={6}>
              <SocialButton label={'Twitter'} href={'#'}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={'GitHub'} href={'#'}>
                <FaGithub />
              </SocialButton>
              <SocialButton label={'Discord'} href={'#'}>
                <FaDiscord />
              </SocialButton>
            </Stack>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>{locale === 'zh' ? '平台' : 'Platform'}</ListHeader>
            <Link href={'#'}>{locale === 'zh' ? '关于我们' : 'About Us'}</Link>
            <Link href={'#'}>{locale === 'zh' ? '联系我们' : 'Contact Us'}</Link>
            <Link href={'#'}>{locale === 'zh' ? '博客' : 'Blog'}</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>{locale === 'zh' ? '支持' : 'Support'}</ListHeader>
            <Link href={'#'}>{locale === 'zh' ? '帮助中心' : 'Help Center'}</Link>
            <Link href={'#'}>{locale === 'zh' ? '安全' : 'Safety'}</Link>
            <Link href={'#'}>{locale === 'zh' ? '社区指南' : 'Community Guidelines'}</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>{locale === 'zh' ? '法律' : 'Legal'}</ListHeader>
            <Link href={'#'}>{locale === 'zh' ? '隐私政策' : 'Privacy Policy'}</Link>
            <Link href={'#'}>{locale === 'zh' ? '服务条款' : 'Terms of Service'}</Link>
            <Link href={'#'}>{locale === 'zh' ? 'Cookie 政策' : 'Cookie Policy'}</Link>
          </Stack>
          <Stack align={'flex-start'}>
            <ListHeader>{locale === 'zh' ? '资源' : 'Resources'}</ListHeader>
            <Link href={'#'}>{locale === 'zh' ? 'Web3 教程' : 'Web3 Tutorials'}</Link>
            <Link href={'#'}>{locale === 'zh' ? '开发者资源' : 'Developer Resources'}</Link>
            <Link href={'#'}>{locale === 'zh' ? '合作伙伴' : 'Partners'}</Link>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Text>
            © {new Date().getFullYear()} Web3Hire. {locale === 'zh' ? '保留所有权利' : 'All rights reserved'}
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
