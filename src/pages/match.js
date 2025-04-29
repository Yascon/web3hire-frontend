import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Stack,
  SimpleGrid,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  CheckboxGroup,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  VStack,
  Badge,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { Link } from '@chakra-ui/react';
import { useLocale } from '../contexts/LocaleContext';
import { useWeb3 } from '../contexts/Web3Context';
import JobCard from '../components/JobCard';
import { gql, useMutation } from '@apollo/client';

// GraphQL mutation for AI matching
const AI_MATCH = gql`
  mutation AiMatch($skills: [String!]!, $experience: Int!, $jobType: String!, $remote: Boolean) {
    aiMatch(skills: $skills, experience: $experience, jobType: $jobType, remote: $remote) {
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
      matchScore
      createdAt
    }
  }
`;

const MatchPage = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const { account } = useWeb3();
  const toast = useToast();
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [matchResults, setMatchResults] = useState([]);
  
  // Form state
  const [skill, setSkill] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState(1);
  const [jobType, setJobType] = useState('fulltime');
  const [remote, setRemote] = useState(false);

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

  // Redirect if not connected
  useEffect(() => {
    if (!account) {
      router.push('/');
    }
  }, [account, router]);

  // AI Match mutation
  const [aiMatch, { loading: matchLoading }] = useMutation(AI_MATCH, {
    onCompleted: (data) => {
      if (data?.aiMatch) {
        setMatchResults(data.aiMatch);
        toast({
          title: locale === 'zh' ? '匹配完成' : 'Matching Complete',
          description: locale === 'zh' ? '找到了适合您的职位' : 'We found jobs that match your profile',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('AI Match error:', error);
      toast({
        title: locale === 'zh' ? '匹配失败' : 'Matching Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  });

  // Add skill
  const handleAddSkill = () => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkill('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (skills.length === 0) {
      toast({
        title: locale === 'zh' ? '请添加技能' : 'Please Add Skills',
        description: locale === 'zh' ? '至少添加一项技能以进行匹配' : 'Add at least one skill to match',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    // Call AI Match mutation
    aiMatch({
      variables: {
        skills,
        experience: parseInt(experience),
        jobType,
        remote
      }
    });
  };

  // For development, we'll use mock data if the API call fails
  const mockMatchResults = [
    {
      id: '1',
      title: 'Senior Solidity Developer',
      company: {
        name: 'DeFi Protocol',
        logo: 'https://avatars.dicebear.com/api/identicon/defiprotocol.svg'
      },
      location: 'Remote',
      salary: '$120k - $150k',
      skills: ['Solidity', 'Ethereum', 'DeFi'],
      remote: true,
      matchScore: 95,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Blockchain Frontend Developer',
      company: {
        name: 'NFT Marketplace',
        logo: 'https://avatars.dicebear.com/api/identicon/nftmarketplace.svg'
      },
      location: 'San Francisco, CA',
      salary: '$100k - $130k',
      skills: ['React', 'Web3.js', 'NFTs'],
      remote: false,
      matchScore: 87,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Smart Contract Auditor',
      company: {
        name: 'Security DAO',
        logo: 'https://avatars.dicebear.com/api/identicon/securitydao.svg'
      },
      location: 'Remote',
      salary: '$130k - $160k',
      skills: ['Solidity', 'Security', 'Auditing'],
      remote: true,
      matchScore: 82,
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <Box>
      <Box bg={useColorModeValue('brand.50', 'gray.900')} pt={10} pb={6}>
        <Container maxW={'4xl'}>
          <Heading as="h1" size="xl" mb={4}>
            {translations?.match?.title || 'AI Job Matching'}
          </Heading>
          <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')} mb={6}>
            {translations?.match?.subtitle || 'Find the perfect job match based on your skills and preferences'}
          </Text>
        </Container>
      </Box>

      <Container maxW={'6xl'} py={8}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {/* Matching Form */}
          <Box gridColumn={{ base: 'span 1', md: 'span 1' }}>
            <Box
              p={6}
              bg={useColorModeValue('white', 'gray.800')}
              borderRadius="lg"
              boxShadow="md"
            >
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <Heading as="h3" size="md" mb={2}>
                    {translations?.match?.your_preferences || 'Your Preferences'}
                  </Heading>

                  {/* Skills */}
                  <FormControl>
                    <FormLabel>{translations?.match?.skills || 'Skills'}</FormLabel>
                    <Flex>
                      <Input
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        placeholder={translations?.match?.enter_skill || 'Enter a skill'}
                        mr={2}
                      />
                      <Button onClick={handleAddSkill}>{translations?.match?.add || 'Add'}</Button>
                    </Flex>
                    <HStack mt={2} flexWrap="wrap">
                      {skills.map((s) => (
                        <Tag key={s} size="md" borderRadius="full" variant="solid" colorScheme="brand" m={1}>
                          <TagLabel>{s}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveSkill(s)} />
                        </Tag>
                      ))}
                    </HStack>
                  </FormControl>

                  {/* Experience */}
                  <FormControl>
                    <FormLabel>{translations?.match?.experience || 'Experience (years)'}</FormLabel>
                    <Select value={experience} onChange={(e) => setExperience(e.target.value)}>
                      <option value="0">0-1</option>
                      <option value="1">1-3</option>
                      <option value="3">3-5</option>
                      <option value="5">5-10</option>
                      <option value="10">10+</option>
                    </Select>
                  </FormControl>

                  {/* Job Type */}
                  <FormControl>
                    <FormLabel>{translations?.match?.job_type || 'Job Type'}</FormLabel>
                    <Select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                      <option value="fulltime">{translations?.match?.fulltime || 'Full-time'}</option>
                      <option value="parttime">{translations?.match?.parttime || 'Part-time'}</option>
                      <option value="contract">{translations?.match?.contract || 'Contract'}</option>
                      <option value="freelance">{translations?.match?.freelance || 'Freelance'}</option>
                    </Select>
                  </FormControl>

                  {/* Remote */}
                  <FormControl>
                    <Checkbox isChecked={remote} onChange={(e) => setRemote(e.target.checked)}>
                      {translations?.match?.remote_only || 'Remote Only'}
                    </Checkbox>
                  </FormControl>

                  <Button
                    mt={4}
                    colorScheme="brand"
                    type="submit"
                    isLoading={isLoading}
                    loadingText={translations?.match?.matching || 'Matching...'}
                  >
                    {translations?.match?.find_matches || 'Find Matches'}
                  </Button>
                </VStack>
              </form>
            </Box>
          </Box>

          {/* Results */}
          <Box gridColumn={{ base: 'span 1', md: 'span 2' }}>
            <Heading as="h3" size="md" mb={4}>
              {translations?.match?.results || 'Matching Results'}
            </Heading>

            {isLoading ? (
              <Flex justify="center" align="center" h="300px">
                <Spinner size="xl" color="brand.500" />
              </Flex>
            ) : matchResults.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {matchResults.map((job) => (
                  <Box
                    key={job.id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    boxShadow="sm"
                    position="relative"
                    overflow="hidden"
                  >
                    {/* Match Score Badge */}
                    <Badge
                      position="absolute"
                      top={0}
                      right={0}
                      px={2}
                      py={1}
                      borderBottomLeftRadius="md"
                      colorScheme={job.matchScore > 90 ? 'green' : job.matchScore > 80 ? 'blue' : 'yellow'}
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {job.matchScore}% {translations?.match?.match || 'Match'}
                    </Badge>

                    <Flex>
                      <Avatar src={job.company.logo} size="md" mr={4} />
                      <Box flex={1}>
                        <Heading as="h4" size="md">
                          <NextLink href={`/jobs/${job.id}`} passHref legacyBehavior>
                            <Link color="brand.500">{job.title}</Link>
                          </NextLink>
                        </Heading>
                        <Text color="gray.500">{job.company.name}</Text>
                        <Flex mt={2} flexWrap="wrap">
                          <Text mr={4}>
                            <Box as="span" fontWeight="bold">{translations?.jobs?.location || 'Location'}:</Box> {job.location}
                            {job.remote && ` (${translations?.jobs?.remote || 'Remote'})`}
                          </Text>
                          <Text>
                            <Box as="span" fontWeight="bold">{translations?.jobs?.salary || 'Salary'}:</Box> {job.salary}
                          </Text>
                        </Flex>
                        <HStack mt={2} flexWrap="wrap">
                          {job.skills.map((skill) => (
                            <Tag key={skill} size="sm" colorScheme="brand" m={1}>
                              {skill}
                            </Tag>
                          ))}
                        </HStack>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box
                p={6}
                bg={useColorModeValue('white', 'gray.800')}
                borderRadius="lg"
                boxShadow="md"
                textAlign="center"
              >
                <Text>
                  {translations?.match?.no_results || 'Complete your preferences and click "Find Matches" to see job recommendations'}
                </Text>
              </Box>
            )}

            {/* For development, we'll show mock results if no API results */}
            {!isLoading && matchResults.length === 0 && (
              <Box mt={8}>
                <Heading as="h3" size="sm" mb={4} color="gray.500">
                  {translations?.match?.sample_matches || 'Sample Matches (Development Only)'}
                </Heading>
                <VStack spacing={4} align="stretch">
                  {mockMatchResults.map((job) => (
                    <Box
                      key={job.id}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      boxShadow="sm"
                      position="relative"
                      overflow="hidden"
                      opacity={0.7}
                    >
                      {/* Match Score Badge */}
                      <Badge
                        position="absolute"
                        top={0}
                        right={0}
                        px={2}
                        py={1}
                        borderBottomLeftRadius="md"
                        colorScheme={job.matchScore > 90 ? 'green' : job.matchScore > 80 ? 'blue' : 'yellow'}
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        {job.matchScore}% {translations?.match?.match || 'Match'}
                      </Badge>

                      <Flex>
                        <Avatar src={job.company.logo} size="md" mr={4} />
                        <Box flex={1}>
                          <Heading as="h4" size="md">
                            <NextLink href={`/jobs/${job.id}`} passHref legacyBehavior>
                              <Button as="a" variant="link" color="brand.500">{job.title}</Button>
                            </NextLink>
                          </Heading>
                          <Text color="gray.500">{job.company.name}</Text>
                          <Flex mt={2} flexWrap="wrap">
                            <Text mr={4}>
                              <Box as="span" fontWeight="bold">{translations?.jobs?.location || 'Location'}:</Box> {job.location}
                              {job.remote && ` (${translations?.jobs?.remote || 'Remote'})`}
                            </Text>
                            <Text>
                              <Box as="span" fontWeight="bold">{translations?.jobs?.salary || 'Salary'}:</Box> {job.salary}
                            </Text>
                          </Flex>
                          <HStack mt={2} flexWrap="wrap">
                            {job.skills.map((skill) => (
                              <Tag key={skill} size="sm" colorScheme="brand" m={1}>
                                {skill}
                              </Tag>
                            ))}
                          </HStack>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default MatchPage;
