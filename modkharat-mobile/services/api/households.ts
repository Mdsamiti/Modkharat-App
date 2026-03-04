import { get, post, patch, del } from './client';
import type { FamilyMember } from '@/types/models';

interface HouseholdListResponse {
  data: { id: string; name: string; createdBy: string }[];
}

interface MemberListResponse {
  data: FamilyMember[];
}

export async function listHouseholds() {
  return get<HouseholdListResponse>('/v1/households');
}

export async function createHousehold(name: string) {
  return post<{ data: { id: string; name: string } }>('/v1/households', { name });
}

export async function getMembers(householdId: string) {
  return get<MemberListResponse>(`/v1/households/${householdId}/members`);
}

export async function updateMemberPermissions(
  householdId: string,
  memberId: string,
  permissions: Partial<{
    viewOnly: boolean;
    canAddTransactions: boolean;
    canEditBudgets: boolean;
    canManageMembers: boolean;
  }>,
) {
  return patch(`/v1/households/${householdId}/members/${memberId}`, permissions);
}

export async function removeMember(householdId: string, memberId: string) {
  return del(`/v1/households/${householdId}/members/${memberId}`);
}

export async function inviteMember(householdId: string, email: string, role: 'organizer' | 'member' = 'member') {
  return post(`/v1/households/${householdId}/invites`, { email, role });
}
