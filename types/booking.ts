import type { Passenger } from "./passenger";
import type { Quota, TrainClassCode } from "./train";

export type BookingStatus =
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface BookingSelection {
  trainId: string;
  journeyDate: string;
  travelClass: TrainClassCode;
  quota: Quota;
  fare: number;
}

export interface Booking {
  id: string;
  pnr: string;

  trainId: string;
  trainNumber: string;
  trainName: string;

  source: string;
  destination: string;

  // Added for booking history
  departure: string;
  arrival: string;
  duration: string;

  journeyDate: string;

  travelClass: TrainClassCode;
  quota: Quota;

  passengers: Passenger[];

  baseFare: number;
  reservationFee: number;
  gst: number;
  totalAmount: number;

  status: BookingStatus;

  coach?: string;
  seats?: string[];

  createdAt: string;
}