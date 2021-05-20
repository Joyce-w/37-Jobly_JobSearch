"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(query) {
    //destructure so only the optional 3 filter parameters can be worked with
    let { minEmployees, maxEmployees } = query;
    
    //make the employee params integers
    let min;
    let max;

    if (minEmployees) {min = parseInt(minEmployees)};
    if (maxEmployees) { max = parseInt(maxEmployees) };
    
    //if max< min Employees throw error 
    if (min > max) {
      throw new BadRequestError("maxEmployees cannot be less than minEmployees!")
    }

    /*The following code consists of 3 general portions. Syntax for: WHERE, name query, and numeber query. Based on the data from query, the sql syntax will adjust accordingly and be combined at the end to be integrated into one syntax.*/
    
    //Count number of queries passed in to determine syntax.
    let numKeys = Object.keys(query).length
    
    // WHERE syntax
    // if there were queries passed in, the variable would have WHERE, otherwise blank.
    //checking for 'query' will return true, need to be more specific by checking parameters.
    let whereClause = '';
    if(numKeys !== 0) {
      whereClause = 'WHERE'
    }

    //Name syntax
    //syntax for name query. if there is a min/max that was passed in, will add on 'AND' to syntax
    let sqlNameFilterSyntax = '';
    if (query.name) {
      if (!(min || max)) {
        sqlNameFilterSyntax = `name ILIKE '%${query.name}%'`        
      } else {
        sqlNameFilterSyntax = `name ILIKE '%${query.name}%' AND`
      }
    } 

    //num_Employee syntax
    //syntax for num_employee query portion. Based on range that was passed in, will write appropriate syntax to query.
    let sqlEmployeeNumSyntax = '';

    if(min && max) {
      sqlEmployeeNumSyntax = `companies.num_employees BETWEEN ${min} AND ${max}`
    }
    // syntax for maxEmployee
    if (!max && min) {
      sqlEmployeeNumSyntax = `companies.num_employees >= ${min}`
    }   // syntax for minEmployee
    if (!min && max) {
      sqlEmployeeNumSyntax = `companies.num_employees <= ${max}`
    }
    //Only show num_employees when there is actual filter criteria
    let num_employees = '';
    if (sqlEmployeeNumSyntax !== '') {
      num_employees = `num_employees AS "num_Employees",`
    }

    // if there is data in the query, combine all the syntax from above into one.
    let combinedWhereSyntax = '';
    if (numKeys !== 0) {
      combinedWhereSyntax = `${whereClause} ${sqlNameFilterSyntax} ${sqlEmployeeNumSyntax}`
    } 

    //psql syntax with filter syntax
    const companiesRes = await db.query(
          `SELECT handle,
          name,
          description,
          ${num_employees}
          logo_url AS "logoUrl"
          FROM companies ${combinedWhereSyntax}GROUP BY companies.handle
          ORDER BY name;`);
     return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
      });
    //sets one more thhan the length of values for insertion
    const handleVarIdx = "$" + (values.length + 1);
    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
