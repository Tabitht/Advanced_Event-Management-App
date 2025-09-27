/**
 * @module src/types/event.types.ts
 * @description holds the types declaration for the event objects
 */

interface EventData {
  title: string;
  descripton?: string;
  category?: string;
  startAt: Date;
  endAt: Date;
  location: string;
  capacity?: number;
  isPublished?: boolean;
}

type UpdateEventData = Partial<EventData>;

export type { EventData, UpdateEventData };
