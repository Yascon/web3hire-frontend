import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Flex,
  Button,
  Badge,
  Divider,
  Avatar,
  SimpleGrid,
  Icon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, InfoIcon } from '@chakra-ui/icons';
import { FaMapMarkerAlt, FaDollarSign, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import { useLocale } from '../../contexts/LocaleContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { gql, useQuery } from '@apollo/client';

// GraphQL query for job details
const GET_JOB = gql`
  query GetJob($id: ID!) {
    job(id: $id) {
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

const JobDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { locale } = useLocale();
  const { account } = useWeb3();
  const [translations, setTranslations] = useState({});

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

  // Fetch job data from GraphQL API
  const { loading: queryLoading, error: queryError, data } = useQuery(GET_JOB, {
    variables: { id },
    skip: !id, // Skip query if id is not available yet
  });
  
  // States for loading and error
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  // Effect to handle loading and error states
  useEffect(() => {
    if (queryLoading !== undefined) {
      setIsLoading(queryLoading);
    }
    
    if (queryError) {
      setLoadError(queryError);
    }
  }, [queryLoading, queryError]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle apply
  const handleApply = async () => {
    if (!account) {
      // Prompt user to connect wallet
      toast({
        title: translations?.jobs?.connect_wallet_required || 'Wallet Connection Required',
        description: translations?.jobs?.connect_to_apply || 'You need to connect your wallet to apply for this job',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Check if user has a resume
    if (resumeContract) {
      try {
        const hasResume = await resumeContract.hasResume(account);
        
        if (!hasResume) {
          toast({
            title: translations?.jobs?.resume_required || 'Resume Required',
            description: translations?.jobs?.upload_resume_first || 'You need to upload your resume before applying for jobs',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          
          // Redirect to resume upload page
          router.push('/profile/resume');
          return;
        }
      } catch (error) {
        console.error('Error checking resume:', error);
      }
    }
    
    // For now, we'll just show a success message
    // In a real implementation, you would call a GraphQL mutation or smart contract method
    toast({
      title: translations?.jobs?.application_submitted || 'Application Submitted',
      description: translations?.jobs?.application_submitted_desc || 'Your application has been submitted successfully',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  // Fallback data if no job is found
  const fallbackJob = {
    id: id || '1',
    title: 'Job Not Found',
    company: 'Unknown',
    description: 'This job does not exist or has been removed.',
    location: 'N/A',
    salary: 'N/A',
    skills: [],
    logo: 'https://avatars.dicebear.com/api/identicon/unknown.svg',
    remote: false,
    createdAt: new Date().toISOString(),
    employer: {
      id: '0',
      name: 'Unknown',
      walletAddress: '0x0000000000000000000000000000000000000000',
      profileImage: 'https://avatars.dicebear.com/api/identicon/unknown.svg',
    }
  };

  // Use API data or fallback
  const job = data?.job || fallbackJob;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (loadError) {
    return (
      <Box textAlign="center" my={10} p={5} bg="red.50" borderRadius="md">
        <Text color="red.500">
          {locale === 'zh' ? '\u52a0\u8f7d\u804c\u4f4d\u65f6\u51fa\u9519' : 'Error loading job'}: {loadError.message}
        </Text>
      </Box>
    );
  }

  return (
    <Box py={10}>
      <Container maxW={'6xl'}>
        {/* Job Header */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          align={{ base: 'start', md: 'center' }} 
          justify="space-between"
          mb={8}
          gap={4}
        >
          <Flex align="center">
            <Avatar 
              src={job.logo || job.employer?.profileImage} 
              size="xl" 
              mr={4} 
              bg="brand.50"
              border="2px solid"
              borderColor="brand.500"
            />
            <Box>
              <Heading as="h1" size="xl" mb={2}>
                {job.title}
              </Heading>
              <Text fontSize="lg" color="gray.600" mb={2}>
                {job.company || job.employer?.name}
              </Text>
              <Flex wrap="wrap" gap={2}>
                <Flex align="center">
                  <Icon as={FaMapMarkerAlt} color="gray.500" mr={1} />
                  <Text color="gray.500">
                    {job.remote 
                      ? translations?.jobs?.remote || 'Remote' 
                      : job.location}
                  </Text>
                </Flex>
                <Flex align="center" ml={4}>
                  <Icon as={FaDollarSign} color="gray.500" mr={1} />
                  <Text color="gray.500">{job.salary}</Text>
                </Flex>
                <Flex align="center" ml={4}>
                  <Icon as={FaCalendarAlt} color="gray.500" mr={1} />
                  <Text color="gray.500">
                    {translations?.jobs?.posted_on || 'Posted'}: {formatDate(job.createdAt)}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </Flex>
          <Button 
            colorScheme="brand" 
            size="lg"
            onClick={handleApply}
            minW="150px"
          >
            {translations?.jobs?.apply_now || 'Apply Now'}
          </Button>
        </Flex>

        <Divider mb={8} />

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Main Content */}
          <Box gridColumn="span 2">
            <Box mb={8}>
              <Heading as="h2" size="md" mb={4}>
                {translations?.jobs?.description || 'Job Description'}
              </Heading>
              <Text whiteSpace="pre-line">{job.description}</Text>
            </Box>

            <Box mb={8}>
              <Heading as="h2" size="md" mb={4}>
                {translations?.jobs?.required_skills || 'Required Skills'}
              </Heading>
              <Flex wrap="wrap" gap={2}>
                {(job.skills || job.skillsRequired || []).map((skill) => (
                  <Badge
                    key={skill}
                    px={3}
                    py={1}
                    bg={useColorModeValue('brand.50', 'brand.900')}
                    color={useColorModeValue('brand.600', 'brand.200')}
                    fontWeight={'500'}
                    rounded="full"
                    fontSize="md"
                  >
                    {skill}
                  </Badge>
                ))}
              </Flex>
            </Box>

            <Box mb={8}>
              <Heading as="h2" size="md" mb={4}>
                {translations?.jobs?.how_to_apply || 'How to Apply'}
              </Heading>
              <List spacing={3}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  {translations?.jobs?.connect_wallet || 'Connect your wallet to verify your identity'}
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  {translations?.jobs?.upload_resume || 'Make sure your resume is uploaded to your profile'}
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  {translations?.jobs?.click_apply || 'Click the Apply button and confirm the transaction'}
                </ListItem>
              </List>
            </Box>
          </Box>

          {/* Sidebar */}
          <Box>
            <Box 
              p={6} 
              bg={useColorModeValue('white', 'gray.700')} 
              borderRadius="md"
              boxShadow="md"
              mb={6}
            >
              <Heading as="h3" size="md" mb={4}>
                {translations?.jobs?.company_info || 'Company Information'}
              </Heading>
              <Flex align="center" mb={4}>
                <Icon as={FaBuilding} color="gray.500" mr={2} />
                <Text>{job.company || job.employer?.name}</Text>
              </Flex>
              {job.employer?.walletAddress && (
                <Flex align="center" mb={4}>
                  <InfoIcon color="gray.500" mr={2} />
                  <Text fontSize="sm" isTruncated>
                    {job.employer.walletAddress.substring(0, 6)}...{job.employer.walletAddress.substring(38)}
                  </Text>
                </Flex>
              )}
              <Button 
                colorScheme="gray" 
                variant="outline" 
                size="sm" 
                width="full"
                onClick={() => router.push(`/companies/${job.employer?.id || '1'}`)}
              >
                {translations?.jobs?.view_company || 'View Company Profile'}
              </Button>
            </Box>

            <Box 
              p={6} 
              bg={useColorModeValue('white', 'gray.700')} 
              borderRadius="md"
              boxShadow="md"
            >
              <Heading as="h3" size="md" mb={4}>
                {translations?.jobs?.job_details || 'Job Details'}
              </Heading>
              <Stack spacing={3}>
                <Flex align="center">
                  <Icon as={FaMapMarkerAlt} color="gray.500" mr={2} />
                  <Text fontWeight="bold" mr={1}>
                    {translations?.jobs?.location || 'Location'}:
                  </Text>
                  <Text>
                    {job.remote 
                      ? translations?.jobs?.remote || 'Remote' 
                      : job.location}
                  </Text>
                </Flex>
                <Flex align="center">
                  <Icon as={FaDollarSign} color="gray.500" mr={2} />
                  <Text fontWeight="bold" mr={1}>
                    {translations?.jobs?.salary || 'Salary'}:
                  </Text>
                  <Text>{job.salary}</Text>
                </Flex>
                <Flex align="center">
                  <TimeIcon color="gray.500" mr={2} />
                  <Text fontWeight="bold" mr={1}>
                    {translations?.jobs?.posted_on || 'Posted'}:
                  </Text>
                  <Text>{formatDate(job.createdAt)}</Text>
                </Flex>
              </Stack>
            </Box>
          </Box>
        </SimpleGrid>

        <Box mt={10}>
          <Button 
            colorScheme="brand" 
            size="lg"
            onClick={handleApply}
            width={{ base: 'full', md: 'auto' }}
          >
            {translations?.jobs?.apply_now || 'Apply Now'}
          </Button>
          <Button 
            ml={{ base: 0, md: 4 }} 
            mt={{ base: 4, md: 0 }}
            onClick={() => router.push('/jobs')}
            width={{ base: 'full', md: 'auto' }}
          >
            {translations?.jobs?.back_to_jobs || 'Back to Jobs'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default JobDetailPage;
