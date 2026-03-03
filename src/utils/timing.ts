/**
 * Timing Utilities
 * Performance tracking and measurement
 */

export class Timer {
  private startTime: number;
  private marks: Map<string, number> = new Map();

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Mark a point in time
   */
  mark(label: string): void {
    this.marks.set(label, Date.now());
  }

  /**
   * Get elapsed time since start
   */
  elapsed(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get time between two marks
   */
  between(startLabel: string, endLabel: string): number | null {
    const start = this.marks.get(startLabel);
    const end = this.marks.get(endLabel);

    if (start === undefined || end === undefined) {
      return null;
    }

    return end - start;
  }

  /**
   * Get time from start to mark
   */
  fromStart(label: string): number | null {
    const mark = this.marks.get(label);
    if (mark === undefined) {
      return null;
    }
    return mark - this.startTime;
  }

  /**
   * Format milliseconds as human-readable string
   */
  static format(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Get all marks
   */
  getMarks(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [label, time] of this.marks.entries()) {
      result[label] = time - this.startTime;
    }
    return result;
  }

  /**
   * Reset timer
   */
  reset(): void {
    this.startTime = Date.now();
    this.marks.clear();
  }
}

export function createTimer(): Timer {
  return new Timer();
}

/**
 * Measure function execution time
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  return { result, duration };
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms: number): string {
  return Timer.format(ms);
}
