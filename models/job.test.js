"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const { findAll, getJob } = require("./job.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/**************************************Create */
describe("create", function () {
    const newJob = {
        "title": "Iguana Walker",
        "salary": 22000,
        "equity": 0.03,
        "company_handle": 'c3'
    }
    test("works: new job", async function () {
        const res = await Job.create(newJob);
        expect(res).toEqual({
            title: 'Iguana Walker',
            salary: 22000,
            equity: '0.03',
            company_handle: 'c3'
        });

    });

    test("Error: Invalid data", async function () {
        const newJob = {
            "title": "Iguana Walker",
            "salary": "22000",
            "equity": 0.03,
            "company_handle": 'c3'
        }
        try {
            await Job.create(newJob);
        }
        catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();  
        }
    });
})

/**************************************** findAll */
describe("findAll", function () {
    test("works: testing no query", async function () {
        //no query passed in will have default of the following in the route:
        const query = {
            "minSalary": 0,
            "hasEquity": false
        }
        let job = await Job.findAll(query);
        expect(job.length).toEqual(3)
    });

    test("works: testing query", async function () {

        const jobQuery = {
            minSalary: 0,
            maxSalary: 25000,
            title: 'Dog'
        }
        const job = await Job.findAll(jobQuery);
        expect(job.length).toEqual(2)
    });
});

/*************************************getJob */
describe("getJob", function () {
    test("works: valid job ID", async function () {
        const res = await db.query(`
        SELECT id, title FROM jobs
        WHERE title = 'Dog walker'`);

        const jobID = res.rows[0].id;
        const resGetJob = await getJob(jobID)
        expect(resGetJob).toEqual({
            "id": jobID,
            "equity": "0",
            "salary": 25000,
            "title": 'Dog walker',
            "company_handle": "c1"
        });
    });
    test("Invalid work id", async function () {
        try {
            const res = await getJob(0);
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

/****************************************Update */
describe("update job", function () {
    test("works: update job", async function () {
        const res = await db.query(`
        SELECT id, title FROM jobs
        WHERE title = 'Dog walker'`);

        const jobID = res.rows[0].id;
        const newData = {
            "salary": 36000
        }
        const updateJob = await Job.update(jobID, newData);
        expect(updateJob).toEqual({
            title: 'Dog walker',
            salary: 36000,
            equity: '0',
            company_handle: 'c1'
        });
    });

    test("Invalid job ID", async function () {
        try {
          const job = await Job.update(0, { "salary": 2000 });  
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }        
    });
});

/*********************************************delete */
describe("delete", function () {
    test("works: valid job id", async function () {
        const res = await db.query(`
        SELECT id, title FROM jobs
        WHERE title = 'Dog walker'`);
        const jobID = res.rows[0].id;

        await Job.delete(jobID);

        const checkDeleted = await db.query(`
        SELECT id, title FROM jobs
        WHERE id = '${jobID}'`)
            
        expect(checkDeleted.rows.length).toEqual(0);
    });

    test("Invalid job id", async function () {
        try {
            await Job.delete(0);
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});