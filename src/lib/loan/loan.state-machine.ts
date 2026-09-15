export type LoanState = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'READY_FOR_PICKUP' 
  | 'BORROWED' 
  | 'OVERDUE' 
  | 'RETURN_REQUIRES_INSPECTION' 
  | 'RETURNED';

export type Role = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';

export const VALID_TRANSITIONS: Record<LoanState, LoanState[]> = {
  PENDING: ['APPROVED'],
  APPROVED: ['READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['BORROWED'],
  BORROWED: ['RETURNED', 'OVERDUE', 'RETURN_REQUIRES_INSPECTION'],
  OVERDUE: ['RETURNED'],
  RETURN_REQUIRES_INSPECTION: ['RETURNED'],
  RETURNED: []
};

export class LoanStateMachine {
  static canTransition(currentState: LoanState, nextState: LoanState, role: Role): boolean {
    if (currentState === nextState) {
      return true; // Idempotent operations allowed
    }
    
    // Check if transition edge is valid
    if (!VALID_TRANSITIONS[currentState]?.includes(nextState)) {
      return false;
    }
    
    // Only admins can change states (for the specified transitions in the prompt)
    if (role === 'STUDENT') {
      return false; 
    }
    
    return true;
  }

  static validateTransition(currentState: LoanState, nextState: LoanState, role: Role) {
    if (!this.canTransition(currentState, nextState, role)) {
      throw new Error(`Invalid state transition from ${currentState} to ${nextState} for role ${role}`);
    }
  }
}
