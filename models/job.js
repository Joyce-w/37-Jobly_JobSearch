const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

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
    static async findAll() {
        const jobRes = await db.query(
            `SELECT id, title, 
            salary,
            equity,
            company_handle FROM jobs
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

    /*Delete existing job post, must be admin */

}

module.exports = Job;