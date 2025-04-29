import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useLocale } from '../contexts/LocaleContext';
import { useWeb3 } from '../contexts/Web3Context';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { locale, locales, changeLocale } = useLocale();
  const { account, connectWallet, disconnectWallet } = useWeb3();
  const [translations, setTranslations] = useState({});
  const router = useRouter();

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const commonTranslations = await import(`../../public/locales/${locale}/common.json`);
        setTranslations(commonTranslations.default || {});
      } catch (error) {
        console.error('Failed to load translations:', error);
        // 设置默认空对象，避免未定义错误
        setTranslations({
          app: { name: 'Web3Hire' },
          nav: {
            home: 'Home',
            jobs: 'Jobs',
            tasks: 'Bounties',
            post: 'Post',
            post_job: 'Post a Job',
            post_task: 'Post a Bounty',
            switch_language: locale === 'en' ? '中文' : 'English'
          }
        });
      }
    };

    loadTranslations();
  }, [locale]);

  // Shortened wallet address for display
  const shortenAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  // Switch language
  const handleLanguageSwitch = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    changeLocale(newLocale);
  };

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        boxShadow="sm"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <NextLink href="/" passHref legacyBehavior>
            <Text
              as="a"
              textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
              fontFamily={'heading'}
              color={useColorModeValue('brand.500', 'white')}
              fontWeight="bold"
              fontSize="xl"
            >
              {translations?.app?.name || 'Web3Hire'}
            </Text>
          </NextLink>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav translations={translations} />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          <Button
            as={'a'}
            fontSize={'sm'}
            fontWeight={400}
            variant={'link'}
            onClick={handleLanguageSwitch}
            cursor="pointer"
          >
            {translations?.nav?.switch_language || (locale === 'en' ? '中文' : 'English')}
          </Button>

          {account ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Flex align="center">
                  <Avatar
                    size={'sm'}
                    src={`https://avatars.dicebear.com/api/identicon/${account}.svg`}
                    mr={2}
                  />
                  <Text display={{ base: 'none', md: 'block' }}>
                    {shortenAddress(account)}
                  </Text>
                </Flex>
              </MenuButton>
              <MenuList>
                <NextLink href="/profile" passHref legacyBehavior>
                  <MenuItem as="a">{translations?.nav?.profile || 'Profile'}</MenuItem>
                </NextLink>
                <MenuItem onClick={disconnectWallet}>
                  {translations?.nav?.sign_out || 'Sign Out'}
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'brand.500'}
              onClick={connectWallet}
              _hover={{
                bg: 'brand.600',
              }}
            >
              {translations?.nav?.sign_in || 'Sign In'}
            </Button>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav translations={translations} />
      </Collapse>
    </Box>
  );
};

const DesktopNav = ({ translations = {} }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('brand.500', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Box>
                {navItem.href ? (
                  <NextLink href={navItem.href} passHref legacyBehavior>
                    <Link
                      p={2}
                      href={navItem.href ?? '#'}
                      fontSize={'sm'}
                      fontWeight={500}
                      color={linkColor}
                      _hover={{
                        textDecoration: 'none',
                        color: linkHoverColor,
                      }}
                    >
                      {(translations.nav && translations.nav[navItem.translationKey]) || navItem.label}
                    </Link>
                  </NextLink>
                ) : (
                  <Link
                    p={2}
                    href={'#'}
                    fontSize={'sm'}
                    fontWeight={500}
                    color={linkColor}
                    _hover={{
                      textDecoration: 'none',
                      color: linkHoverColor,
                    }}
                  >
                    {(translations.nav && translations.nav[navItem.translationKey]) || navItem.label}
                  </Link>
                )}
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav 
                      key={child.label} 
                      {...child} 
                      translations={translations}
                    />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel, translationKey, translations }) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <Link
        role={'group'}
        display={'block'}
        p={2}
        rounded={'md'}
        _hover={{ bg: useColorModeValue('brand.50', 'gray.900') }}
      >
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'brand.500' }}
              fontWeight={500}
            >
              {translations?.nav?.[translationKey] || label}
            </Text>
            <Text fontSize={'sm'}>{subLabel}</Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
            justify={'flex-end'}
            align={'center'}
            flex={1}
          >
            <Icon color={'brand.500'} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </Link>
    </NextLink>
  );
};

const MobileNav = ({ translations = {} }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem 
          key={navItem.label} 
          {...navItem} 
          translations={translations}
        />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, translationKey, translations = {} }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      {/* 使用Box替代Flex as={Link}，避免嵌套链接 */}
      {href ? (
        <NextLink href={href} passHref legacyBehavior>
          <Link>
            <Flex
              py={2}
              justify={'space-between'}
              align={'center'}
              _hover={{
                textDecoration: 'none',
              }}
            >
              <Text
                fontWeight={600}
                color={useColorModeValue('gray.600', 'gray.200')}
              >
                {(translations.nav && translations.nav[translationKey]) || label}
              </Text>
              {children && (
                <Icon
                  as={ChevronDownIcon}
                  transition={'all .25s ease-in-out'}
                  transform={isOpen ? 'rotate(180deg)' : ''}
                  w={6}
                  h={6}
                />
              )}
            </Flex>
          </Link>
        </NextLink>
      ) : (
        <Flex
          py={2}
          justify={'space-between'}
          align={'center'}
          _hover={{
            textDecoration: 'none',
          }}
        >
          <Text
            fontWeight={600}
            color={useColorModeValue('gray.600', 'gray.200')}
          >
            {(translations.nav && translations.nav[translationKey]) || label}
          </Text>
          {children && (
            <Icon
              as={ChevronDownIcon}
              transition={'all .25s ease-in-out'}
              transform={isOpen ? 'rotate(180deg)' : ''}
              w={6}
              h={6}
            />
          )}
        </Flex>
      )}

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <NextLink key={child.label} href={child.href} passHref legacyBehavior>
                <Link py={2}>
                  {(translations.nav && translations.nav[child.translationKey]) || child.label}
                </Link>
              </NextLink>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Home',
    translationKey: 'home',
    href: '/',
  },
  {
    label: 'Jobs',
    translationKey: 'jobs',
    href: '/jobs',
  },
  {
    label: 'Bounties',
    translationKey: 'tasks',
    href: '/tasks',
  },
  {
    label: 'Post',
    translationKey: 'post',
    children: [
      {
        label: 'Post a Job',
        translationKey: 'post_job',
        href: '/jobs/post',
      },
      {
        label: 'Post a Bounty',
        translationKey: 'post_task',
        href: '/tasks/post',
      },
    ],
  },
];

export default Navbar;
