"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
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
    test("works", async function () {

        const validJob = { /**Doesnt work? fkey restraint? */
            title: "testPosition",
            company_handle: "watson-davis"
        }
        
        let job = await Job.create(validJob);
        console.log(job)
    })
})