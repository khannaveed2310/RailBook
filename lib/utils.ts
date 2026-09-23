export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
}

export function generatePNR(): string {
  return Math.floor(
    1000000000 + Math.random() * 9000000000
  ).toString();
}

export function calculateFare(
  baseFarePerPassenger: number,
  passengerCount: number
) {
  const baseFare =
    baseFarePerPassenger * passengerCount;

  const reservationFee = 40 * passengerCount;

  const gst = Math.round(
    (baseFare + reservationFee) * 0.05
  );

  const totalAmount =
    baseFare +
    reservationFee +
    gst;

  return {
    baseFare,
    reservationFee,
    gst,
    totalAmount,
  };
}