/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} val - The input string to be processed.
 * @returns {string} - The input string with the first letter capitalized.
 */
export function capitalizeFirstLetter(val) {
	if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
}
