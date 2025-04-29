import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useRouter } from 'next/router';

const Web3Context = createContext();

// Smart contract ABIs and addresses
import ResumeContractABI from '../contracts/ResumeContract.json';
import BountyContractABI from '../contracts/BountyContract.json';
import ContractAddresses from '../contracts/addresses.json';

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [resumeContract, setResumeContract] = useState(null);
  const [bountyContract, setBountyContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Initialize web3modal
  const getWeb3Modal = () => {
    const web3Modal = new Web3Modal({
      network: 'mumbai', // optional
      cacheProvider: true, // optional
      providerOptions: {}, // required
    });
    return web3Modal;
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const web3Modal = getWeb3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const { chainId } = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(account);
      setChainId(chainId);
      
      // Initialize contracts
      initializeContracts(provider, signer);
      
      // Setup event listeners
      connection.on('accountsChanged', handleAccountsChanged);
      connection.on('chainChanged', handleChainChanged);
      
      setIsConnecting(false);
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message);
      setIsConnecting(false);
      return false;
    }
  };

  // Initialize smart contracts
  const initializeContracts = (provider, signer) => {
    try {
      const resumeContractAddress = ContractAddresses.resumeContract;
      const bountyContractAddress = ContractAddresses.bountyContract;
      
      // Check if contract addresses are valid (not the zero address)
      const isValidAddress = (address) => {
        return address && address !== '0x0000000000000000000000000000000000000000';
      };
      
      if (isValidAddress(resumeContractAddress)) {
        const resumeContract = new ethers.Contract(
          resumeContractAddress,
          ResumeContractABI.abi,
          signer
        );
        setResumeContract(resumeContract);
        console.log('Resume contract initialized at:', resumeContractAddress);
      } else {
        console.warn('Resume contract address not set or invalid');
      }
      
      if (isValidAddress(bountyContractAddress)) {
        const bountyContract = new ethers.Contract(
          bountyContractAddress,
          BountyContractABI.abi,
          signer
        );
        setBountyContract(bountyContract);
        console.log('Bounty contract initialized at:', bountyContractAddress);
      } else {
        console.warn('Bounty contract address not set or invalid');
      }
    } catch (error) {
      console.error('Error initializing contracts:', error);
      setError(error.message);
    }
  };

  // Handle account change
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // User switched accounts
      setAccount(ethers.utils.getAddress(accounts[0]));
    }
  };

  // Handle chain change
  const handleChainChanged = (chainIdHex) => {
    // Force page refresh on chain change
    window.location.reload();
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      const web3Modal = getWeb3Modal();
      await web3Modal.clearCachedProvider();
      setProvider(null);
      setSigner(null);
      setAccount(null);
      setChainId(null);
      setResumeContract(null);
      setBountyContract(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError(error.message);
    }
  };

  // Check if connected to the correct network
  const isCorrectNetwork = () => {
    // Mumbai testnet chainId is 80001
    return chainId === 80001;
  };

  // Switch to the correct network
  const switchNetwork = async () => {
    try {
      if (!provider) return false;
      
      await provider.send('wallet_switchEthereumChain', [
        { chainId: '0x13881' }, // 80001 in hex
      ]);
      
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      setError(error.message);
      return false;
    }
  };

  // Auto connect if cached provider exists
  useEffect(() => {
    const autoConnect = async () => {
      const web3Modal = getWeb3Modal();
      if (web3Modal.cachedProvider) {
        await connectWallet();
      }
    };
    
    autoConnect();
    
    // Cleanup function
    return () => {
      if (provider?.provider?.removeListener) {
        provider.provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.provider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        resumeContract,
        bountyContract,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        isCorrectNetwork,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
