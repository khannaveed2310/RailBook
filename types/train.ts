export type TrainClassCode =
  | "1A"
  | "2A"
  | "3A"
  | "SL"
  | "CC"
  | "2S";

export type Quota =
  | "GENERAL"
  | "TATKAL"
  | "LADIES"
  | "SENIOR_CITIZEN";

export interface TrainClass {
  code: TrainClassCode;
  name: string;
  fare: number;
  available: number;
}

export interface TrainStop {
  station: string;
  code?: string;
  arrival: string;
  departure: string;
  halt?: string;
}

export interface Train {
  id: string;
  number: string;
  name: string;
  source: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  runsOn: string[];
  stops?: TrainStop[];
  classes: TrainClass[];
  createdById?: string;
}