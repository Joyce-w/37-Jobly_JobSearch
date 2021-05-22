"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2AdminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/********************************* POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        "title": "House keeper",
        "salary": 22600,
        "company_handle": "c3"
    };

    test("Successfully post job as admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                "title": "House keeper",
                "equity": null,
                "salary": 22600,
                "company_handle": "c3"
                }});
    });

    test("Unsuccessful: post job as non-admin", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("Unsuccessful: Invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({ "title": "House keeper" });
        expect(resp.statusCode).toEqual(401);
    });
    test("Unsuccessful: missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
})

/**************************** GET /jobs */
describe("GET /", function () {

    test("works: no query", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.jobs.length).toEqual(2)
    });

    test("works: with query", async function () {

        const resp = await request(app).get("/jobs/?title=walker&minSalary=2000");
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.jobs.length).toEqual(2);
    });

    test("Doesn't work: incorrect query", async function () {

        const resp = await request(app).get("/jobs/?numHires=2");
        expect(resp.statusCode).toEqual(400);
    });
});