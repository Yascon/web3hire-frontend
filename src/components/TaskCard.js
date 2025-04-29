import {
  Box,
  Flex,
  Text,
  Stack,
  Avatar,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';

const TaskCard = ({
  id = '1', // Default for demo purposes
  title,
  company,
  reward,
  rewardToken = 'USDT',
  deadline,
  logo,
  status = 'Open',
  createdAt,
  locale,
  translations,
}) => {
  // Format date if provided
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formattedDeadline = deadline ? formatDate(deadline) : null;
  const formattedCreatedAt = createdAt ? formatDate(createdAt) : null;

  // Status color
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

  const statusColor = getStatusColor(status);

  return (
    <NextLink href={`/tasks/${id}`} passHref legacyBehavior>
      <Box
        as="a"
        maxW={'445px'}
        w={'full'}
        bg={useColorModeValue('white', 'gray.900')}
        boxShadow={'md'}
        rounded={'md'}
        p={6}
        overflow={'hidden'}
        transition="all 0.3s"
        _hover={{
          transform: 'translateY(-5px)',
          boxShadow: 'lg',
        }}
      >
        <Flex justify="space-between" align="start">
          <Box>
            <Heading
              color={useColorModeValue('gray.700', 'white')}
              fontSize={'xl'}
              fontFamily={'body'}
              noOfLines={2}
              mb={2}
            >
              {title}
            </Heading>

            <Text color={'gray.500'} fontSize="md" mb={2}>
              {company}
            </Text>
          </Box>

          <Avatar src={logo} size="md" />
        </Flex>

        <Stack mt={4} direction={'row'} spacing={4} align={'center'}>
          <Stack direction={'column'} spacing={0} fontSize={'sm'}>
            <Flex align="center">
              <Text fontWeight={600}>
                {translations?.tasks?.reward || 'Reward'}:
              </Text>
              <Text ml={1} color={'gray.500'}>
                {reward} {rewardToken}
              </Text>
            </Flex>

            {formattedDeadline && (
              <Flex align="center">
                <Text fontWeight={600}>
                  {translations?.tasks?.deadline || 'Deadline'}:
                </Text>
                <Text ml={1} color={'gray.500'}>
                  {formattedDeadline}
                </Text>
              </Flex>
            )}

            {formattedCreatedAt && (
              <Flex align="center">
                <Text fontWeight={600}>
                  {translations?.tasks?.posted_on || 'Posted on'}:
                </Text>
                <Text ml={1} color={'gray.500'}>
                  {formattedCreatedAt}
                </Text>
              </Flex>
            )}

            <Flex align="center" mt={2}>
              <Text fontWeight={600}>
                {translations?.tasks?.status || 'Status'}:
              </Text>
              <Text
                ml={1}
                color={`${statusColor}.500`}
                fontWeight="bold"
              >
                {status}
              </Text>
            </Flex>
          </Stack>
        </Stack>
      </Box>
    </NextLink>
  );
};

export default TaskCard;
