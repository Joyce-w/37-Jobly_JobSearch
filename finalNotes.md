#### Part 1: 
- **sqlForPartialUpdate** is used in models: company, user, and job.
- Takes in 2 arguements; the data & sql format (in case the naming between the req.body properties and sql column name differse).
  1. Gets the keys in array.
  2. Formats so that the key follows var # (e.g. firstname=$1) for the sql insertion syntax.
  3. Joins the array into one long string.
  4. Returns the format back into the models.
 
#### Part 2:
- Adding filters: name, minEmployees, and maxEmployees as options in the GET/companies route. 
- From the route, if no filter is passed in, the default values for min/maxEmployees is 0 (to satisfy json validation).
- In the company model findAll(), the filters are 3 different variables starting with ''. If there are values, the correct syntax is used for the corresponding sql syntax portion.
    - Did not use the variable index format in writing the query (e.g. maxEmployees=$1) because using the format would cause a problem if there were no query filters passed in. 
- Tested routes with different/no queries passed in as well as filtering invalid queries. 

#### Part 3:
- Entire list of companie(s) and job(s) remain an open route to access regardles of user type.
- middleware: **ensureAdmin()** checks if there is a local user is an admin, allowing them to create, update, and delete companies.
- middleware: **ensureValidUserOrAdmin()** checks to see if the local user is an admin or the correct user who is then allowed to retrieve user, updating, or deleting the user.  

#### Part 4:
- In the jobs table, NUMERIC is used instead of FLOAT because it is more precise and holds a larger byte (which would be useful as equity can be a small number with a large decimal place). It is more accurate to use NUMERIC in this case.
- Followed similar model as companies with methods: **create(), findAll(), getJob(), update(), delete()**.
- **findAll()** has a similar setup as the Company.findAll() method with piecing different query syntax together.
- The PATCH /:id route uses json schema to prevent the job id from getting updated.
- Add, update, or deleting a job uses the middleware **ensureAdmin()**.
- For GET /companies/:handle, an additional query for the available jobs corresponding to the company handle was used and returned in the json of the valid search. 

#### Part 5:
- Created **addApplicant()** in the Job model which takes the job id and the username from the query (POST /users/:username/jobs/:id) and inserts information into the applications table.
    - **ensureValidUserOrAdmin()** is used in the route to prevent others from adding to the application when they are not the correct user/admin.
- The sql query utilizes a ARRAY_AGG to aggregate a list of job ids that the user applied for. 

#### Additional Notes:
- Used json schema to validate most req routes to ensure the format was correct and extra caution to catching errors.
- Middleware used in most routes to prevent unauthorize routes where needed.
- App took a little less than 30 hrs to complete.

#### Questions:
- Is it ideal to group HTTP verbs together even though they don't relate? 
(e.g. "POST/ users": allows admins to create users while "POST/:username/jobs/:id" allows users/admins to submit a job application. Not really related! while "GET/users" & "GET/users/:username" is more related.)
