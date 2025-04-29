import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
  Checkbox,
  Button,
  Select,
  InputGroup,
  InputLeftElement,
  useToast,
  Flex,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FaDollarSign } from 'react-icons/fa';
import { useLocale } from '../../contexts/LocaleContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { gql, useMutation } from '@apollo/client';

// GraphQL mutation for creating a job
const CREATE_JOB = gql`
  mutation CreateJob($input: JobInput!) {
    createJob(input: $input) {
      id
      title
      description
      skillsRequired
      salary
      remote
      location
      status
      createdAt
    }
  }
`;

const PostJobPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { locale } = useLocale();
  const { account, connected } = useWeb3();
  const [translations, setTranslations] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    remote: false,
    skills: '',
  });

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

  // Check if user is connected
  useEffect(() => {
    if (!connected && typeof window !== 'undefined') {
      toast({
        title: translations?.jobs?.connect_wallet_required || 'Wallet Connection Required',
        description: translations?.jobs?.connect_to_post || 'You need to connect your wallet to post a job',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [connected, toast, translations]);

  // Create job mutation
  const [createJob] = useMutation(CREATE_JOB, {
    onCompleted: (data) => {
      setIsSubmitting(false);
      toast({
        title: translations?.jobs?.job_posted || 'Job Posted',
        description: translations?.jobs?.job_posted_success || 'Your job has been posted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push(`/jobs/${data.createJob.id}`);
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: translations?.jobs?.error_posting || 'Error Posting Job',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      toast({
        title: translations?.jobs?.connect_wallet_required || 'Wallet Connection Required',
        description: translations?.jobs?.connect_to_post || 'You need to connect your wallet to post a job',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Validate form
    if (!formData.title || !formData.description || !formData.salary || (!formData.remote && !formData.location)) {
      toast({
        title: translations?.jobs?.missing_fields || 'Missing Fields',
        description: translations?.jobs?.fill_required || 'Please fill in all required fields',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // For demo purposes, we'll simulate a successful job creation
    // In a real application, you would use the createJob mutation
    
    // Parse skills into array
    const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
    
    // Mock successful job creation
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: translations?.jobs?.job_posted || 'Job Posted',
        description: translations?.jobs?.job_posted_success || 'Your job has been posted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/jobs');
    }, 2000);
    
    // Uncomment to use the actual mutation
    /*
    createJob({
      variables: {
        input: {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          salary: formData.salary,
          remote: formData.remote,
          skillsRequired: skillsArray,
          employerId: account, // Use wallet address as employer ID
        },
      },
    });
    */
  };

  return (
    <Box py={10}>
      <Container maxW={'4xl'}>
        <Box 
          bg={useColorModeValue('white', 'gray.700')} 
          p={8} 
          borderRadius="lg" 
          boxShadow="md"
        >
          <Heading as="h1" mb={6}>
            {translations?.jobs?.post_job || 'Post a Job'}
          </Heading>
          
          <Text mb={8} color="gray.600">
            {translations?.jobs?.post_job_desc || 'Fill in the details below to post a new job opportunity for Web3 talent'}
          </Text>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <FormControl isRequired>
                <FormLabel>{translations?.jobs?.job_title || 'Job Title'}</FormLabel>
                <Input 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={translations?.jobs?.job_title_placeholder || 'e.g. Senior Solidity Developer'}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>{translations?.jobs?.job_description || 'Job Description'}</FormLabel>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={translations?.jobs?.job_description_placeholder || 'Describe the role, responsibilities, and requirements'}
                  minH="200px"
                />
              </FormControl>
              
              <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                <FormControl isRequired={!formData.remote}>
                  <FormLabel>{translations?.jobs?.location || 'Location'}</FormLabel>
                  <Input 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={translations?.jobs?.location_placeholder || 'e.g. San Francisco, CA'}
                    isDisabled={formData.remote}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>{translations?.jobs?.salary || 'Salary Range'}</FormLabel>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<FaDollarSign color="gray.300" />}
                    />
                    <Input 
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder={translations?.jobs?.salary_placeholder || 'e.g. $100k - $150k'}
                    />
                  </InputGroup>
                </FormControl>
              </Flex>
              
              <FormControl>
                <Checkbox 
                  name="remote"
                  isChecked={formData.remote}
                  onChange={handleChange}
                  colorScheme="brand"
                >
                  {translations?.jobs?.remote_job || 'This is a remote job'}
                </Checkbox>
              </FormControl>
              
              <FormControl>
                <FormLabel>{translations?.jobs?.skills || 'Required Skills'}</FormLabel>
                <Input 
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder={translations?.jobs?.skills_placeholder || 'e.g. Solidity, Ethereum, React (comma separated)'}
                />
              </FormControl>
              
              <Divider my={2} />
              
              <Flex justify="flex-end" mt={4}>
                <Button 
                  mr={4} 
                  onClick={() => router.push('/jobs')}
                >
                  {translations?.common?.cancel || 'Cancel'}
                </Button>
                <Button 
                  type="submit" 
                  colorScheme="brand" 
                  isLoading={isSubmitting}
                  loadingText={translations?.common?.submitting || 'Submitting'}
                  isDisabled={!connected}
                >
                  {translations?.jobs?.post_job_button || 'Post Job'}
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default PostJobPage;
