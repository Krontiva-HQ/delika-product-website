/**
 * Calculate the distance between two points using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calculate delivery price based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {number} Delivery price
 */
export function calculateDeliveryPrice(distance) {
  // Base price for first 5km
  const basePrice = 10;
  // Additional price per km after 5km
  const pricePerKm = 2;
  
  if (distance <= 5) {
    return basePrice;
  }
  
  return basePrice + ((distance - 5) * pricePerKm);
}

/**
 * Format order data for submission
 * @param {Object} orderData - Raw order data
 * @returns {Object} Formatted order data
 */
export function formatOrderData(orderData) {
  const {
    restaurantId,
    branchId,
    products,
    pickup,
    dropOff,
    customerName,
    customerPhoneNumber,
    orderComment,
    customerId,
    payNow,
    payLater
  } = orderData;

  // Calculate delivery distance
  const distance = calculateDistance(
    pickup[0].fromLatitude,
    pickup[0].fromLongitude,
    dropOff[0].toLatitude,
    dropOff[0].toLongitude
  );

  // Calculate delivery price
  const deliveryPrice = calculateDeliveryPrice(distance);

  // Calculate order price (subtotal)
  const orderPrice = products.reduce((total, product) => {
    return total + (parseFloat(product.price) * product.quantity);
  }, 0);

  // Calculate total price
  const totalPrice = orderPrice + deliveryPrice;

  return {
    restaurantId,
    branchId,
    products,
    pickup,
    dropOff,
    customerName,
    customerPhoneNumber,
    deliveryPrice: deliveryPrice.toString(),
    totalPrice: totalPrice.toString(),
    deliveryDistance: distance.toString(),
    orderStatus: "ReadyForPickup",
    orderDate: new Date().toISOString(),
    orderPrice: orderPrice.toString(),
    pickupName: pickup[0].fromAddress,
    dropoffName: dropOff[0].toAddress,
    foodAndDeliveryFee: true,
    payNow,
    payLater,
    paymentStatus: payNow ? "Paid" : "Pending",
    dropOffCity: dropOff[0].toAddress.split(',')[1]?.trim() || "",
    orderComment,
    customerId,
    dropOffAddress: dropOff[0].toAddress
  };
} 