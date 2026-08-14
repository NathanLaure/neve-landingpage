export interface TransitLeg {
  mode?: "train" | "rer" | "metro" | "tram" | "bus" | "walk" | string;
  lineName?: string;
  lineColor?: string;
  fromName?: string;
  toName?: string;
  durationMinutes?: number;
  walkType?: "access" | "transfer" | "egress" | string;
  departureTime?: string;
  arrivalTime?: string;
  direction?: string;
  intermediateStopsCount?: number;
  intermediateStops?: any[];
  [key: string]: any;
}

export interface AdventureTrainInfo {
  departureTime?: string;
  arrivalTime?: string;
  time?: string;
  departureStation?: string;
  arrivalStation?: string;
  trainNumber?: string;
  line?: string;
  mode?: "train" | "rer" | "metro" | "tram" | "bus" | "walk" | string;
  lineColor?: string;
  transfers?: number;
  transfersCount?: number;
  duration?: string;
  durationFormatted?: string;
  legs?: TransitLeg[];
  notes?: string;
  [key: string]: any;
}

export interface PassengerDetail {
  type?: string;
  age?: number | string;
  discount?: string;
  [key: string]: any;
}

export interface HikeSnapshot {
  title?: string;
  distance?: string | number;
  durationHours?: string | number;
  difficulty?: string;
  elevation?: string | number;
  imageUrl?: string;
  cover_image_url?: string;
  startStation?: string;
  endStation?: string;
  location?: string;
  location_name?: string;
  description?: string;
  geometry?: any;
  [key: string]: any;
}

export interface UserAdventure {
  id: string;
  share_token: string;
  outward_date: string;
  return_date?: string | null;
  departure_station_name: string;
  return_station_name?: string | null;
  outward_train?: AdventureTrainInfo | null;
  return_train?: AdventureTrainInfo | null;
  passengers_count?: string | null;
  passengers?: PassengerDetail[] | Record<string, any> | null;
  hike_snapshot?: HikeSnapshot | null;
  created_at?: string;
  user_id?: string;
}
