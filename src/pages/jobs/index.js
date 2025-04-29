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
  Checkbox,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useLocale } from '../../contexts/LocaleContext';
import JobCard from '../../components/JobCard';
import { gql, useQuery } from '@apollo/client';

// GraphQL query for jobs
const GET_JOBS = gql`
  query GetJobs($status: String) {
    jobs(status: $status) {
      id
      title
      description
      skillsRequired
      salary
      remote
      location
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

const JobsPage = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const [translations, setTranslations] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRemote, setFilterRemote] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  
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

  // Fetch jobs data
  const { loading, error, data } = useQuery(GET_JOBS, {
    variables: { status: 'Open' },
  });

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL with search query
    router.push({
      pathname: '/jobs',
      query: { q: searchQuery },
    }, undefined, { shallow: true });
  };

  // Filter and sort jobs
  const filterAndSortJobs = () => {
    if (!data?.jobs) return [];
    
    let filteredJobs = [...data.jobs];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.skillsRequired.some(skill => skill.toLowerCase().includes(query)) ||
        job.employer.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply remote filter
    if (filterRemote) {
      filteredJobs = filteredJobs.filter(job => job.remote);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        return filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return filteredJobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'salary-high':
        return filteredJobs.sort((a, b) => {
          // Extract numeric values from salary strings (assuming format like "$100k-$150k")
          const aMatch = a.salary.match(/(\d+)k-(\d+)k/);
          const bMatch = b.salary.match(/(\d+)k-(\d+)k/);
          if (aMatch && bMatch) {
            return parseInt(bMatch[2]) - parseInt(aMatch[2]);
          }
          return 0;
        });
      case 'salary-low':
        return filteredJobs.sort((a, b) => {
          const aMatch = a.salary.match(/(\d+)k-(\d+)k/);
          const bMatch = b.salary.match(/(\d+)k-(\d+)k/);
          if (aMatch && bMatch) {
            return parseInt(aMatch[1]) - parseInt(bMatch[1]);
          }
          return 0;
        });
      default:
        return filteredJobs;
    }
  };

  // For demo purposes, use mock data if no data from API
  const mockJobs = [
    {
      id: '1',
      title: 'Senior Solidity Developer',
      company: 'DeFi Protocol',
      location: 'Remote',
      salary: '$120k - $150k',
      skills: ['Solidity', 'Ethereum', 'DeFi'],
      logo: 'https://avatars.dicebear.com/api/identicon/defiprotocol.svg',
      remote: true,
      createdAt: '2023-04-15T00:00:00Z',
    },
    {
      id: '2',
      title: 'Blockchain Frontend Engineer',
      company: 'NFT Marketplace',
      location: 'San Francisco, CA',
      salary: '$100k - $130k',
      skills: ['React', 'Web3.js', 'TypeScript'],
      logo: 'https://avatars.dicebear.com/api/identicon/nftmarket.svg',
      remote: false,
      createdAt: '2023-04-10T00:00:00Z',
    },
    {
      id: '3',
      title: 'Smart Contract Auditor',
      company: 'Security DAO',
      location: 'Remote',
      salary: '$130k - $160k',
      skills: ['Solidity', 'Security', 'Auditing'],
      logo: 'https://avatars.dicebear.com/api/identicon/securitydao.svg',
      remote: true,
      createdAt: '2023-04-05T00:00:00Z',
    },
    {
      id: '4',
      title: 'Blockchain Protocol Engineer',
      company: 'Layer 2 Solution',
      location: 'Berlin, Germany',
      salary: '$140k - $180k',
      skills: ['Rust', 'Consensus Algorithms', 'Cryptography'],
      logo: 'https://avatars.dicebear.com/api/identicon/layer2.svg',
      remote: false,
      createdAt: '2023-04-01T00:00:00Z',
    },
    {
      id: '5',
      title: 'Web3 Product Manager',
      company: 'Crypto Exchange',
      location: 'Singapore',
      salary: '$110k - $140k',
      skills: ['Product Management', 'Crypto', 'Agile'],
      logo: 'https://avatars.dicebear.com/api/identicon/cryptoexchange.svg',
      remote: true,
      createdAt: '2023-03-25T00:00:00Z',
    },
    {
      id: '6',
      title: 'Blockchain Research Scientist',
      company: 'Research Foundation',
      location: 'Remote',
      salary: '$120k - $160k',
      skills: ['Research', 'Cryptography', 'Academic Writing'],
      logo: 'https://avatars.dicebear.com/api/identicon/research.svg',
      remote: true,
      createdAt: '2023-03-20T00:00:00Z',
    },
  ];

  // Use mock data for demo or API data when available
  const jobs = data?.jobs ? filterAndSortJobs() : mockJobs;

  return (
    <Box py={8}>
      <Container maxW={'6xl'}>
        <Heading as="h1" mb={8}>
          {translations?.jobs?.title || 'Jobs'}
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
                  placeholder={translations?.jobs?.search || 'Search Jobs'}
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
            <Checkbox 
              isChecked={filterRemote} 
              onChange={(e) => setFilterRemote(e.target.checked)}
              colorScheme="brand"
            >
              {translations?.jobs?.remote || 'Remote'}
            </Checkbox>

            <Select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              w={{ base: 'full', md: '200px' }}
            >
              <option value="newest">{locale === 'zh' ? '最新发布' : 'Newest'}</option>
              <option value="oldest">{locale === 'zh' ? '最早发布' : 'Oldest'}</option>
              <option value="salary-high">{locale === 'zh' ? '薪资从高到低' : 'Salary (High to Low)'}</option>
              <option value="salary-low">{locale === 'zh' ? '薪资从低到高' : 'Salary (Low to High)'}</option>
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
              {locale === 'zh' ? '加载职位时出错' : 'Error loading jobs'}: {error.message}
            </Text>
          </Box>
        )}

        {/* No Results */}
        {!loading && !error && jobs.length === 0 && (
          <Box textAlign="center" my={10} p={5} bg="gray.50" borderRadius="md">
            <Text fontSize="lg">
              {translations?.jobs?.no_jobs || 'No jobs found'}
            </Text>
          </Box>
        )}

        {/* Jobs List */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              company={job.company || job.employer?.name || 'Company'}
              location={job.location}
              salary={job.salary}
              skills={job.skills || job.skillsRequired || []}
              logo={job.logo || job.employer?.profileImage || `https://avatars.dicebear.com/api/identicon/${job.id}.svg`}
              remote={job.remote}
              createdAt={job.createdAt}
              locale={locale}
              translations={translations}
            />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default JobsPage;
