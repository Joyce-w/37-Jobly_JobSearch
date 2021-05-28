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

        //salary syntax for minSalary, will filter through regardless since it it set to min 0;
        let salarySyntax = minSalary !==0 ? `AND salary >= ${minSalary}` : '';
        
        //sql syntax for searching by job title
        let titleSyntax = title ? `title ILIKE '%${title}%' ` : `title ILIKE '%%'`;
        ;
        
        //if hasEquity is true, display equity !== Null, else: display everything
        let equityData = hasEquity ? `AND equity > 0` : '';

        //combined query
        let combinedWhereSyntax = '';
        combinedWhereSyntax = `WHERE ${titleSyntax} ${salarySyntax} ${equityData} `

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

    /**Adds user to job as applicant to via a job ID */
    static async addApplicant(username, id) {
        //query for username and id
        const queryID = await db.query(`
        SELECT id, title FROM jobs WHERE id=$1`, [id]);

        const queryUsername = await db.query(`
        SELECT username FROM users WHERE username=$1`, [username]);

        //throw error if it does not exist
        if(!queryID || ! queryUsername){
            throw new NotFoundError(`Error in username or id`)
        }

        const res = await db.query(`
        INSERT INTO applications
        (username, job_id)
        VALUES ($1, $2)
        RETURNING username, job_id`,
            [username, id]);

        return res.rows[0].job_id;
    }
}

module.exports = Job;
