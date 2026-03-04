import { get } from './client';

interface CategoryDTO {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

interface AccountDTO {
  id: string;
  nameEn: string;
  nameAr: string;
}

export async function listCategories() {
  return get<{ data: CategoryDTO[] }>('/v1/categories');
}

export async function listAccounts() {
  return get<{ data: AccountDTO[] }>('/v1/accounts');
}
