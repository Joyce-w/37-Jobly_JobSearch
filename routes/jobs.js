"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

//Schema section
const jobNewSchema = require("../schemas/jobNew.json");
const jobFilter = require("../schemas/jobFilter.json");
const jobUpdate = require("../schemas/jobUpdate.json");

const router = new express.Router();


/**POST /{ jobs } => {job}
 * job should be { title, salary, equity, company_handle }
 * returns { title, salary, equity, company_handle }
 * Authorization: must be loggedin 
*/

router.post("/", ensureAdmin, async function (req, res, next) {
    try {
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
        //change query to appropriate types for schema validation.
        req.query.minSalary = req.query.minSalary ? +(req.query.minSalary) : 0;
        req.query.hasEquity = req.query.hasEquity === "true" ? true : false;

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
/**GET /{id} => { title, salary, equity, company_handle}
 * Returnssingle job post.
 * 
*/
router.get("/:id", async function (req, res, next) {
    try {
        //pass params into getJob();
        const job = await Job.getJob(req.params.id);
        return res.json(job);
    } catch (e) {
        next(e);
    }
});

/*PATCH /:id  => (updated){ title, salary, equity} */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        //validate json to be patch
        const validator = jsonschema.validate(req.body, jobUpdate);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (e) {
        return next(e);
    }
});

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Job.delete(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (e) {
        return next(e);
    }
})

module.exports = router;