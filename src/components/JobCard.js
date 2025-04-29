import {
  Box,
  Flex,
  Text,
  Stack,
  Badge,
  Avatar,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';

const JobCard = ({
  id = '1', // Default for demo purposes
  title,
  company,
  location,
  salary,
  skills = [],
  logo,
  remote = false,
  createdAt,
  locale,
  translations,
}) => {
  // Format date if provided
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <NextLink href={`/jobs/${id}`} passHref legacyBehavior>
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
                {translations?.jobs?.location || 'Location'}:
              </Text>
              <Text ml={1} color={'gray.500'}>
                {remote
                  ? translations?.jobs?.remote || 'Remote'
                  : location}
              </Text>
            </Flex>

            <Flex align="center">
              <Text fontWeight={600}>
                {translations?.jobs?.salary || 'Salary'}:
              </Text>
              <Text ml={1} color={'gray.500'}>
                {salary}
              </Text>
            </Flex>

            {formattedDate && (
              <Flex align="center">
                <Text fontWeight={600}>
                  {translations?.jobs?.posted_on || 'Posted on'}:
                </Text>
                <Text ml={1} color={'gray.500'}>
                  {formattedDate}
                </Text>
              </Flex>
            )}
          </Stack>
        </Stack>

        <Stack mt={4} direction={'row'} spacing={2} flexWrap="wrap">
          {skills.map((skill) => (
            <Badge
              key={skill}
              px={2}
              py={1}
              bg={useColorModeValue('brand.50', 'brand.900')}
              color={useColorModeValue('brand.600', 'brand.200')}
              fontWeight={'400'}
              rounded="full"
            >
              {skill}
            </Badge>
          ))}
        </Stack>
      </Box>
    </NextLink>
  );
};

export default JobCard;
