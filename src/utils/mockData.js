// 模拟数据用于前端开发

export const mockJobs = [
  {
    id: '1',
    title: 'Senior Solidity Developer',
    company: {
      name: 'DeFi Protocol',
      logo: 'https://avatars.dicebear.com/api/identicon/defiprotocol.svg'
    },
    location: '远程',
    salary: '$120k - $150k',
    skills: ['SOLIDITY', 'ETHEREUM', 'DEFI'],
    remote: true,
    createdAt: '2023-04-15T00:00:00Z',
    featured: true
  },
  {
    id: '2',
    title: 'Blockchain Frontend Engineer',
    company: {
      name: 'NFT Marketplace',
      logo: 'https://avatars.dicebear.com/api/identicon/nftmarketplace.svg'
    },
    location: 'San Francisco, CA',
    salary: '$100k - $130k',
    skills: ['REACT', 'WEB3.JS', 'TYPESCRIPT'],
    remote: false,
    createdAt: '2023-04-10T00:00:00Z',
    featured: true
  },
  {
    id: '3',
    title: 'Smart Contract Auditor',
    company: {
      name: 'Security DAO',
      logo: 'https://avatars.dicebear.com/api/identicon/securitydao.svg'
    },
    location: '远程',
    salary: '$130k - $160k',
    skills: ['SOLIDITY', 'SECURITY', 'AUDITING'],
    remote: true,
    createdAt: '2023-04-15T00:00:00Z',
    featured: true
  },
  {
    id: '4',
    title: 'Blockchain Protocol Engineer',
    company: {
      name: 'Layer 2 Solution',
      logo: 'https://avatars.dicebear.com/api/identicon/layer2.svg'
    },
    location: '远程',
    salary: '$140k - $180k',
    skills: ['RUST', 'CONSENSUS', 'CRYPTOGRAPHY'],
    remote: true,
    createdAt: '2023-04-08T00:00:00Z',
    featured: false
  },
  {
    id: '5',
    title: 'Web3 Product Manager',
    company: {
      name: 'Crypto Exchange',
      logo: 'https://avatars.dicebear.com/api/identicon/cryptoexchange.svg'
    },
    location: '远程',
    salary: '$110k - $140k',
    skills: ['PRODUCT', 'BLOCKCHAIN', 'AGILE'],
    remote: true,
    createdAt: '2023-04-05T00:00:00Z',
    featured: false
  },
  {
    id: '6',
    title: 'Blockchain Research Scientist',
    company: {
      name: 'Research Foundation',
      logo: 'https://avatars.dicebear.com/api/identicon/research.svg'
    },
    location: '远程',
    salary: '$120k - $160k',
    skills: ['RESEARCH', 'CRYPTOGRAPHY', 'CONSENSUS'],
    remote: true,
    createdAt: '2023-04-01T00:00:00Z',
    featured: false
  }
];

export const mockTasks = [
  {
    id: '1',
    title: 'Create a DApp Landing Page',
    employer: {
      name: 'Web3 Startup',
      profileImage: 'https://avatars.dicebear.com/api/identicon/web3startup.svg'
    },
    reward: 2000,
    rewardToken: 'USDT',
    deadline: '2023-06-30T00:00:00Z',
    status: 'Open',
    createdAt: '2023-04-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Develop NFT Minting Function',
    employer: {
      name: 'Art Collective',
      profileImage: 'https://avatars.dicebear.com/api/identicon/artcollective.svg'
    },
    reward: 1500,
    rewardToken: 'ETH',
    deadline: '2023-07-15T00:00:00Z',
    status: 'Open',
    createdAt: '2023-04-10T00:00:00Z'
  },
  {
    id: '3',
    title: 'Smart Contract Testing',
    employer: {
      name: 'DeFi Protocol',
      profileImage: 'https://avatars.dicebear.com/api/identicon/defiprotocol.svg'
    },
    reward: 3000,
    rewardToken: 'USDT',
    deadline: '2023-07-05T00:00:00Z',
    status: 'Open',
    createdAt: '2023-04-05T00:00:00Z'
  }
];

export const mockUsers = [
  {
    id: '1',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'developer',
    skills: ['Solidity', 'React', 'Web3.js', 'Node.js'],
    resumeIpfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    bio: 'Experienced blockchain developer with 5+ years of experience in Ethereum and Solidity development.',
    profileImage: 'https://avatars.dicebear.com/api/identicon/johndoe.svg',
    socialLinks: {
      github: 'https://github.com/johndoe',
      twitter: 'https://twitter.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      website: 'https://johndoe.com'
    },
    createdAt: '2023-01-01T00:00:00Z'
  }
];

export const mockTaskDetails = {
  id: '1',
  title: 'Create a DApp Landing Page',
  description: 'We are looking for a talented frontend developer to create a landing page for our new DApp. The landing page should be responsive, modern, and optimized for performance. It should include sections for features, team, roadmap, and contact information.',
  reward: 2000,
  rewardToken: 'USDT',
  deadline: '2023-06-30T00:00:00Z',
  status: 'Open',
  createdAt: '2023-04-15T00:00:00Z',
  employer: {
    id: '1',
    name: 'Web3 Startup',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    profileImage: 'https://avatars.dicebear.com/api/identicon/web3startup.svg'
  },
  requirements: [
    'Experience with React or Vue.js',
    'Knowledge of Web3 concepts',
    'Strong UI/UX skills',
    'Ability to integrate with smart contracts'
  ],
  deliverables: [
    'Responsive landing page',
    'Source code',
    'Documentation',
    'Deployment instructions'
  ]
};

export const mockJobDetails = {
  id: '1',
  title: 'Senior Solidity Developer',
  description: 'We are seeking an experienced Solidity developer to join our team and help build the next generation of DeFi protocols. The ideal candidate will have a strong background in smart contract development, security best practices, and experience with DeFi protocols.',
  company: {
    name: 'DeFi Protocol',
    logo: 'https://avatars.dicebear.com/api/identicon/defiprotocol.svg',
    description: 'We are a leading DeFi protocol focused on providing innovative financial solutions on the blockchain.',
    website: 'https://defiprotocol.example',
    location: '远程',
    size: '10-50 employees'
  },
  location: '远程',
  salary: '$120k - $150k',
  skills: ['SOLIDITY', 'ETHEREUM', 'DEFI', 'SMART CONTRACTS', 'SECURITY'],
  remote: true,
  type: 'Full-time',
  experience: '3-5 years',
  responsibilities: [
    'Design and implement smart contracts for our DeFi protocol',
    'Conduct code reviews and ensure security best practices',
    'Collaborate with the frontend team to integrate smart contracts',
    'Stay up-to-date with the latest developments in the blockchain space',
    'Participate in security audits and fix vulnerabilities'
  ],
  requirements: [
    'Strong experience with Solidity and Ethereum',
    'Understanding of DeFi concepts and protocols',
    'Experience with testing frameworks like Hardhat, Truffle, or Foundry',
    'Knowledge of security best practices for smart contracts',
    'Familiarity with frontend technologies like React and Web3.js'
  ],
  benefits: [
    'Competitive salary and equity',
    'Flexible working hours',
    'Remote-first culture',
    'Professional development budget',
    'Health insurance'
  ],
  createdAt: '2023-04-15T00:00:00Z',
  featured: true
};
