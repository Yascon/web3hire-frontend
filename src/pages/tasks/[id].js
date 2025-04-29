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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';
import { FaCalendarAlt, FaBuilding, FaEthereum } from 'react-icons/fa';
import { useLocale } from '../../contexts/LocaleContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { gql, useQuery } from '@apollo/client';

// GraphQL query for task details
const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
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

const TaskDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { locale } = useLocale();
  const { account, bountyContract } = useWeb3();
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

  // Fetch task data from blockchain
  const [taskData, setTaskData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!id || !bountyContract) return;
      
      try {
        setIsLoading(true);
        // Convert id to number if it's a string
        const taskId = typeof id === 'string' ? parseInt(id) : id;
        
        // Call the contract to get task data
        const bountyData = await bountyContract.getBounty(taskId);
        
        // Check if the bounty exists
        if (bountyData.exists) {
          // Convert the contract data to our expected format
          const task = {
            id: bountyData.id.toString(),
            title: bountyData.title,
            description: bountyData.description,
            reward: bountyData.reward.toNumber(),
            rewardToken: bountyData.rewardToken,
            deadline: new Date(bountyData.deadline.toNumber() * 1000).toISOString(),
            status: ['Open', 'InProgress', 'Completed', 'Cancelled'][bountyData.status],
            createdAt: new Date(bountyData.createdAt.toNumber() * 1000).toISOString(),
            employer: {
              id: '1', // This would ideally come from a separate call or mapping
              name: 'Company', // This would ideally come from a separate call or mapping
              walletAddress: bountyData.employer,
              profileImage: `https://avatars.dicebear.com/api/identicon/${bountyData.employer}.svg`
            }
          };
          
          setTaskData(task);
        } else {
          setLoadError(new Error('Task not found'));
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
        setLoadError(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTaskData();
  }, [id, bountyContract]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (deadlineString) => {
    const deadline = new Date(deadlineString);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle apply
  const handleApply = async () => {
    if (!account) {
      // Prompt user to connect wallet
      toast({
        title: translations?.tasks?.connect_wallet_required || 'Wallet Connection Required',
        description: translations?.tasks?.connect_to_apply || 'You need to connect your wallet to apply for this task',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!bountyContract) {
      toast({
        title: translations?.tasks?.contract_not_available || 'Contract Not Available',
        description: translations?.tasks?.contract_not_initialized || 'Bounty contract is not initialized',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      // Convert id to number if it's a string
      const taskId = typeof id === 'string' ? parseInt(id) : id;
      
      // Call the contract to apply for the task
      const tx = await bountyContract.applyForBounty(taskId);
      
      // Wait for the transaction to be mined
      await tx.wait();
      
      toast({
        title: translations?.tasks?.application_submitted || 'Application Submitted',
        description: translations?.tasks?.application_submitted_desc || 'Your application has been submitted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh the page to show the updated status
      router.reload();
    } catch (error) {
      console.error('Error applying for task:', error);
      
      toast({
        title: translations?.tasks?.error_applying || 'Error Applying',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Use fallback data if no task is found
  const fallbackTask = {
    id: id || '1',
    title: 'Task Not Found',
    company: 'Unknown',
    description: 'This task does not exist or has been removed.',
    reward: 0,
    rewardToken: 'USDT',
    deadline: new Date().toISOString(),
    logo: 'https://avatars.dicebear.com/api/identicon/unknown.svg',
    status: 'Cancelled',
    createdAt: new Date().toISOString(),
    employer: {
      id: '0',
      name: 'Unknown',
      walletAddress: '0x0000000000000000000000000000000000000000',
      profileImage: 'https://avatars.dicebear.com/api/identicon/unknown.svg',
    }
  };

  // Use blockchain data or fallback
  const task = taskData || fallbackTask;

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'green';
      case 'InProgress':
        return 'blue';
      case 'Completed':
        return 'gray';
      case 'Cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const statusColor = getStatusColor(task.status);
  const daysRemaining = getDaysRemaining(task.deadline);

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
          {locale === 'zh' ? 'u52a0u8f7du4efbu52a1u65f6u51fau9519' : 'Error loading task'}: {loadError.message}
        </Text>
      </Box>
    );
  }

  return (
    <Box py={10}>
      <Container maxW={'6xl'}>
        {/* Task Header */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          align={{ base: 'start', md: 'center' }} 
          justify="space-between"
          mb={8}
          gap={4}
        >
          <Flex align="center">
            <Avatar 
              src={task.logo || task.employer?.profileImage} 
              size="xl" 
              mr={4} 
              bg="brand.50"
              border="2px solid"
              borderColor="brand.500"
            />
            <Box>
              <Heading as="h1" size="xl" mb={2}>
                {task.title}
              </Heading>
              <Text fontSize="lg" color="gray.600" mb={2}>
                {task.company || task.employer?.name}
              </Text>
              <Flex wrap="wrap" gap={2} align="center">
                <Badge colorScheme={statusColor} px={2} py={1} borderRadius="full">
                  {task.status}
                </Badge>
                <Flex align="center" ml={4}>
                  <Icon as={FaEthereum} color="gray.500" mr={1} />
                  <Text color="gray.500">
                    {task.reward} {task.rewardToken}
                  </Text>
                </Flex>
                <Flex align="center" ml={4}>
                  <Icon as={FaCalendarAlt} color="gray.500" mr={1} />
                  <Text color="gray.500">
                    {translations?.tasks?.deadline || 'Deadline'}: {formatDate(task.deadline)}
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
            isDisabled={task.status !== 'Open'}
          >
            {task.status === 'Open' 
              ? (translations?.tasks?.apply_now || 'Apply Now')
              : (translations?.tasks?.not_available || 'Not Available')}
          </Button>
        </Flex>

        <Divider mb={8} />

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {/* Main Content */}
          <Box gridColumn="span 2">
            <Box mb={8}>
              <Heading as="h2" size="md" mb={4}>
                {translations?.tasks?.description || 'Task Description'}
              </Heading>
              <Text whiteSpace="pre-line">{task.description}</Text>
            </Box>

            <Box mb={8}>
              <Heading as="h2" size="md" mb={4}>
                {translations?.tasks?.how_to_apply || 'How to Apply'}
              </Heading>
              <List spacing={3}>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  {translations?.tasks?.connect_wallet || 'Connect your wallet to verify your identity'}
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  {translations?.tasks?.review_requirements || 'Review the task requirements carefully'}
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  {translations?.tasks?.click_apply || 'Click the Apply button and confirm the transaction'}
                </ListItem>
                <ListItem>
                  <ListIcon as={WarningIcon} color="orange.500" />
                  {translations?.tasks?.escrow_warning || 'Funds are held in escrow until task completion is verified'}
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
                {translations?.tasks?.reward_details || 'Reward Details'}
              </Heading>
              <Stat mb={4}>
                <StatLabel>{translations?.tasks?.bounty_amount || 'Bounty Amount'}</StatLabel>
                <StatNumber>{task.reward} {task.rewardToken}</StatNumber>
                <StatHelpText>
                  {translations?.tasks?.paid_on_completion || 'Paid upon successful completion'}
                </StatHelpText>
              </Stat>
              <Divider my={4} />
              <Heading as="h4" size="sm" mb={2}>
                {translations?.tasks?.time_remaining || 'Time Remaining'}
              </Heading>
              <Text fontSize="2xl" fontWeight="bold" mb={2}>
                {daysRemaining > 0 ? `${daysRemaining} ${translations?.tasks?.days || 'days'}` : translations?.tasks?.expired || 'Expired'}
              </Text>
              <Progress 
                value={daysRemaining > 0 ? (daysRemaining < 7 ? 100 - (daysRemaining * 14) : 30) : 0} 
                colorScheme={daysRemaining < 3 ? 'red' : daysRemaining < 7 ? 'orange' : 'green'}
                size="sm"
                borderRadius="full"
                mb={2}
              />
              <Text fontSize="sm" color="gray.500">
                {translations?.tasks?.deadline || 'Deadline'}: {formatDate(task.deadline)}
              </Text>
            </Box>

            <Box 
              p={6} 
              bg={useColorModeValue('white', 'gray.700')} 
              borderRadius="md"
              boxShadow="md"
            >
              <Heading as="h3" size="md" mb={4}>
                {translations?.tasks?.company_info || 'Company Information'}
              </Heading>
              <Flex align="center" mb={4}>
                <Icon as={FaBuilding} color="gray.500" mr={2} />
                <Text>{task.company || task.employer?.name}</Text>
              </Flex>
              {task.employer?.walletAddress && (
                <Flex align="center" mb={4}>
                  <InfoIcon color="gray.500" mr={2} />
                  <Text fontSize="sm" isTruncated>
                    {task.employer.walletAddress.substring(0, 6)}...{task.employer.walletAddress.substring(38)}
                  </Text>
                </Flex>
              )}
              <Button 
                colorScheme="gray" 
                variant="outline" 
                size="sm" 
                width="full"
                onClick={() => router.push(`/companies/${task.employer?.id || '1'}`)}
              >
                {translations?.tasks?.view_company || 'View Company Profile'}
              </Button>
            </Box>
          </Box>
        </SimpleGrid>

        <Box mt={10}>
          <Button 
            colorScheme="brand" 
            size="lg"
            onClick={handleApply}
            width={{ base: 'full', md: 'auto' }}
            isDisabled={task.status !== 'Open'}
          >
            {task.status === 'Open' 
              ? (translations?.tasks?.apply_now || 'Apply Now')
              : (translations?.tasks?.not_available || 'Not Available')}
          </Button>
          <Button 
            ml={{ base: 0, md: 4 }} 
            mt={{ base: 4, md: 0 }}
            onClick={() => router.push('/tasks')}
            width={{ base: 'full', md: 'auto' }}
          >
            {translations?.tasks?.back_to_tasks || 'Back to Tasks'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default TaskDetailPage;
