"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const { findAll } = require("./job.js");
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


