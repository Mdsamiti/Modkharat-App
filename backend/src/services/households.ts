import * as householdsRepo from '../repositories/households.js';
import type { FamilyMemberDTO } from '../types/api.js';

const MEMBER_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export async function createHousehold(name: string, userId: string) {
  const household = await householdsRepo.createHousehold(name, userId);
  return { id: household.id, name: household.name };
}

export async function getHouseholds(userId: string) {
  const rows = await householdsRepo.findHouseholdsByUser(userId);
  return rows.map((h) => ({ id: h.id, name: h.name }));
}

export async function getMembers(householdId: string): Promise<FamilyMemberDTO[]> {
  const rows = await householdsRepo.findMembersByHousehold(householdId);
  return rows.map((m, i) => ({
    id: m.id,
    name: m.display_name || m.email?.split('@')[0] || 'Member',
    email: m.email ?? null,
    role: m.role,
    avatar: m.avatar_emoji || '👤',
    color: MEMBER_COLORS[i % MEMBER_COLORS.length],
    permissions: {
      viewOnly: m.view_only,
      canAddTransactions: m.can_add_transactions,
      canEditBudgets: m.can_edit_budgets,
      canManageMembers: m.can_manage_members,
    },
  }));
}

export async function updateMemberPermissions(
  householdId: string,
  memberId: string,
  permissions: { viewOnly?: boolean; canAddTransactions?: boolean; canEditBudgets?: boolean; canManageMembers?: boolean },
) {
  await householdsRepo.updateMemberPermissions(householdId, memberId, {
    view_only: permissions.viewOnly,
    can_add_transactions: permissions.canAddTransactions,
    can_edit_budgets: permissions.canEditBudgets,
    can_manage_members: permissions.canManageMembers,
  });
}

export async function removeMember(householdId: string, memberId: string) {
  await householdsRepo.removeMember(householdId, memberId);
}

export async function createInvite(householdId: string, invitedBy: string, email: string, role: 'organizer' | 'member') {
  return householdsRepo.createInvite(householdId, invitedBy, email, role);
}
