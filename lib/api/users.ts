import { request } from './client';
import { User } from './auth';

export const usersApi = {
  getProfile: (userId: string) => request<User>(`/users/${userId}`, { method: 'GET' }),
};
