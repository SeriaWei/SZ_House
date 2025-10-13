/**
 * Adds total statistics to the API response data
 * @param {Object} response - The API response object
 * @returns {Object} The response with added total statistics
 */
function addTotalStatistics(response) {
  if (response.status !== 1 || !response.data || !response.data.dataMj || !response.data.dataTs) {
    return response;
  }

  // Calculate total area (dataTotalMj) with precision fix
  const totalMj = response.data.dataMj.reduce((sum, item) => sum + (item.value || 0), 0);
  // Round to 2 decimal places to fix floating point precision issues
  const roundedTotalMj = Math.round(totalMj * 100) / 100;
  
  // Calculate total transactions (dataTotalTs) - should be integers
  const totalTs = response.data.dataTs.reduce((sum, item) => sum + (item.value || 0), 0);

  // Add the totals to the response data
  response.data.dataTotalMj = roundedTotalMj;
  response.data.dataTotalTs = totalTs;

  return response;
}

module.exports = { addTotalStatistics };