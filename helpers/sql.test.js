
process.env.NODE_ENV === "test"
const {
    commonAfterEach,
    commonAfterAll
} = require("../models/_testCommon");

const { sqlForPartialUpdate } = require("../helpers/sql")

afterEach(commonAfterEach)
afterAll(commonAfterAll)
    

/**Testing sqlForPartialUpdate with user data */
describe("test sqlForPartialUpdate for user", () => {

    const userjsToSql = {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
    }

    test("Valid user data for sqlForPartialUpdate", () => {

        const data = {
            "firstName": "joyjoy",
            "lastName": "cee",
            "email": "Joyce@gmail.com"
        }

        let res = sqlForPartialUpdate(data, userjsToSql);
        expect(res.values).toEqual(['joyjoy', 'cee', 'Joyce@gmail.com'])
        expect(res.setCols).toEqual(`"first_name"=$1, "last_name"=$2, "email"=$3`)
    })


    test('Testing empty datatoUpdate', () => {
        //wrap code in a function 
        function partialUpdateTest() {
            sqlForPartialUpdate({}, userjsToSql);
        }
        
        expect(() => {
            partialUpdateTest();
        }).toThrowError('No data');
    });
    
    
    
})


/**Testing sqlForPartialUpdate with company data */
describe("test sqlForPartialUpdate for company",  () => {

    const companyjsToSql =
        {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        }
        
    test("Valid company data for sqlForPartialUpdate", () => {

        const company = {
            handle: "new",
            name: "New",
            logoUrl: "http://new.img",
            description: "DescNew",
            numEmployees: 10,
         };

        let res = sqlForPartialUpdate(company, companyjsToSql);
        
        expect(res.setCols).toEqual("\"handle\"=$1, \"name\"=$2, \"logo_url\"=$3, \"description\"=$4, \"num_employees\"=$5")
        expect(res.values.length).toEqual(5)
    })

    test("Invalid company data for sqlForPartialUpdate", () => {

        //wrap code in a function 
        function partialUpdateTest() {
            sqlForPartialUpdate({}, companyjsToSql);
        }
        
        expect(() => {
            partialUpdateTest();
        }).toThrowError('No data');

    })
})
    


