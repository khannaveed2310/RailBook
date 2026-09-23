export type Gender = "MALE" | "FEMALE" | "OTHER";

export type BerthPreference =
  | "LOWER"
  | "MIDDLE"
  | "UPPER"
  | "SIDE_LOWER"
  | "SIDE_UPPER"
  | "NO_PREFERENCE";

export interface Passenger {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  berthPreference: BerthPreference;
}