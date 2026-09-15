export interface DetectedItem {
  component_type: string;
  quantity: number;
  condition: string;
  confidence: number;
}

export interface AIInspectionResult {
  category: 'NORMAL' | 'DISCREPANCY' | 'DAMAGED' | 'MISSING' | 'UNKNOWN';
  confidence: number;
  items: DetectedItem[];
}

export class AIInspectionService {
  /**
   * Mock AI Inspection. In production, this abstracts a real vendor (e.g., Google Cloud Vision, OpenAI).
   * It relies strictly on the filename to simulate test scenarios predictably.
   */
  static async inspect(filename: string): Promise<AIInspectionResult> {
    try {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 500));

      if (filename.includes('fail')) {
        throw new Error('AI Service Unavailable');
      }

      if (filename.includes('missing')) {
        return {
          category: 'MISSING',
          confidence: 0.95,
          items: [{ component_type: 'Raspberry Pi', quantity: 0, condition: 'MISSING', confidence: 0.99 }]
        };
      }
      
      if (filename.includes('damaged')) {
        return {
          category: 'DAMAGED',
          confidence: 0.85,
          items: [{ component_type: 'Breadboard', quantity: 1, condition: 'BURNT', confidence: 0.85 }]
        };
      }

      if (filename.includes('low-conf')) {
        return {
          category: 'NORMAL',
          confidence: 0.65, // < 0.70 = NEEDS_REVIEW
          items: [{ component_type: 'Resistor Pack', quantity: 1, condition: 'OK', confidence: 0.60 }]
        };
      }

      // Default normal
      return {
        category: 'NORMAL',
        confidence: 0.95,
        items: [
          { component_type: 'Raspberry Pi 4', quantity: 1, condition: 'GOOD', confidence: 0.96 }
        ]
      };
    } catch (error: unknown) {
      // Safe fallback as required by AI SAFETY guidelines
      return {
        category: 'UNKNOWN',
        confidence: 0.0,
        items: []
      };
    }
  }

  static getReviewAction(confidence: number, category: string): 'AUTO_APPROVE' | 'REVIEW_RECOMMENDED' | 'NEEDS_REVIEW' {
    if (category !== 'NORMAL') return 'NEEDS_REVIEW'; // Discrepancies/damages always need review
    if (confidence < 0.70) return 'NEEDS_REVIEW';
    if (confidence < 0.90) return 'REVIEW_RECOMMENDED';
    return 'AUTO_APPROVE';
  }
}
