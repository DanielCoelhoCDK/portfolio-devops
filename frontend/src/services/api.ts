import axios from 'axios';
import type { Project, ProjectRequest } from '../types/project';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

export const getProjects = async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/projects');
    return response.data;
};

export const createProject = async (data: ProjectRequest): Promise<Project> => {
    const response = await api.post<Project>('/projects', data);
    return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
};

export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const res = await axios.get('http://localhost:8080/actuator/health');
        return res.status === 200 && res.data?.status === 'UP';
    } catch {
        return false;
    }
};

export default api;