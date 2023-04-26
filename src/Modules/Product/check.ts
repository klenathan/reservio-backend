// Define the Order type with startTime and endTime properties
type Order = {
  startTime: Date;
  endTime: Date;
};

/**
    Calculates the maximum number of orders that overlap with a given datetime.
    @param orders Array of orders to check
    @param datetime The datetime to check
    @returns The maximum number of overlapping orders
*/

function calculateMaxOrdersAtDatetime(orders: Order[], datetime: Date): number {
  let max_orders: number = 0;
  let current_orders: number = 0;

  // Loop through each order and check if the datetime falls within the order timeframe
  for (const order of orders) {
    if (datetime >= order.startTime && datetime <= order.endTime) {
      current_orders++;
      if (current_orders > max_orders) {
        max_orders = current_orders;
      }
    } else if (datetime < order.startTime) {
      // Stop checking orders if the current order start time is after the datetime
      break;
    }
  }
  return max_orders;
}
