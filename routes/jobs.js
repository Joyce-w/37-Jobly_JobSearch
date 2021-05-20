"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const Job = require("../models/job");

//Schema section
const jobNewSchema = require("../schemas/jobNew.json");
const jobFilter = require("../schemas/jobFilter.json");

const router = new express.Router();


/**POST /{ jobs } => {job}
 * job should be { title, salary, equity, company_handle }
 * returns { title, salary, equity, company_handle }
 * Authorization: must be loggedin 
*/

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        console.log(req.body)
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

/**GET / => {jobs: [ { title, salary, equity, company_handle}, ...}
 * Returns a list of all jobs, allowing for filtering by: title, minSalary, hasEquity.
 * 
*/
router.get("/", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.query, jobFilter);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        //pass in valid query into findAll()
        const jobs = await Job.findAll(req.query);
        return res.json({ jobs });
    } catch (e) {
        next(e);
    }
});


module.exports = router;