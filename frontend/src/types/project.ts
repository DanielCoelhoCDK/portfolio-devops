export interface Project {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
    githubUrl?: string;
    demoUrl?: string;
    createdAt: string;
    technologies: string[];
}

export interface ProjectRequest {
    title: string;
    description: string;
    imageUrl?: string;
    githubUrl?: string;
    demoUrl?: string;
    technologies: string[];
}