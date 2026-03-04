import { get, post, patch, del } from './client';
import type { Goal } from '@/types/models';

interface GoalListResponse {
  data: Goal[];
}

interface GoalResponse {
  data: Goal;
}

interface GoalContribution {
  date: string;
  amount: number;
  balance: number;
}

interface GoalProjectionPoint {
  month: string;
  actual: number | null;
  projected: number;
}

export async function listGoals() {
  return get<GoalListResponse>('/v1/goals');
}

export async function getGoal(id: string) {
  return get<GoalResponse>(`/v1/goals/${id}`);
}

export async function createGoal(input: {
  name: string;
  target: number;
  targetDate?: string;
  monthlyContribution?: number;
  icon?: string;
  accountId?: string;
}) {
  return post<GoalResponse>('/v1/goals', input);
}

export async function updateGoal(id: string, fields: Partial<{
  name: string;
  target: number;
  saved: number;
  targetDate: string | null;
  monthlyContribution: number;
  icon: string;
  accountId: string | null;
}>) {
  return patch<GoalResponse>(`/v1/goals/${id}`, fields);
}

export async function deleteGoal(id: string) {
  return del(`/v1/goals/${id}`);
}

export async function addContribution(goalId: string, amount: number) {
  return post<{ data: { success: boolean } }>(`/v1/goals/${goalId}/contributions`, { amount });
}

export async function getContributions(goalId: string) {
  return get<{ data: GoalContribution[] }>(`/v1/goals/${goalId}/contributions`);
}

export async function getProjection(goalId: string) {
  return get<{ data: GoalProjectionPoint[] }>(`/v1/goals/${goalId}/projection`);
}
