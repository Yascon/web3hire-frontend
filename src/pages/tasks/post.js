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
  Button,
  Select,
  InputGroup,
  InputLeftElement,
  useToast,
  Flex,
  useColorModeValue,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useLocale } from '../../contexts/LocaleContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { gql, useMutation } from '@apollo/client';

// GraphQL mutation for creating a task
const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      reward
      rewardToken
      deadline
      status
      createdAt
    }
  }
`;

const PostTaskPage = () => {
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
    reward: '',
    rewardToken: 'USDT',
    deadline: '',
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
        title: translations?.tasks?.connect_wallet_required || 'Wallet Connection Required',
        description: translations?.tasks?.connect_to_post || 'You need to connect your wallet to post a task',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [connected, toast, translations]);

  // Create task mutation
  const [createTask] = useMutation(CREATE_TASK, {
    onCompleted: (data) => {
      setIsSubmitting(false);
      toast({
        title: translations?.tasks?.task_posted || 'Task Posted',
        description: translations?.tasks?.task_posted_success || 'Your task has been posted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push(`/tasks/${data.createTask.id}`);
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: translations?.tasks?.error_posting || 'Error Posting Task',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle number input change
  const handleNumberChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Calculate minimum deadline (tomorrow)
  const getMinDeadline = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      toast({
        title: translations?.tasks?.connect_wallet_required || 'Wallet Connection Required',
        description: translations?.tasks?.connect_to_post || 'You need to connect your wallet to post a task',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Validate form
    if (!formData.title || !formData.description || !formData.reward || !formData.deadline) {
      toast({
        title: translations?.tasks?.missing_fields || 'Missing Fields',
        description: translations?.tasks?.fill_required || 'Please fill in all required fields',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // For demo purposes, we'll simulate a successful task creation
    // In a real application, you would use the createTask mutation
    
    // Mock successful task creation
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: translations?.tasks?.task_posted || 'Task Posted',
        description: translations?.tasks?.task_posted_success || 'Your task has been posted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/tasks');
    }, 2000);
    
    // Uncomment to use the actual mutation
    /*
    createTask({
      variables: {
        input: {
          title: formData.title,
          description: formData.description,
          reward: parseFloat(formData.reward),
          rewardToken: formData.rewardToken,
          deadline: formData.deadline,
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
            {translations?.tasks?.post_task || 'Post a Bounty Task'}
          </Heading>
          
          <Text mb={8} color="gray.600">
            {translations?.tasks?.post_task_desc || 'Create a new bounty task for the Web3 community'}
          </Text>
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <FormControl isRequired>
                <FormLabel>{translations?.tasks?.task_title || 'Task Title'}</FormLabel>
                <Input 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={translations?.tasks?.task_title_placeholder || 'e.g. Create a DApp Landing Page'}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>{translations?.tasks?.task_description || 'Task Description'}</FormLabel>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={translations?.tasks?.task_description_placeholder || 'Describe the task, requirements, and deliverables'}
                  minH="200px"
                />
              </FormControl>
              
              <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                <FormControl isRequired>
                  <FormLabel>{translations?.tasks?.reward || 'Reward Amount'}</FormLabel>
                  <NumberInput
                    min={1}
                    value={formData.reward}
                    onChange={(value) => handleNumberChange('reward', value)}
                  >
                    <NumberInputField 
                      placeholder={translations?.tasks?.reward_placeholder || 'e.g. 1000'}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>{translations?.tasks?.reward_token || 'Reward Token'}</FormLabel>
                  <Select
                    name="rewardToken"
                    value={formData.rewardToken}
                    onChange={handleChange}
                  >
                    <option value="USDT">USDT</option>
                    <option value="ETH">ETH</option>
                    <option value="MATIC">MATIC</option>
                    <option value="USDC">USDC</option>
                  </Select>
                </FormControl>
              </Flex>
              
              <FormControl isRequired>
                <FormLabel>{translations?.tasks?.deadline || 'Deadline'}</FormLabel>
                <Input 
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={getMinDeadline()}
                />
              </FormControl>
              
              <Divider my={2} />
              
              <Flex justify="flex-end" mt={4}>
                <Button 
                  mr={4} 
                  onClick={() => router.push('/tasks')}
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
                  {translations?.tasks?.post_task_button || 'Post Task'}
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Container>
    </Box>
  );
};

export default PostTaskPage;
