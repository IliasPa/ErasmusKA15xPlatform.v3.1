export interface Project {
  id: string;
  title: string;
  type: 'KA151' | 'KA152' | 'KA153' | 'KA154' | 'KA155';
  description: string;
  destinationCountry: string;
  city: string;
  startDate: string;
  endDate: string;
  year: number;
  ngoName: string;
  ngoCountry: string;
  eligibleCountries: string[];
  topics: string[];
  ageRange: string;
  participantSpots: number;
  infoPack: string;
  applicationFormUrl: string;
  applicationFormUrls?: Record<string, string>;
  coverImage: string;
  createdAt: string;
}

export interface FilterState {
  year: number | null;
  destinationCountry: string | null;
  residenceCountry: string | null;
  type: string | null;
  search: string;
}

export const PROJECT_TYPES: Record<string, string> = {
  KA151: 'Youth Exchange',
  KA152: 'Youth Worker Mobility',
  KA153: 'Youth Participation',
  KA154: 'DiscoverEU Inclusion',
  KA155: 'Youth Policy Dialogue',
};
