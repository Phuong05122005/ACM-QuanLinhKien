export class LoanPolicy {
  // Normally loaded from system_configs, but we'll default per prompt
  static MAX_COMPONENT_TYPES = 5;
  static MIN_DURATION_DAYS = 1;
  static MAX_DURATION_DAYS = 7;

  static validateComponentLimit(itemCount: number) {
    if (itemCount === 0) {
      throw new Error('Loan must contain at least one item');
    }
    if (itemCount > this.MAX_COMPONENT_TYPES) {
      throw new Error(`Loan exceeds maximum allowed component types (${this.MAX_COMPONENT_TYPES})`);
    }
  }

  static validateDuration(startDate: Date, returnDate: Date) {
    const diffTime = Math.abs(returnDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < this.MIN_DURATION_DAYS) {
      throw new Error(`Loan duration must be at least ${this.MIN_DURATION_DAYS} day(s)`);
    }
    if (diffDays > this.MAX_DURATION_DAYS) {
      throw new Error(`Loan duration cannot exceed ${this.MAX_DURATION_DAYS} days`);
    }
    if (returnDate < startDate) {
      throw new Error('Return date cannot be in the past');
    }
  }
}
