import { create } from 'ipfs-http-client';

let ipfsClient = null;

/**
 * Initialize IPFS client with Infura credentials
 */
export const initIPFS = () => {
  try {
    const projectId = process.env.NEXT_PUBLIC_IPFS_API_KEY;
    const projectSecret = process.env.NEXT_PUBLIC_IPFS_API_SECRET;
    
    if (!projectId || !projectSecret) {
      console.error('IPFS credentials not found in environment variables');
      return null;
    }
    
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
    
    ipfsClient = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth
      }
    });
    
    return ipfsClient;
  } catch (error) {
    console.error('Error initializing IPFS client:', error);
    return null;
  }
};

/**
 * Upload file to IPFS
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export const uploadToIPFS = async (file) => {
  try {
    if (!ipfsClient) {
      ipfsClient = initIPFS();
      if (!ipfsClient) {
        throw new Error('Failed to initialize IPFS client');
      }
    }
    
    // Create a buffer from the file
    const buffer = await file.arrayBuffer();
    const result = await ipfsClient.add(buffer);
    
    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

/**
 * Get IPFS gateway URL for a given CID
 * @param {string} cid - IPFS content identifier
 * @returns {string} - Gateway URL
 */
export const getIPFSGatewayUrl = (cid) => {
  if (!cid) return '';
  return `https://ipfs.io/ipfs/${cid}`;
};
