/**
 * @module src/types/organizer.types.ts
 * @description holds the types declaration for the organizer objects
 */

interface OrganizerData {
  name: string;
  slug: string;
  bio?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

type UpdateOrganizerData = Partial<OrganizerData>;

export type { OrganizerData, UpdateOrganizerData };
