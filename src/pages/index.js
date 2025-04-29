import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Flex,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useLocale } from '../contexts/LocaleContext';
import { useWeb3 } from '../contexts/Web3Context';
import JobCard from '../components/JobCard';
import TaskCard from '../components/TaskCard';
import { gql, useQuery } from '@apollo/client';

// GraphQL query to get featured jobs
const GET_FEATURED_JOBS = gql`
  query GetFeaturedJobs($limit: Int!) {
    jobs(limit: $limit, featured: true) {
      id
      title
      company {
        name
        logo
      }
      location
      salary
      skills
      remote
      createdAt
    }
  }
`;

// GraphQL query to get recent tasks/bounties
const GET_RECENT_TASKS = gql`
  query GetRecentTasks($limit: Int!) {
    tasks(limit: $limit, orderBy: "createdAt", orderDirection: "desc") {
      id
      title
      employer {
        name
        profileImage
      }
      reward
      rewardToken
      deadline
      status
      createdAt
    }
  }
`;

export default function Home() {
  const router = useRouter();
  const { locale } = useLocale();
  const { account, bountyContract } = useWeb3();
  const [translations, setTranslations] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState(null);

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
  
  // Fetch featured jobs from API
  const { loading: jobsLoading, error: jobsError, data: jobsData } = useQuery(GET_FEATURED_JOBS, {
    variables: { limit: 3 },
    onCompleted: (data) => {
      if (data?.jobs) {
        setFeaturedJobs(data.jobs);
      }
    }
  });
  
  // Fetch recent tasks from blockchain
  useEffect(() => {
    const fetchRecentTasks = async () => {
      if (!bountyContract) return;
      
      try {
        setIsLoadingTasks(true);
        setTasksError(null);
        
        // Get total bounty count
        const count = await bountyContract.getBountyCount();
        const totalCount = count.toNumber();
        
        // Get the most recent 3 bounties (or fewer if there aren't 3)
        const limit = Math.min(3, totalCount);
        const tasks = [];
        
        for (let i = totalCount; i > totalCount - limit && i > 0; i--) {
          try {
            const bountyData = await bountyContract.getBounty(i);
            
            if (bountyData.exists) {
              // Format the data to match our TaskCard component expectations
              const task = {
                id: bountyData.id.toString(),
                title: bountyData.title,
                company: 'Company', // This would ideally come from a separate call or mapping
                reward: bountyData.reward.toNumber(),
                rewardToken: bountyData.rewardToken,
                deadline: new Date(bountyData.deadline.toNumber() * 1000).toISOString(),
                status: ['Open', 'InProgress', 'Completed', 'Cancelled'][bountyData.status],
                logo: `https://avatars.dicebear.com/api/identicon/${bountyData.employer}.svg`
              };
              
              tasks.push(task);
            }
          } catch (error) {
            console.error(`Error fetching bounty ${i}:`, error);
          }
        }
        
        setRecentTasks(tasks);
      } catch (error) {
        console.error('Error fetching recent tasks:', error);
        setTasksError(error);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    
    fetchRecentTasks();
  }, [bountyContract]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg={useColorModeValue('brand.50', 'gray.900')}
        pt={{ base: 20, md: 28 }}
        pb={{ base: 20, md: 28 }}
      >
        <Container maxW={'4xl'}>
          <Stack
            as={Box}
            textAlign={'center'}
            spacing={{ base: 8, md: 14 }}
          >
            <Heading
              fontWeight={700}
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
              lineHeight={'110%'}
              color={useColorModeValue('brand.600', 'brand.400')}
            >
              {translations?.home?.hero_title || 'Find Your Next Web3 Opportunity'}
            </Heading>
            <Text color={'gray.500'} fontSize={{ base: 'lg', md: 'xl' }}>
              {translations?.home?.hero_subtitle || 'Connect with top Web3 companies and projects'}
            </Text>

            <Box>
              <form onSubmit={handleSearch}>
                <InputGroup size="lg" maxW={'600px'} mx={'auto'}>
                  <Input
                    pr="4.5rem"
                    placeholder={translations?.home?.search_placeholder || 'Search for jobs, skills, or companies'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={useColorModeValue('white', 'gray.800')}
                    boxShadow="md"
                    _focus={{
                      boxShadow: 'outline',
                    }}
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleSearch}>
                      <SearchIcon />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </form>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Featured Jobs Section */}
      <Box py={12}>
        <Container maxW={'6xl'}>
          <Flex justify="space-between" align="center" mb={8}>
            <Heading as="h2" size="lg">
              {translations?.home?.featured_jobs || 'Featured Jobs'}
            </Heading>
            <NextLink href="/jobs" passHref legacyBehavior>
              <Button as="a" colorScheme="brand" variant="outline">
                {translations?.home?.view_all_jobs || 'View All Jobs'}
              </Button>
            </NextLink>
          </Flex>

          {jobsLoading ? (
            <Flex justify="center" align="center" w="100%" py={10}>
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : jobsError ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {locale === 'zh' ? '加载职位时出错' : 'Error loading jobs'}
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
              {featuredJobs.length > 0 ? (
                featuredJobs.map((job) => (
                  <JobCard 
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    company={job.company?.name || 'Company'}
                    location={job.location || 'Remote'}
                    salary={job.salary || 'Competitive'}
                    skills={job.skills || []}
                    logo={job.company?.logo || `https://avatars.dicebear.com/api/identicon/${job.company?.name || 'company'}.svg`}
                    locale={locale}
                    translations={translations}
                  />
                ))
              ) : (
                // Fallback to mock data if no jobs are available
                <>
                  <JobCard 
                    title="Senior Solidity Developer"
                    company="DeFi Protocol"
                    location="Remote"
                    salary="$120k - $150k"
                    skills={['Solidity', 'Ethereum', 'DeFi']}
                    logo="https://avatars.dicebear.com/api/identicon/defiprotocol.svg"
                    locale={locale}
                    translations={translations}
                  />
                  <JobCard 
                    title="Blockchain Frontend Developer"
                    company="NFT Marketplace"
                    location="San Francisco, CA"
                    salary="$100k - $130k"
                    skills={['React', 'Web3.js', 'NFTs']}
                    logo="https://avatars.dicebear.com/api/identicon/nftmarketplace.svg"
                    locale={locale}
                    translations={translations}
                  />
                  <JobCard 
                    title="Smart Contract Auditor"
                    company="Security DAO"
                    location="Remote"
                    salary="$130k - $160k"
                    skills={['Solidity', 'Security', 'Auditing']}
                    logo="https://avatars.dicebear.com/api/identicon/securitydao.svg"
                    locale={locale}
                    translations={translations}
                  />
                </>
              )}
            </SimpleGrid>
          )}
        </Container>
      </Box>

      {/* Recent Bounties Section */}
      <Box py={12} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW={'6xl'}>
          <Flex justify="space-between" align="center" mb={8}>
            <Heading as="h2" size="lg">
              {translations?.home?.recent_tasks || 'Recent Bounties'}
            </Heading>
            <NextLink href="/tasks" passHref legacyBehavior>
              <Button as="a" colorScheme="brand" variant="outline">
                {translations?.home?.view_all_tasks || 'View All Bounties'}
              </Button>
            </NextLink>
          </Flex>

          {isLoadingTasks ? (
            <Flex justify="center" align="center" w="100%" py={10}>
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : tasksError ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {locale === 'zh' ? '加载任务时出错' : 'Error loading tasks'}
            </Alert>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <TaskCard 
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    company={task.company}
                    reward={task.reward}
                    rewardToken={task.rewardToken}
                    deadline={task.deadline}
                    logo={task.logo}
                    locale={locale}
                    translations={translations}
                  />
                ))
              ) : (
                // Fallback to mock data if no tasks are available
                <>
                  <TaskCard 
                    title="Create a DApp Landing Page"
                    company="Web3 Startup"
                    reward={2000}
                    rewardToken="USDT"
                    deadline="2023-06-30"
                    logo="https://avatars.dicebear.com/api/identicon/web3startup.svg"
                    locale={locale}
                    translations={translations}
                  />
                  <TaskCard 
                    title="Develop NFT Minting Function"
                    company="Art Collective"
                    reward={1500}
                    rewardToken="ETH"
                    deadline="2023-07-15"
                    logo="https://avatars.dicebear.com/api/identicon/artcollective.svg"
                    locale={locale}
                    translations={translations}
                  />
                  <TaskCard 
                    title="Smart Contract Testing"
                    company="DeFi Protocol"
                    reward={3000}
                    rewardToken="USDT"
                    deadline="2023-07-05"
                    logo="https://avatars.dicebear.com/api/identicon/defiprotocol.svg"
                    locale={locale}
                    translations={translations}
                  />
                </>
              )}
            </SimpleGrid>
          )}
        </Container>
      </Box>

      {/* For Employers & Candidates Section */}
      <Box py={12}>
        <Container maxW={'6xl'}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
            <Box
              p={8}
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="lg"
              boxShadow="md"
              textAlign="center"
            >
              <Heading as="h3" size="lg" mb={4}>
                {translations?.home?.for_employers || 'For Employers'}
              </Heading>
              <Text mb={6}>
                {translations?.home?.employer_desc || 'Find the best Web3 talent for your project'}
              </Text>
              <NextLink href="/jobs/post" passHref legacyBehavior>
                <Button as="a" colorScheme="brand" size="lg">
                  {translations?.nav?.post_job || 'Post a Job'}
                </Button>
              </NextLink>
            </Box>

            <Box
              p={8}
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="lg"
              boxShadow="md"
              textAlign="center"
            >
              <Heading as="h3" size="lg" mb={4}>
                {translations?.home?.for_candidates || 'For Candidates'}
              </Heading>
              <Text mb={6}>
                {translations?.home?.candidate_desc || 'Discover opportunities in the Web3 space'}
              </Text>
              <NextLink href="/profile" passHref legacyBehavior>
                <Button as="a" colorScheme="secondary" size="lg">
                  {translations?.profile?.upload_resume || 'Upload Resume'}
                </Button>
              </NextLink>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
}
