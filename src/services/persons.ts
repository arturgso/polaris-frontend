import { api } from '@/services/api';
import type { NewPersonDTO, Person, UpdatePersonDTO } from '@/types';

export async function getPersons() {
  const { data } = await api.get<Person[]>('/persons');

  return data;
}

export async function getPerson(personId: number) {
  const { data } = await api.get<Person>(`/persons/${personId}`);

  return data;
}

export async function createPerson(payload: NewPersonDTO) {
  const { data } = await api.post<Person>('/persons', payload);

  return data;
}

export async function updatePerson(personId: number, payload: UpdatePersonDTO) {
  await api.patch(`/persons/${personId}`, payload);
}

export async function deletePerson(personId: number) {
  await api.delete(`/persons/${personId}`);
}
