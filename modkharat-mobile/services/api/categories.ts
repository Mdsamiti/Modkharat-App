import { get, post, patch, del } from './client';

interface CategoryDTO {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

export interface AccountDTO {
  id: string;
  nameEn: string;
  nameAr: string;
  balance: number;
}

export async function listCategories() {
  return get<{ data: CategoryDTO[] }>('/v1/categories');
}

export async function listAccounts() {
  return get<{ data: AccountDTO[] }>('/v1/accounts');
}

export async function createAccount(nameEn: string, nameAr: string, balance: number = 0) {
  return post<{ data: AccountDTO }>('/v1/accounts', { nameEn, nameAr, balance });
}

export async function updateAccount(id: string, nameEn: string, nameAr: string, balance?: number) {
  const body: any = { nameEn, nameAr };
  if (balance !== undefined) body.balance = balance;
  return patch<{ data: AccountDTO }>(`/v1/accounts/${id}`, body);
}

export async function deleteAccount(id: string) {
  return del(`/v1/accounts/${id}`);
}
