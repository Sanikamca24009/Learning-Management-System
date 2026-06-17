export interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  lessons: number;
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  enrollments: string;
  thumbnail: string;
  category: string;
  description: string;
  outcomes: string[];
  curriculum: { title: string; lessons: string[] }[];
  instructors: { name: string; role: string; avatar: string }[];
  progress?: number;
  price?: number;
}

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=80`;

export const courses: Course[] = [
  {
    id: "1",
    title: "Real World Projects on AI Agents",
    instructor: "Aarav Mehta",
    duration: "5 Hrs",
    lessons: 5,
    rating: 4.7,
    level: "Beginner",
    enrollments: "1645+",
    thumbnail: img("photo-1677442136019-21780ecad995"),
    category: "AI",
    description:
      "Build production-grade AI agents from scratch using LangChain, LangGraph and modern LLM tooling. Hands-on projects across automation, research and customer support.",
    outcomes: [
      "Design multi-step agent workflows",
      "Integrate tools and external APIs",
      "Evaluate and debug agent reasoning",
      "Deploy agents to production",
    ],
    curriculum: [
      { title: "Foundations", lessons: ["Agent architectures", "Prompt engineering"] },
      { title: "Building Agents", lessons: ["Tool calling", "Memory & state"] },
      { title: "Production", lessons: ["Evaluation", "Deployment"] },
    ],
    instructors: [
      { name: "Aarav Mehta", role: "Lead AI Engineer", avatar: img("photo-1535713875002-d1d0cf377fde") },
    ],
    progress: 65,
  },
  {
    id: "2",
    title: "Generative AI for Everyone",
    instructor: "Priya Sharma",
    duration: "8 Hrs",
    lessons: 12,
    rating: 4.8,
    level: "Beginner",
    enrollments: "8230+",
    thumbnail: img("photo-1620712943543-bcc4688e7485"),
    category: "GenAI",
    description: "An accessible journey through generative AI: text, images, audio and video models.",
    outcomes: ["Understand transformer basics", "Use ChatGPT effectively", "Generate images with diffusion", "Fine-tune small models"],
    curriculum: [
      { title: "Intro", lessons: ["What is GenAI", "History"] },
      { title: "Models", lessons: ["LLMs", "Diffusion"] },
    ],
    instructors: [{ name: "Priya Sharma", role: "AI Researcher", avatar: img("photo-1494790108377-be9c29b29330") }],
    progress: 30,
  },
  {
    id: "3",
    title: "Data Science Bootcamp",
    instructor: "Rohan Iyer",
    duration: "40 Hrs",
    lessons: 60,
    rating: 4.9,
    level: "Intermediate",
    enrollments: "12450+",
    thumbnail: img("photo-1551288049-bebda4e38f71"),
    category: "Data Science",
    description: "End-to-end data science: Python, statistics, ML, visualization, and capstone projects.",
    outcomes: ["Master pandas & numpy", "Build ML models", "Create dashboards", "Ship a portfolio project"],
    curriculum: [
      { title: "Python", lessons: ["Syntax", "Pandas"] },
      { title: "ML", lessons: ["Supervised", "Unsupervised"] },
    ],
    instructors: [{ name: "Rohan Iyer", role: "Sr. Data Scientist", avatar: img("photo-1500648767791-00dcc994a43e") }],
    progress: 80,
  },
  {
    id: "4",
    title: "Full Stack Web Development",
    instructor: "Neha Kapoor",
    duration: "60 Hrs",
    lessons: 85,
    rating: 4.6,
    level: "Intermediate",
    enrollments: "9870+",
    thumbnail: img("photo-1517180102446-f3ece451e9d8"),
    category: "Web Dev",
    description: "Build full stack apps with React, Node, Express and PostgreSQL.",
    outcomes: ["React & TypeScript", "REST + GraphQL APIs", "Auth & databases", "Deploy to cloud"],
    curriculum: [
      { title: "Frontend", lessons: ["React", "Tailwind"] },
      { title: "Backend", lessons: ["Node", "Postgres"] },
    ],
    instructors: [{ name: "Neha Kapoor", role: "Full Stack Lead", avatar: img("photo-1438761681033-6461ffad8d80") }],
  },
  {
    id: "5",
    title: "Deep Learning Specialization",
    instructor: "Karan Verma",
    duration: "30 Hrs",
    lessons: 45,
    rating: 4.9,
    level: "Advanced",
    enrollments: "6540+",
    thumbnail: img("photo-1488229297570-58520851e868"),
    category: "AI",
    description: "Master deep learning: CNNs, RNNs, transformers and modern architectures.",
    outcomes: ["Train CNNs", "Build transformers", "Fine-tune LLMs", "Optimize inference"],
    curriculum: [
      { title: "Networks", lessons: ["MLP", "CNN"] },
      { title: "Sequence", lessons: ["RNN", "Transformer"] },
    ],
    instructors: [{ name: "Karan Verma", role: "ML Researcher", avatar: img("photo-1463453091185-61582044d556") }],
  },
  {
    id: "6",
    title: "Cloud Computing with AWS",
    instructor: "Sneha Reddy",
    duration: "20 Hrs",
    lessons: 30,
    rating: 4.5,
    level: "Intermediate",
    enrollments: "4320+",
    thumbnail: img("photo-1451187580459-43490279c0fa"),
    category: "Cloud",
    description: "Deploy and scale applications on AWS with EC2, S3, Lambda and more.",
    outcomes: ["Architect cloud apps", "IAM & security", "Serverless basics", "CI/CD pipelines"],
    curriculum: [
      { title: "Core", lessons: ["EC2", "S3"] },
      { title: "Serverless", lessons: ["Lambda", "API Gateway"] },
    ],
    instructors: [{ name: "Sneha Reddy", role: "Cloud Architect", avatar: img("photo-1544005313-94ddf0286df2") }],
  },
  {
    id: "7",
    title: "Python for Data Analysis",
    instructor: "Vikram Singh",
    duration: "12 Hrs",
    lessons: 20,
    rating: 4.7,
    level: "Beginner",
    enrollments: "15670+",
    thumbnail: img("photo-1526379095098-d400fd0bf935"),
    category: "Data Science",
    description: "Use Python for serious data analysis with pandas, numpy and matplotlib.",
    outcomes: ["Pandas mastery", "Data cleaning", "Visualization", "Statistical analysis"],
    curriculum: [{ title: "Basics", lessons: ["Pandas", "Numpy"] }],
    instructors: [{ name: "Vikram Singh", role: "Data Analyst", avatar: img("photo-1472099645785-5658abf4ff4e") }],
  },
  {
    id: "8",
    title: "Machine Learning A-Z",
    instructor: "Ananya Desai",
    duration: "25 Hrs",
    lessons: 40,
    rating: 4.8,
    level: "Intermediate",
    enrollments: "11230+",
    thumbnail: img("photo-1555949963-aa79dcee981c"),
    category: "AI",
    description: "Comprehensive ML course covering all major algorithms with Python and R.",
    outcomes: ["Regression", "Classification", "Clustering", "Reinforcement learning"],
    curriculum: [{ title: "Supervised", lessons: ["Linear", "Trees"] }],
    instructors: [{ name: "Ananya Desai", role: "ML Engineer", avatar: img("photo-1573496359142-b8d87734a5a2") }],
  },
  {
    id: "9",
    title: "MLOps & Production AI",
    instructor: "Devan Kumar",
    duration: "18 Hrs",
    lessons: 28,
    rating: 4.6,
    level: "Advanced",
    enrollments: "3210+",
    thumbnail: img("photo-1518770660439-4636190af475"),
    category: "MLOps",
    description: "Productionize ML models with MLOps best practices, CI/CD and monitoring.",
    outcomes: ["Model versioning", "CI/CD for ML", "Monitoring", "A/B testing"],
    curriculum: [{ title: "Deploy", lessons: ["Docker", "Kubernetes"] }],
    instructors: [{ name: "Devan Kumar", role: "MLOps Lead", avatar: img("photo-1506794778202-cad84cf45f1d") }],
  },
];

export const learningPaths = [
  {
    id: "ai-engineer",
    title: "AI Engineer",
    description: "From Python basics to deploying AI agents in production.",
    duration: "6 months",
    courses: ["7", "8", "1", "9"],
    color: "orange",
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Master data analysis, ML, and visualization end-to-end.",
    duration: "8 months",
    courses: ["7", "3", "8", "5"],
    color: "teal",
  },
  {
    id: "fullstack",
    title: "Full Stack Developer",
    description: "Build modern web apps from frontend to deployment.",
    duration: "5 months",
    courses: ["4", "6"],
    color: "orange",
  },
  {
    id: "genai",
    title: "Generative AI Specialist",
    description: "Become an expert in generative AI models & applications.",
    duration: "4 months",
    courses: ["2", "5", "1"],
    color: "teal",
  },
];

export const mockUser = {
  name: "Harshith",
  email: "harshith@uptoskills.com",
  avatar: img("photo-1633332755192-727a05c4013d"),
  enrolledCourses: ["1", "2", "3"],
  completedCourses: 7,
  hoursLearned: 142,
  certificates: 5,
  streak: 14,
};
