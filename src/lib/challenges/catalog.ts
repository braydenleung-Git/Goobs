export type ChallengeSlug = "change-prompt" | "code-writer" | "multi-tool"
export type WorkstationId = "computer" | "drawing-tablet" | "whiteboard" | "book"

export interface ChallengeDefinition {
  slug: ChallengeSlug
  name: string
  description: string
  xpReward: number
  workstationTarget: WorkstationId
  requiresImageCapableModel: boolean
  systemPromptTemplate: string
  userPromptTemplate: string
  deterministicRules: {
    minOutputLength?: number
    mustContainKeywords?: string[]
    mustNotContainKeywords?: string[]
  }
}

const CHALLENGES: ChallengeDefinition[] = [
  {
    slug: "change-prompt",
    name: "Change Prompt",
    description: "Modify the agent's system prompt and observe how its behavior changes.",
    xpReward: 40,
    workstationTarget: "whiteboard",
    requiresImageCapableModel: false,
    systemPromptTemplate:
      "You are an assistant that completes the user's task directly and concisely.",
    userPromptTemplate:
      "Write a short poem about artificial intelligence. Keep it under 100 words.",
    deterministicRules: {
      minOutputLength: 20,
      mustContainKeywords: ["intelligence" , "learn", "code"],
      mustNotContainKeywords: [],
    },
  },
  {
    slug: "code-writer",
    name: "Code Writer",
    description:
      "The agent writes a working Python function based on a specification.",
    xpReward: 100,
    workstationTarget: "computer",
    requiresImageCapableModel: false,
    systemPromptTemplate:
      "You are a skilled Python developer. Write clean, correct, well-documented code. Only output the function definition.",
    userPromptTemplate:
      "Write a Python function called `fibonacci(n)` that returns the nth Fibonacci number. Use an iterative approach. Include a docstring.",
    deterministicRules: {
      minOutputLength: 50,
      mustContainKeywords: ["def fibonacci", "return"],
      mustNotContainKeywords: [],
    },
  },
  {
    slug: "multi-tool",
    name: "Multi-Tool",
    description:
      "The agent uses multiple tools in sequence: plan on a whiteboard, then implement at the computer.",
    xpReward: 200,
    workstationTarget: "computer",
    requiresImageCapableModel: false,
    systemPromptTemplate:
      "You are a full-stack developer. First outline your approach, then implement the solution. Be thorough.",
    userPromptTemplate:
      "Design and implement a simple REST API endpoint in Python using FastAPI. The endpoint should accept a GET request at /items and return a JSON array of items.",
    deterministicRules: {
      minOutputLength: 100,
      mustContainKeywords: ["def ", "return"],
      mustNotContainKeywords: [],
    },
  },
]

export function getChallengeBySlug(slug: ChallengeSlug): ChallengeDefinition | undefined {
  return CHALLENGES.find((c) => c.slug === slug)
}

export function listChallenges(): ChallengeDefinition[] {
  return CHALLENGES
}
