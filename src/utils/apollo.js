import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { SchemaLink } from '@apollo/client/link/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { mockJobs, mockTasks, mockUsers, mockTaskDetails, mockJobDetails } from './mockData';

// 定义GraphQL模式
const typeDefs = `
  type Company {
    id: ID
    name: String
    logo: String
    description: String
    website: String
    location: String
    size: String
  }

  type Employer {
    id: ID
    name: String
    walletAddress: String
    profileImage: String
  }

  type SocialLinks {
    github: String
    twitter: String
    linkedin: String
    website: String
  }

  type User {
    id: ID
    walletAddress: String
    email: String
    name: String
    role: String
    skills: [String]
    resumeIpfsHash: String
    bio: String
    profileImage: String
    socialLinks: SocialLinks
    createdAt: String
  }

  type Job {
    id: ID!
    title: String
    description: String
    company: Company
    location: String
    salary: String
    skills: [String]
    remote: Boolean
    type: String
    experience: String
    responsibilities: [String]
    requirements: [String]
    benefits: [String]
    createdAt: String
    featured: Boolean
  }

  type Task {
    id: ID!
    title: String
    description: String
    employer: Employer
    reward: Int
    rewardToken: String
    deadline: String
    status: String
    createdAt: String
    requirements: [String]
    deliverables: [String]
  }

  type Query {
    jobs(limit: Int, featured: Boolean): [Job]
    job(id: ID!): Job
    tasks(limit: Int, orderBy: String, orderDirection: String): [Task]
    task(id: ID!): Task
    user(walletAddress: String!): User
  }

  type Mutation {
    updateUser(input: UserInput!): User
    uploadResume(ipfsHash: String!): User
    aiMatch(skills: [String!]!, experience: Int!, jobType: String!, remote: Boolean): [Job]
  }

  input UserInput {
    name: String
    email: String
    skills: [String]
    bio: String
    profileImage: String
    socialLinks: SocialLinksInput
  }

  input SocialLinksInput {
    github: String
    twitter: String
    linkedin: String
    website: String
  }
`;

// 创建可执行模式
const schema = makeExecutableSchema({ typeDefs });

// 添加模拟解析器
const mockedSchema = addMocksToSchema({
  schema,
  mocks: {
    Query: () => ({
      jobs: (_, { limit, featured }) => {
        let filteredJobs = [...mockJobs];
        if (featured !== undefined) {
          filteredJobs = filteredJobs.filter(job => job.featured === featured);
        }
        return filteredJobs.slice(0, limit || filteredJobs.length);
      },
      job: (_, { id }) => mockJobDetails,
      tasks: (_, { limit, orderBy, orderDirection }) => {
        let filteredTasks = [...mockTasks];
        if (orderBy === 'createdAt') {
          filteredTasks.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return orderDirection === 'desc' ? dateB - dateA : dateA - dateB;
          });
        }
        return filteredTasks.slice(0, limit || filteredTasks.length);
      },
      task: (_, { id }) => mockTaskDetails,
      user: (_, { walletAddress }) => mockUsers[0]
    }),
    Mutation: () => ({
      updateUser: (_, { input }) => ({
        ...mockUsers[0],
        ...input
      }),
      uploadResume: (_, { ipfsHash }) => ({
        ...mockUsers[0],
        resumeIpfsHash: ipfsHash
      }),
      aiMatch: (_, { skills, experience, jobType, remote }) => {
        // 根据技能匹配工作
        return mockJobs.map(job => ({
          ...job,
          matchScore: Math.floor(Math.random() * 30) + 70 // 70-100之间的随机分数
        }));
      }
    })
  },
  preserveResolvers: false,
});

// 创建SchemaLink
const schemaLink = new SchemaLink({ schema: mockedSchema });

// 创建http链接（用于生产环境）
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'https://www.web3hire.xyz/api/graphql',
});

// 添加认证到请求
const authLink = setContext((_, { headers }) => {
  // 从本地存储获取认证令牌（如果存在）
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // 返回头部到上下文，以便httpLink可以读取它们
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// 创建Apollo客户端
export const client = new ApolloClient({
  // 使用真实API而不是模拟数据
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          jobs: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          tasks: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
      Job: {
        merge: true,
      },
      Task: {
        merge: true,
      },
      User: {
        merge: true,
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
  },
});
