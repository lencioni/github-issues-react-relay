/**
 * @param {string} string String to be truncated
 * @param {number} maxLength maximum length for string
 * @return {string} source string truncated at word boundary so it fits within
 *   the specified maxLength
 */
module.exports = function truncateString(string, maxLength) {
  if (string.length <= maxLength) {
    return string;
  }

  const shortened = string.substr(0, maxLength);
  // If it has a space, and the only space is not the beginning of the string,
  // drop everything after the last space and add an
  // ellipsis, otherwise, replace the last character with an ellipsis.
  // This prevents strings that are just one long word from turning into just
  // an ellipsis.
  const space = shortened.match(/^\s*\S+(\s)/);

  return space ?
    `${shortened.substr(0, shortened.lastIndexOf(space[1]))}…` :
    `${shortened.slice(0, -1)}…`;
};
