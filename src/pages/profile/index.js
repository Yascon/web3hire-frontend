import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  Badge,
  useToast,
  Spinner,
  useColorModeValue,
  Link,
  IconButton,
  Divider,
  Progress,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { useLocale } from '../../contexts/LocaleContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { gql, useQuery, useMutation } from '@apollo/client';
import { initIPFS, uploadToIPFS, getIPFSGatewayUrl } from '../../services/ipfsService';

// GraphQL queries and mutations
const GET_USER = gql`
  query GetUser($walletAddress: String!) {
    user(walletAddress: $walletAddress) {
      id
      walletAddress
      email
      name
      role
      skills
      resumeIpfsHash
      bio
      profileImage
      socialLinks {
        github
        twitter
        linkedin
        website
      }
      createdAt
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($input: UserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      skills
      bio
      profileImage
      socialLinks {
        github
        twitter
        linkedin
        website
      }
    }
  }
`;

const UPLOAD_RESUME = gql`
  mutation UploadResume($ipfsHash: String!) {
    uploadResume(ipfsHash: $ipfsHash) {
      id
      resumeIpfsHash
    }
  }
`;

const ProfilePage = () => {
  const router = useRouter();
  const { locale } = useLocale();
  const { account, resumeContract, isCorrectNetwork, switchNetwork } = useWeb3();
  const toast = useToast();
  const [translations, setTranslations] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: [],
    profileImage: '',
    socialLinks: {
      github: '',
      twitter: '',
      linkedin: '',
      website: '',
    },
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

  // Redirect if not connected
  useEffect(() => {
    if (!account) {
      router.push('/');
    }
  }, [account, router]);

  // Fetch user data
  const { loading, error, data, refetch } = useQuery(GET_USER, {
    variables: { walletAddress: account },
    skip: !account,
    onCompleted: (data) => {
      if (data?.user) {
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
          skills: data.user.skills || [],
          profileImage: data.user.profileImage || '',
          socialLinks: {
            github: data.user.socialLinks?.github || '',
            twitter: data.user.socialLinks?.twitter || '',
            linkedin: data.user.socialLinks?.linkedin || '',
            website: data.user.socialLinks?.website || '',
          },
        });
      }
    },
  });

  // Update user mutation
  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      toast({
        title: locale === 'zh' ? '个人资料已更新' : 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: locale === 'zh' ? '更新失败' : 'Update failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Upload resume mutation
  const [uploadResumeMutation] = useMutation(UPLOAD_RESUME, {
    onCompleted: () => {
      toast({
        title: locale === 'zh' ? '简历已上传' : 'Resume uploaded',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: locale === 'zh' ? '上传失败' : 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Add a new skill
  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  // Remove a skill
  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      variables: {
        input: formData,
      },
    });
  };

  // Upload resume to IPFS and blockchain
  const uploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: locale === 'zh' ? '文件类型不支持' : 'Unsupported file type',
        description: locale === 'zh' ? '请上传PDF或Word文档' : 'Please upload a PDF or Word document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: locale === 'zh' ? '文件太大' : 'File too large',
        description: locale === 'zh' ? '文件大小不能超过5MB' : 'File size cannot exceed 5MB',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsUploading(true);

      // Check if connected to correct network
      if (!isCorrectNetwork()) {
        await switchNetwork();
      }

      // Initialize IPFS client
      initIPFS();
      
      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(file);
      console.log('File uploaded to IPFS with hash:', ipfsHash);
      
      // Store hash on blockchain
      if (resumeContract) {
        toast({
          title: locale === 'zh' ? '正在上传到区块链' : 'Uploading to blockchain',
          description: locale === 'zh' ? '请在钱包中确认交易' : 'Please confirm the transaction in your wallet',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        
        const tx = await resumeContract.uploadResume(ipfsHash);
        await tx.wait();
        
        // Update backend
        await uploadResumeMutation({
          variables: {
            ipfsHash: ipfsHash,
          },
        });
        
        toast({
          title: locale === 'zh' ? '简历上传成功' : 'Resume uploaded successfully',
          description: locale === 'zh' ? '您的简历已保存到IPFS和区块链' : 'Your resume has been saved to IPFS and blockchain',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh user data
        refetch();
      } else {
        throw new Error(locale === 'zh' ? '简历合约未初始化' : 'Resume contract not initialized');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: locale === 'zh' ? '上传失败' : 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // View resume on IPFS
  const viewResume = () => {
    const ipfsHash = data?.user?.resumeIpfsHash;
    if (ipfsHash) {
      // In a real implementation, use IPFS gateway URL
      const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
      window.open(`${ipfsGateway}${ipfsHash}`, '_blank');
    }
  };

  // Mock data for applications, jobs, and tasks
  const mockApplications = [
    { id: '1', title: 'Senior Solidity Developer', company: 'DeFi Protocol', status: 'Applied', date: '2023-04-15' },
    { id: '2', title: 'Blockchain Frontend Engineer', company: 'NFT Marketplace', status: 'Interviewing', date: '2023-04-10' },
  ];

  const mockBids = [
    { id: '1', title: 'Create a DApp Landing Page', company: 'Web3 Startup', reward: 2000, status: 'Pending', date: '2023-04-15' },
    { id: '2', title: 'Develop NFT Minting Function', company: 'Art Collective', reward: 1500, status: 'Accepted', date: '2023-04-10' },
  ];

  if (!account) {
    return null; // Redirect handled by useEffect
  }

  return (
    <Box py={8}>
      <Container maxW={'6xl'}>
        {loading ? (
          <Flex justify="center" my={10}>
            <Spinner size="xl" color="brand.500" />
          </Flex>
        ) : error ? (
          <Box textAlign="center" my={10} p={5} bg="red.50" borderRadius="md">
            <Text color="red.500">
              {locale === 'zh' ? '加载用户数据时出错' : 'Error loading user data'}: {error.message}
            </Text>
          </Box>
        ) : (
          <>
            {/* Profile Header */}
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              align={{ base: 'center', md: 'flex-start' }}
              mb={8}
              gap={6}
            >
              <Avatar 
                size="2xl" 
                src={formData.profileImage || `https://avatars.dicebear.com/api/identicon/${account}.svg`} 
              />
              
              <Box flex={1}>
                <Heading as="h1" size="xl" mb={2}>
                  {formData.name || (locale === 'zh' ? '未命名用户' : 'Unnamed User')}
                </Heading>
                
                <Text color="gray.500" mb={4}>
                  {account}
                </Text>
                
                <Badge colorScheme={data?.user?.role === 'Employer' ? 'purple' : 'green'} mb={4}>
                  {data?.user?.role === 'Employer' 
                    ? (locale === 'zh' ? '招聘方' : 'Employer')
                    : (locale === 'zh' ? '求职者' : 'Candidate')}
                </Badge>
                
                {!isEditing && (
                  <Button 
                    colorScheme="brand" 
                    onClick={() => setIsEditing(true)}
                  >
                    {translations?.profile?.edit_profile || 'Edit Profile'}
                  </Button>
                )}
              </Box>
            </Flex>

            <Tabs colorScheme="brand" isLazy>
              <TabList>
                <Tab>{translations?.profile?.personal_info || 'Personal Information'}</Tab>
                <Tab>{translations?.profile?.resume || 'Resume'}</Tab>
                <Tab>{locale === 'zh' ? '我的申请' : 'My Applications'}</Tab>
                <Tab>{locale === 'zh' ? '我的竞标' : 'My Bids'}</Tab>
              </TabList>

              <TabPanels>
                {/* Personal Information Tab */}
                <TabPanel>
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <Stack spacing={6}>
                        <FormControl>
                          <FormLabel>{locale === 'zh' ? '姓名' : 'Name'}</FormLabel>
                          <Input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>{locale === 'zh' ? '电子邮件' : 'Email'}</FormLabel>
                          <Input 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>{locale === 'zh' ? '个人简介' : 'Bio'}</FormLabel>
                          <Textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleInputChange} 
                            rows={4}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>{locale === 'zh' ? '头像URL' : 'Profile Image URL'}</FormLabel>
                          <Input 
                            name="profileImage" 
                            value={formData.profileImage} 
                            onChange={handleInputChange} 
                            placeholder="https://..." 
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>{translations?.profile?.skills || 'Skills'}</FormLabel>
                          <Flex mb={2}>
                            <Input 
                              value={newSkill} 
                              onChange={(e) => setNewSkill(e.target.value)} 
                              placeholder={locale === 'zh' ? '添加技能' : 'Add a skill'} 
                              mr={2}
                            />
                            <Button onClick={addSkill}>
                              <AddIcon />
                            </Button>
                          </Flex>
                          <Flex wrap="wrap" gap={2}>
                            {formData.skills.map((skill) => (
                              <Badge 
                                key={skill} 
                                colorScheme="brand" 
                                p={2} 
                                borderRadius="md"
                              >
                                {skill}
                                <IconButton
                                  icon={<DeleteIcon />}
                                  size="xs"
                                  ml={1}
                                  variant="ghost"
                                  onClick={() => removeSkill(skill)}
                                  aria-label={locale === 'zh' ? '移除技能' : 'Remove skill'}
                                />
                              </Badge>
                            ))}
                          </Flex>
                        </FormControl>

                        <Heading as="h3" size="md" mt={4}>
                          {translations?.profile?.social_links || 'Social Links'}
                        </Heading>

                        <FormControl>
                          <FormLabel>GitHub</FormLabel>
                          <Input 
                            name="socialLinks.github" 
                            value={formData.socialLinks.github} 
                            onChange={handleInputChange} 
                            placeholder="https://github.com/username" 
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Twitter</FormLabel>
                          <Input 
                            name="socialLinks.twitter" 
                            value={formData.socialLinks.twitter} 
                            onChange={handleInputChange} 
                            placeholder="https://twitter.com/username" 
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>LinkedIn</FormLabel>
                          <Input 
                            name="socialLinks.linkedin" 
                            value={formData.socialLinks.linkedin} 
                            onChange={handleInputChange} 
                            placeholder="https://linkedin.com/in/username" 
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>{locale === 'zh' ? '个人网站' : 'Website'}</FormLabel>
                          <Input 
                            name="socialLinks.website" 
                            value={formData.socialLinks.website} 
                            onChange={handleInputChange} 
                            placeholder="https://yourwebsite.com" 
                          />
                        </FormControl>

                        <Flex justify="flex-end" gap={4}>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(false)}
                          >
                            {translations?.forms?.cancel || 'Cancel'}
                          </Button>
                          <Button 
                            type="submit" 
                            colorScheme="brand" 
                            isLoading={updating}
                          >
                            {translations?.profile?.save_changes || 'Save Changes'}
                          </Button>
                        </Flex>
                      </Stack>
                    </form>
                  ) : (
                    <Stack spacing={6}>
                      <Box>
                        <Heading as="h3" size="md" mb={2}>
                          {locale === 'zh' ? '个人简介' : 'Bio'}
                        </Heading>
                        <Text>{formData.bio || (locale === 'zh' ? '未提供个人简介' : 'No bio provided')}</Text>
                      </Box>

                      <Box>
                        <Heading as="h3" size="md" mb={2}>
                          {translations?.profile?.skills || 'Skills'}
                        </Heading>
                        <Flex wrap="wrap" gap={2}>
                          {formData.skills.length > 0 ? (
                            formData.skills.map((skill) => (
                              <Badge key={skill} colorScheme="brand" p={2} borderRadius="md">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <Text color="gray.500">
                              {locale === 'zh' ? '未添加技能' : 'No skills added'}
                            </Text>
                          )}
                        </Flex>
                      </Box>

                      <Box>
                        <Heading as="h3" size="md" mb={2}>
                          {translations?.profile?.social_links || 'Social Links'}
                        </Heading>
                        <Stack>
                          {formData.socialLinks.github && (
                            <Link href={formData.socialLinks.github} isExternal>
                              GitHub <ExternalLinkIcon mx="2px" />
                            </Link>
                          )}
                          {formData.socialLinks.twitter && (
                            <Link href={formData.socialLinks.twitter} isExternal>
                              Twitter <ExternalLinkIcon mx="2px" />
                            </Link>
                          )}
                          {formData.socialLinks.linkedin && (
                            <Link href={formData.socialLinks.linkedin} isExternal>
                              LinkedIn <ExternalLinkIcon mx="2px" />
                            </Link>
                          )}
                          {formData.socialLinks.website && (
                            <Link href={formData.socialLinks.website} isExternal>
                              {locale === 'zh' ? '个人网站' : 'Website'} <ExternalLinkIcon mx="2px" />
                            </Link>
                          )}
                          {!formData.socialLinks.github && 
                           !formData.socialLinks.twitter && 
                           !formData.socialLinks.linkedin && 
                           !formData.socialLinks.website && (
                            <Text color="gray.500">
                              {locale === 'zh' ? '未添加社交链接' : 'No social links added'}
                            </Text>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </TabPanel>

                {/* Resume Tab */}
                <TabPanel>
                  <Box 
                    p={6} 
                    borderWidth={1} 
                    borderRadius="md" 
                    borderStyle="dashed" 
                    borderColor="gray.300"
                    textAlign="center"
                  >
                    {data?.user?.resumeIpfsHash ? (
                      <>
                        <Heading as="h3" size="md" mb={4}>
                          {locale === 'zh' ? '简历已上传到区块链' : 'Resume Uploaded to Blockchain'}
                        </Heading>
                        <Text mb={4}>
                          IPFS Hash: {data.user.resumeIpfsHash}
                        </Text>
                        <Button 
                          colorScheme="brand" 
                          onClick={viewResume}
                          rightIcon={<ExternalLinkIcon />}
                        >
                          {translations?.profile?.view_resume || 'View Resume'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Heading as="h3" size="md" mb={4}>
                          {locale === 'zh' ? '上传您的简历到区块链' : 'Upload Your Resume to Blockchain'}
                        </Heading>
                        <Text mb={4}>
                          {locale === 'zh' 
                            ? '您的简历将被安全地存储在IPFS上，并且其哈希值将被记录在区块链上' 
                            : 'Your resume will be securely stored on IPFS and its hash will be recorded on the blockchain'}
                        </Text>
                        <Button
                          as="label"
                          htmlFor="resume-upload"
                          colorScheme="brand"
                          isLoading={isUploading}
                          cursor="pointer"
                        >
                          {translations?.profile?.upload_resume || 'Upload Resume'}
                          <input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={uploadResume}
                            style={{ display: 'none' }}
                            disabled={isUploading}
                          />
                        </Button>
                      </>
                    )}
                  </Box>
                </TabPanel>

                {/* Applications Tab */}
                <TabPanel>
                  <Heading as="h3" size="md" mb={4}>
                    {translations?.profile?.my_applications || 'My Applications'}
                  </Heading>
                  
                  {mockApplications.length > 0 ? (
                    <Stack spacing={4}>
                      {mockApplications.map((app) => (
                        <Box 
                          key={app.id} 
                          p={4} 
                          borderWidth={1} 
                          borderRadius="md" 
                          boxShadow="sm"
                        >
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Heading as="h4" size="sm">{app.title}</Heading>
                              <Text color="gray.500">{app.company}</Text>
                            </Box>
                            <Flex direction="column" align="flex-end">
                              <Badge colorScheme={app.status === 'Applied' ? 'blue' : 'green'}>
                                {app.status}
                              </Badge>
                              <Text fontSize="sm" color="gray.500" mt={1}>
                                {app.date}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box textAlign="center" p={6} borderWidth={1} borderRadius="md">
                      <Text>
                        {locale === 'zh' ? '您还没有申请任何职位' : 'You haven\'t applied to any jobs yet'}
                      </Text>
                    </Box>
                  )}
                </TabPanel>

                {/* Bids Tab */}
                <TabPanel>
                  <Heading as="h3" size="md" mb={4}>
                    {translations?.profile?.my_bids || 'My Bids'}
                  </Heading>
                  
                  {mockBids.length > 0 ? (
                    <Stack spacing={4}>
                      {mockBids.map((bid) => (
                        <Box 
                          key={bid.id} 
                          p={4} 
                          borderWidth={1} 
                          borderRadius="md" 
                          boxShadow="sm"
                        >
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Heading as="h4" size="sm">{bid.title}</Heading>
                              <Text color="gray.500">{bid.company}</Text>
                              <Text mt={1} fontWeight="bold">
                                {translations?.tasks?.reward || 'Reward'}: {bid.reward} USDT
                              </Text>
                            </Box>
                            <Flex direction="column" align="flex-end">
                              <Badge colorScheme={bid.status === 'Accepted' ? 'green' : 'blue'}>
                                {bid.status}
                              </Badge>
                              <Text fontSize="sm" color="gray.500" mt={1}>
                                {bid.date}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Box textAlign="center" p={6} borderWidth={1} borderRadius="md">
                      <Text>
                        {locale === 'zh' ? '您还没有竞标任何任务' : 'You haven\'t bid on any tasks yet'}
                      </Text>
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </Container>
    </Box>
  );
};

export default ProfilePage;
