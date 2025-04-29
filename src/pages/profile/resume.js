import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Flex,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Icon,
  Link,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FaUpload, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { useLocale } from '../../contexts/LocaleContext';
import { useWeb3 } from '../../contexts/Web3Context';

const ResumeUploadPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { locale } = useLocale();
  const { account, connected, resumeContract } = useWeb3();
  const [translations, setTranslations] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const fileInputRef = useRef(null);

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
        title: translations?.profile?.connect_wallet_required || 'Wallet Connection Required',
        description: translations?.profile?.connect_to_upload || 'You need to connect your wallet to upload your resume',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } else if (connected) {
      // Check if user already has a resume
      fetchResumeData();
    }
  }, [connected, toast, translations]);

  // Fetch resume data from blockchain
  const fetchResumeData = async () => {
    if (!resumeContract || !account) return;

    try {
      // Call the contract method to get resume data
      const hasResume = await resumeContract.hasResume(account);
      
      if (hasResume) {
        const [ipfsHash, timestamp, fileName, exists] = await resumeContract.getResume(account);
        
        if (exists) {
          setResumeData({
            ipfsHash,
            timestamp: timestamp.toNumber(),
            fileName,
          });
        } else {
          setResumeData(null);
        }
      } else {
        setResumeData(null);
      }
    } catch (error) {
      console.error('Error fetching resume data:', error);
      toast({
        title: translations?.profile?.error_fetching || 'Error Fetching Resume',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: translations?.profile?.invalid_file_type || 'Invalid File Type',
        description: translations?.profile?.only_pdf_doc || 'Only PDF and DOC files are allowed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: translations?.profile?.file_too_large || 'File Too Large',
        description: translations?.profile?.max_5mb || 'Maximum file size is 5MB',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setResumeFile(file);
  };

  // Upload file to IPFS
  const uploadToIPFS = async (file) => {
    // This function would normally upload the file to IPFS
    // For now, we'll simulate it with a delay and return a mock IPFS hash
    return new Promise((resolve, reject) => {
      // In a real implementation, you would use the IPFS API to upload the file
      // For example, using ipfs-http-client or a service like Pinata
      
      // Simulate upload delay
      setTimeout(() => {
        // Generate a random IPFS hash for demo purposes
        const hash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        resolve(hash);
      }, 2000);
    });
  };

  // Handle upload
  const handleUpload = async () => {
    if (!connected) {
      toast({
        title: translations?.profile?.connect_wallet_required || 'Wallet Connection Required',
        description: translations?.profile?.connect_to_upload || 'You need to connect your wallet to upload your resume',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!resumeFile) {
      toast({
        title: translations?.profile?.no_file_selected || 'No File Selected',
        description: translations?.profile?.select_file || 'Please select a file to upload',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!resumeContract) {
      toast({
        title: translations?.profile?.contract_not_available || 'Contract Not Available',
        description: translations?.profile?.contract_not_initialized || 'Resume contract is not initialized',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 500);

    try {
      // 1. Upload the file to IPFS
      const ipfsHash = await uploadToIPFS(resumeFile);
      setUploadProgress(80);
      
      // 2. Call the smart contract to store the IPFS hash
      const tx = await resumeContract.uploadResume(ipfsHash, resumeFile.name);
      setUploadProgress(90);
      
      // 3. Wait for the transaction to be mined
      await tx.wait();
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // 4. Update the UI with the new resume data
      const newResumeData = {
        ipfsHash,
        timestamp: Date.now(),
        fileName: resumeFile.name,
      };
      
      setResumeData(newResumeData);
      setIsUploading(false);
      
      toast({
        title: translations?.profile?.resume_uploaded || 'Resume Uploaded',
        description: translations?.profile?.resume_uploaded_success || 'Your resume has been successfully uploaded to the blockchain',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      
      toast({
        title: translations?.profile?.error_uploading || 'Error Uploading Resume',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            {translations?.profile?.resume_management || 'Resume Management'}
          </Heading>
          
          <Text mb={8} color="gray.600">
            {translations?.profile?.resume_management_desc || 'Upload your resume to the blockchain to make it available to potential employers'}
          </Text>
          
          {resumeData ? (
            <Box mb={8}>
              <Alert
                status="success"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                borderRadius="md"
                p={6}
                mb={6}
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={2} fontSize="lg">
                  {translations?.profile?.resume_on_blockchain || 'Resume on Blockchain'}
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                  {translations?.profile?.resume_available || 'Your resume is available on the blockchain and can be viewed by potential employers.'}
                </AlertDescription>
              </Alert>
              
              <Box 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                borderColor="gray.200"
              >
                <Flex align="center" mb={4}>
                  <Icon as={FaFileAlt} boxSize={8} color="brand.500" mr={4} />
                  <Box>
                    <Text fontWeight="bold">{resumeData.fileName}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {translations?.profile?.uploaded_on || 'Uploaded on'}: {formatDate(resumeData.timestamp)}
                    </Text>
                  </Box>
                </Flex>
                
                <Divider mb={4} />
                
                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Link 
                    href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${resumeData.ipfsHash}`} 
                    isExternal
                    flex="1"
                  >
                    <Button 
                      leftIcon={<FaExternalLinkAlt />} 
                      colorScheme="blue" 
                      variant="outline"
                      width="full"
                    >
                      {translations?.profile?.view_on_ipfs || 'View on IPFS'}
                    </Button>
                  </Link>
                  
                  <Button 
                    leftIcon={<FaUpload />} 
                    colorScheme="brand"
                    onClick={() => fileInputRef.current?.click()}
                    flex="1"
                  >
                    {translations?.profile?.update_resume || 'Update Resume'}
                  </Button>
                </Flex>
              </Box>
            </Box>
          ) : (
            <Box mb={8}>
              <Alert
                status="info"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                borderRadius="md"
                p={6}
                mb={6}
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={2} fontSize="lg">
                  {translations?.profile?.no_resume_found || 'No Resume Found'}
                </AlertTitle>
                <AlertDescription maxWidth="sm">
                  {translations?.profile?.upload_resume_desc || 'Upload your resume to the blockchain to make it available to potential employers.'}
                </AlertDescription>
              </Alert>
            </Box>
          )}
          
          <Stack spacing={6}>
            <FormControl>
              <FormLabel>{translations?.profile?.select_resume || 'Select Resume File'}</FormLabel>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                display="none"
                ref={fileInputRef}
              />
              <Flex>
                <Button 
                  leftIcon={<FaUpload />} 
                  onClick={() => fileInputRef.current?.click()}
                  mr={4}
                >
                  {translations?.profile?.browse_files || 'Browse Files'}
                </Button>
                <Text alignSelf="center">
                  {resumeFile ? resumeFile.name : translations?.profile?.no_file_selected || 'No file selected'}
                </Text>
              </Flex>
              <Text fontSize="sm" color="gray.500" mt={2}>
                {translations?.profile?.allowed_formats || 'Allowed formats: PDF, DOC, DOCX. Max size: 5MB'}
              </Text>
            </FormControl>
            
            {isUploading && (
              <Box>
                <Text mb={2}>
                  {translations?.profile?.uploading || 'Uploading...'} {Math.round(uploadProgress)}%
                </Text>
                <Progress value={uploadProgress} size="sm" colorScheme="brand" borderRadius="full" />
              </Box>
            )}
            
            <Flex justify="flex-end" mt={4}>
              <Button 
                mr={4} 
                onClick={() => router.push('/profile')}
              >
                {translations?.common?.cancel || 'Cancel'}
              </Button>
              <Button 
                colorScheme="brand" 
                onClick={handleUpload}
                isLoading={isUploading}
                loadingText={translations?.profile?.uploading || 'Uploading'}
                isDisabled={!connected || !resumeFile}
              >
                {resumeData 
                  ? (translations?.profile?.update_resume || 'Update Resume')
                  : (translations?.profile?.upload_resume || 'Upload Resume')}
              </Button>
            </Flex>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ResumeUploadPage;
