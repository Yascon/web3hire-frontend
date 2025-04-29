import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Select,
  Stack,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useLocale } from '../../contexts/LocaleContext';
import TaskCard from '../../components/TaskCard';
import { gql, useQuery } from '@apollo/client';

// GraphQL query for tasks
const GET_TASKS = gql`
  query GetTasks($status: String) {
    tasks(status: $status) {
      id
      title
      description
      reward
      rewardToken
      deadline
      status
      createdAt
      employer {
        id
        name
        walletAddress
        profileImage
      }
    }
  }
`;

const TasksPage = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const [translations, setTranslations] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('Open');
  
  // Get query params
  const { q } = router.query;
  
  // Set initial search query from URL
  useEffect(() => {
    if (q) setSearchQuery(q);
  }, [q]);

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const commonTranslations = await import(`../../../public/locales/${locale}/common.json`);
        setTranslations(commonTranslations.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
  }, [locale]);

  // Fetch tasks data
  const { loading, error, data } = useQuery(GET_TASKS, {
    variables: { status: statusFilter === 'All' ? null : statusFilter },
  });

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL with search query
    router.push({
      pathname: '/tasks',
      query: { q: searchQuery },
    }, undefined, { shallow: true });
  };

  // Filter and sort tasks
  const filterAndSortTasks = () => {
    if (!data?.tasks) return [];
    
    let filteredTasks = [...data.tasks];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.employer.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        return filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return filteredTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'deadline':
        return filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      case 'reward-high':
        return filteredTasks.sort((a, b) => b.reward - a.reward);
      case 'reward-low':
        return filteredTasks.sort((a, b) => a.reward - b.reward);
      default:
        return filteredTasks;
    }
  };

  // For demo purposes, use mock data if no data from API
  const mockTasks = [
    {
      id: '1',
      title: 'Create a DApp Landing Page',
      company: 'Web3 Startup',
      reward: 2000,
      rewardToken: 'USDT',
      deadline: '2023-06-30',
      logo: 'https://avatars.dicebear.com/api/identicon/web3startup.svg',
      status: 'Open',
      createdAt: '2023-04-15T00:00:00Z',
    },
    {
      id: '2',
      title: 'Develop NFT Minting Function',
      company: 'Art Collective',
      reward: 1500,
      rewardToken: 'ETH',
      deadline: '2023-07-15',
      logo: 'https://avatars.dicebear.com/api/identicon/artcollective.svg',
      status: 'Open',
      createdAt: '2023-04-10T00:00:00Z',
    },
    {
      id: '3',
      title: 'Smart Contract Testing',
      company: 'DeFi Protocol',
      reward: 3000,
      rewardToken: 'USDT',
      deadline: '2023-07-05',
      logo: 'https://avatars.dicebear.com/api/identicon/defiprotocol.svg',
      status: 'Open',
      createdAt: '2023-04-05T00:00:00Z',
    },
    {
      id: '4',
      title: 'Design Web3 Wallet UI',
      company: 'Crypto Wallet',
      reward: 2500,
      rewardToken: 'USDT',
      deadline: '2023-06-20',
      logo: 'https://avatars.dicebear.com/api/identicon/cryptowallet.svg',
      status: 'InProgress',
      createdAt: '2023-04-01T00:00:00Z',
    },
    {
      id: '5',
      title: 'Write Technical Documentation',
      company: 'Blockchain Protocol',
      reward: 1800,
      rewardToken: 'MATIC',
      deadline: '2023-06-15',
      logo: 'https://avatars.dicebear.com/api/identicon/blockchainprotocol.svg',
      status: 'Open',
      createdAt: '2023-03-25T00:00:00Z',
    },
    {
      id: '6',
      title: 'Develop Token Staking Contract',
      company: 'Yield Farm',
      reward: 4000,
      rewardToken: 'ETH',
      deadline: '2023-07-30',
      logo: 'https://avatars.dicebear.com/api/identicon/yieldfarm.svg',
      status: 'Open',
      createdAt: '2023-03-20T00:00:00Z',
    },
  ];

  // Use mock data for demo or API data when available
  const tasks = data?.tasks ? filterAndSortTasks() : mockTasks;

  return (
    <Box py={8}>
      <Container maxW={'6xl'}>
        <Heading as="h1" mb={8}>
          {translations?.tasks?.title || 'Bounties'}
        </Heading>

        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          mb={8} 
          gap={4}
          align={{ base: 'stretch', md: 'flex-end' }}
        >
          {/* Search Bar */}
          <Box flex={1}>
            <form onSubmit={handleSearch}>
              <InputGroup>
                <Input
                  placeholder={translations?.tasks?.search || 'Search Bounties'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleSearch}>
                    <SearchIcon />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </form>
          </Box>

          {/* Filters */}
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              w={{ base: 'full', md: '150px' }}
            >
              <option value="All">{locale === 'zh' ? 'u6240u6709u72b6u6001' : 'All Status'}</option>
              <option value="Open">{locale === 'zh' ? 'u5f00u653eu4e2d' : 'Open'}</option>
              <option value="InProgress">{locale === 'zh' ? 'u8fdbu884cu4e2d' : 'In Progress'}</option>
              <option value="Completed">{locale === 'zh' ? 'u5df2u5b8cu6210' : 'Completed'}</option>
              <option value="Cancelled">{locale === 'zh' ? 'u5df2u53d6u6d88' : 'Cancelled'}</option>
            </Select>

            <Select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              w={{ base: 'full', md: '200px' }}
            >
              <option value="newest">{locale === 'zh' ? 'u6700u65b0u53d1u5e03' : 'Newest'}</option>
              <option value="oldest">{locale === 'zh' ? 'u6700u65e9u53d1u5e03' : 'Oldest'}</option>
              <option value="deadline">{locale === 'zh' ? 'u622au6b62u65e5u671f' : 'Deadline'}</option>
              <option value="reward-high">{locale === 'zh' ? 'u5956u52b1u4eceu9ad8u5230u4f4e' : 'Reward (High to Low)'}</option>
              <option value="reward-low">{locale === 'zh' ? 'u5956u52b1u4eceu4f4eu5230u9ad8' : 'Reward (Low to High)'}</option>
            </Select>
          </Stack>
        </Flex>

        {/* Loading State */}
        {loading && (
          <Flex justify="center" my={10}>
            <Spinner size="xl" color="brand.500" />
          </Flex>
        )}

        {/* Error State */}
        {error && (
          <Box textAlign="center" my={10} p={5} bg="red.50" borderRadius="md">
            <Text color="red.500">
              {locale === 'zh' ? 'u52a0u8f7du60acu8d4fu4efbu52a1u65f6u51fau9519' : 'Error loading bounties'}: {error.message}
            </Text>
          </Box>
        )}

        {/* No Results */}
        {!loading && !error && tasks.length === 0 && (
          <Box textAlign="center" my={10} p={5} bg="gray.50" borderRadius="md">
            <Text fontSize="lg">
              {translations?.tasks?.no_tasks || 'No bounties found'}
            </Text>
          </Box>
        )}

        {/* Tasks List */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              company={task.company || task.employer?.name || 'Company'}
              reward={task.reward}
              rewardToken={task.rewardToken}
              deadline={task.deadline}
              logo={task.logo || task.employer?.profileImage || `https://avatars.dicebear.com/api/identicon/${task.id}.svg`}
              status={task.status}
              createdAt={task.createdAt}
              locale={locale}
              translations={translations}
            />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default TasksPage;
