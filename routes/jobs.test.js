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

    test("Doesn't work: invalid query", async function () {
        const resp = await request(app).get("/jobs/?minSalary=onehundred");
        expect(resp.statusCode).toEqual(400);
    });
});

describe("GET /:id", function () {
    test("works: valid job id", async function () {
        let res = await db.query(`SELECT id, title FROM jobs WHERE title = 'Dog walker'`);
        let jobID = res.rows[0].id;

        const resp = await request(app).get(`/jobs/${jobID}`);
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({
            "id": jobID,
            "title": "Dog walker",
            "salary": 25000,
            "equity": null,
            "company_handle": "c1"
        });
    });
})

/********************************************PATCH /jobs */

describe("PATCH /:id", function () {
    test("works: update as admin", async function () {
        const res = await db.query(`SELECT id, title FROM jobs WHERE title = 'Dog walker'`);
        let jobID = res.rows[0].id;

        const resp = await request(app)
            .patch(`/jobs/${jobID}`)
            .send({ "equity": 0.9 })
            .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.body).toEqual({
            job: {
                title: 'Dog walker',
                salary: 25000,
                equity: '0.9',
                company_handle: 'c1'
            }
        });
    });

    test("Unauth with anon", async function () {
        const res = await db.query(`SELECT id, title FROM jobs WHERE title = 'Dog walker'`);
        let jobID = res.rows[0].id;
        
        const resp = await request(app)
            .patch(`/jobs/${jobID}`)
            .send({ "equity": 0.9 });
        expect(resp.statusCode).toEqual(401);
    })

    test("Patching invalid data", async function () {
        const res = await db.query(`SELECT id, title FROM jobs WHERE title = 'Dog walker'`);
        let jobID = res.rows[0].id;
        
        const resp = await request(app)
            .patch(`/jobs/${jobID}`)
            .send({ "id": 123 })
        .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.statusCode).toEqual(400);
    })

});


/************************************************DELETE /jobs/:id */
describe("DELETE /jobs/:id", function () {
    test("Works for admin", async function () {
        const res = await db.query(`SELECT id, title FROM jobs WHERE title = 'Dog walker'`);
        let jobID = res.rows[0].id;
        
        const resp = await request(app)
            .delete(`/jobs/${jobID}`)
            .send({ "id": 123 })
        .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.body).toEqual({ deleted: `${jobID}` });
        expect(resp.statusCode).toEqual(200);
    });

    test("Does not work for non-Admin", async function () {
        const res = await db.query(`SELECT id, title FROM jobs WHERE title = 'Dog walker'`);
        let jobID = res.rows[0].id;

        const resp = await request(app)
            .delete(`/jobs/${jobID}`);
            expect(resp.statusCode).toEqual(401);
    });

    test("Works for admin", async function () {
        const res = await db.query(`SELECT id, title FROM jobs WHERE title = 'Dog walker'`);
        let jobID = res.rows[0].id;
        
        const resp = await request(app)
            .delete(`/jobs/${jobID}`)
            .send({ "id": 123 })
        .set("authorization", `Bearer ${u2AdminToken}`);
        expect(resp.body).toEqual({ deleted: `${jobID}` });
        expect(resp.statusCode).toEqual(200);
    });

    test("No such job", async function(){
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${u2AdminToken}`);

        expect(resp.statusCode).toEqual(404);
        expect(resp.body.error.message).toEqual("No id of 0 found to be deleted.");
    })
})