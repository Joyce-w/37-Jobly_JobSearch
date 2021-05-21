const { compareSync } = require("bcrypt");
const { query } = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs */

class Job {

    /**Create a job, must be admin? */
    static async create({ title, salary, equity, company_handle }) {
        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING title, salary, equity, company_handle`,
            [title, salary, equity, company_handle]
        );
        const job = result.rows[0];
        return job;
    }

    /**Get all job listing */
    static async findAll(query) {

        const { title, minSalary, hasEquity } = query;
        console.log(query)
        //Count queries passed in
        let queryKeyCount = Object.keys(query).length;

        //salary syntax for minSalary, will filter through regardless since it it set to min 0;
        let salarySyntax = `salary >= ${minSalary}`

        //sql syntax for searching by job title
        let titleSyntax = title ? `AND title ILIKE '%${title}%' ` : `AND title ILIKE '%%'`;
        ;
        
        //if hasEquity is true, display equity !== Null, else: display everything
        let equityData = hasEquity ? `equity > 0` : '';



        let combinedWhereSyntax = '';

        //if there is more than one query
  
            combinedWhereSyntax = `WHERE ${salarySyntax} ${titleSyntax}${equityData} `
            console.log(combinedWhereSyntax)
   
        

        const jobRes = await db.query(
            `SELECT id, title, 
            salary,
            equity,
            company_handle FROM jobs ${combinedWhereSyntax}
            ORDER BY title`
        );
        return jobRes.rows;
    }


    /*Get single job detail*/
    static async getJob(id) {
        const job = await db.query(
            `SELECT id, title, 
            salary,
            equity,
            company_handle FROM jobs
            WHERE id = $1
            ORDER BY title`,
            [id]
        );
        if (job.rows.length === 0) {
            throw new NotFoundError();
        }
        return job.rows[0];
    }
    /*Update existing job post, must be admin */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data,
            {
                title: "title",
                salary: "salary",
                equity: "equity",
                company_handle: "company_handle"
            });

        const jobQuery = (`
            UPDATE jobs
            SET ${setCols}
            WHERE id = ${id}
            RETURNING title, salary, equity, company_handle`
        );
        
        const result = await db.query(jobQuery, [...values])
        let job = result.rows[0];

        if (!job) {
             throw new NotFoundError(`No job id: ${id}`);
        }
        return job;
    }
    
    /*Delete existing job post, must be admin */

    static async delete(id) {
        const result = await db.query(
            `DELETE
            FROM jobs
            WHERE id = $1
            RETURNING title`,
            [id]);
        const company = result.rows[0];

        if (!company) {
            throw new NotFoundError(`No id of ${id} found to be deleted.`)
        }
    }
}

module.exports = Job;