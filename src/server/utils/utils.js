/**
 * Returns a MySQL timestamp string
 * @param {Date} date - The date object
 * @returns The timestamp string
 */
const getMysqlTimestamp = (date) =>
  (date ?? new Date()).toISOString().slice(0, -1).replace("T", " ");

/**
 * Returns uuid converted to a hex buffer
 * @param {string} uuid - The UUID string
 * @returns The converted buffer
 */
const uuidToBinary = (uuid) => Buffer.from(uuid.replace(/-/g, ""), "hex");

module.exports = { getMysqlTimestamp, uuidToBinary };
