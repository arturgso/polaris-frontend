import type { LoginRequest, LoginResponse, NewUserDTO, UserDTO } from '../types';
import { api } from './api';

export async function login(payload: LoginRequest) {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);

  return data;
}

export async function signup(payload: NewUserDTO) {
  const { data } = await api.post<UserDTO>('/auth/signup', payload);

  return data;
}
