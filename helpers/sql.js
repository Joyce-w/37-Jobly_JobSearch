const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/**Used in company, user, and job models */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  /*Array of keys from model/user.js data
  {firstName: 'Aliya', age: 32} => ["firstName", "age", ..] 
  */
  const keys = Object.keys(dataToUpdate);
  // checks when there is no user data
  if (keys.length === 0) throw new BadRequestError("No data");

  /*
  {firstName: 'Aliya', age: 32} => ["first_name"=$1', '"age"=$2']
  Uses value name from jsToSql and numerically increment vals
  */
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

    /**
    {"\"first_name\"=$1, \"age\"=$2",
    ['Aliya', '32]} */
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
