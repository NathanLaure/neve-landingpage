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

/**
 * L'aventure est-elle un aller simple ?
 *
 * Le drapeau `is_one_way` fait foi, mais il n'existe que depuis l'ajout de la
 * colonne : les aventures enregistrées avant portent `false` sans que cela veuille
 * dire qu'un retour a été choisi. Elles se reconnaissent à leurs deux trajets
 * identiques — l'app recopiait l'aller faute de retour, et un vrai aller-retour
 * n'a jamais deux fois le même identifiant d'itinéraire.
 *
 * Règle reprise telle quelle de l'app (`isOneWayAdventure`) : les deux surfaces
 * lisent la même ligne en base, elles ne peuvent pas en tirer des récits
 * différents.
 */
export function isOneWayAdventure(adventure: UserAdventure): boolean {
  if (adventure.is_one_way) return true;
  const outwardId = adventure.outward_train?.id;
  return !!outwardId && outwardId === adventure.return_train?.id;
}

export interface UserAdventure {
  id: string;
  share_token: string;
  outward_date: string;
  return_date?: string | null;
  departure_station_name: string;
  return_station_name?: string | null;
  outward_train?: AdventureTrainInfo | null;
  /**
   * Sur un aller simple, ce trajet n'est qu'une recopie de l'aller : le modèle en
   * exige un. C'est `is_one_way` qui dit s'il a été réellement planifié — passer
   * par `isOneWayAdventure`.
   */
  return_train?: AdventureTrainInfo | null;
  is_one_way?: boolean | null;
  passengers_count?: string | null;
  passengers?: PassengerDetail[] | Record<string, any> | null;
  hike_snapshot?: HikeSnapshot | null;
  created_at?: string;
  user_id?: string;
}
