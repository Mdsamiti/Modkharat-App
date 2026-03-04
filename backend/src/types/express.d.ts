declare namespace Express {
  interface Request {
    userId?: string;
    householdId?: string;
    memberRole?: 'organizer' | 'member';
    permissions?: {
      viewOnly: boolean;
      canAddTransactions: boolean;
      canEditBudgets: boolean;
      canManageMembers: boolean;
    };
    traceId?: string;
  }
}
