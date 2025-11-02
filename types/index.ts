export interface LoginFormData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: number;
  status?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

export interface IdeaFormData {
  title: string;
  description: string;
  tags: string[];
}
