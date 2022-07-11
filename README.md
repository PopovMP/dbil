## DBil

DBil is a simple, synchronous, local files Document DB.

Goals:
 - **simple** - syntax similar to MongoDB / NeDB.
 - **embedded** - it can be embedded directly in a host application and store DBs in local files.
 - **synchronous** - all queries are synchronous.
 - **fast** - DBil has a simple API with only the most needed instructions. 
 - **clean** - no third party dependencies, no promises (of any kind)...
 - **API** - web access with API similar to the embedded one.

## Installation, tests

Module name on npm is `@popovmp/dbil`.

```
// Install
npm install @popovmp/dbil

// Test
npm test
```

## Usage

DBil stores the data in local 'JSON' files. Each DB is a separate file.

Example application:

DB file: `db/user.json`
```json
{
  "erh2386wehfh1284": {"_id": "erh2386wehfh1284", "name": "John Doe", "email": "john@mail.com", "courses": ["Math", "English"]},
  "df8s63elka78j3ws": {"_id": "df8s63elka78j3ws", "name": "Sam Jack", "email": "sam@mail.com",  "courses": ["History", "English"]}
}
```

File `index.js`
```javascript
const {join}  = require('path')
const {getDb} = require('@popovmp/dbil')

// Initialize DB with filename and tag. Files must exist.
const dbName  = 'user'
const dbFile  = join(__dirname, 'db', `${dbName }.json`)
const db      = getDb(dbFile, dbName)
const records = db.count({})
console.log(`DB loaded: ${dbName}, records: ${records}`)
```

File `user.js`
```javascript
const {getDb} = require('@popovmp/dbil')

// Get DB by tag
const userDb = getDb('user')

function insertUser(user) {
    userDb.insert(user)
}

function getUserByEmail(email) {
    /** @type {User|undefined} */
    const user = userDb.findOne({email}, {email: 1, name: 1, courses: 1})
    
    if (!user) {
        console.error('Cannot find a user with email' + email)
        return null
    }

    return user
}

function getUserEmailsByCourse(course) {
    /** @type {User[]} */
    const users = userDb.find({courses: {$includes: course}}, {email: 1})

    return users.map(user => user.email)
}
```

## Embedded API

It is a subset of MongoDB's API (the most used operations).

* [Creating/loading a database](#creatingloading-a-database)
* [Persistence](#persistence)
* [Inserting documents](#inserting-documents)
* [Finding documents](#finding-documents)
    * [Basic Querying](#basic-querying)
    * [Operators: $eq, $ne, $lt, $lte, $gt, $gte, $in, $nin, $exists, $regex, $type](#operators-eq-ne-lt-lte-gt-gte-in-nin-exists-regex-type)
    * [Logical operators: $and, $or, $not, $where](#logical-operators-and-or-not-where)
    * [Projections](#projections)
* [Counting documents](#counting-documents)
* [Updating documents](#updating-documents)
* [Removing documents](#removing-documents)

### Creating/loading a database

You can use DBil as an in-memory only CB or as a persistent DB.

```javascript
/**
 * Creates a DB or gets an alreayd created DB.
 * 
 * @property {string} [filename] - DB filename - optional
 * @property {string} [tag]      - DB tag for easier access from otehr modules - optional
 */
const db = getDb(filename, tag)
```

Create in-memory only DB:

```javascript
const {getDb} = require('@popovmp/dbil')
const db = getDb()
```

Load a DB from file

```javascript
const {getDb} = require('@popovmp/dbil')
// Initialize a persistent DB with a filename and a tag
const invoiceDb = getDb('path_to_db/invoice.json', 'invoice')
```

Yuo can access the DB from another modules by filename or by tag
```javascript
// Use DB
const invoiceDb = getDb('invoice')
```

* `filename` (optional) - path to the file where the data is persisted. If left
  blank, the datastore is automatically considered in-memory only. The file must exist at startup.
* `tag` (option) - if given, it allows access the DB from other node modules.

### Persistence

DBil saves the DB after successful `insert`, `update`, or `remove` operation if filename is provided in `getDb`.

You can skip saving in the `update` and `remove` commands with an option `{skipSave: true}`.
You can force saving with `db.save()`

```javascript
const db = getDb('./counter.json')

db.insert({key: 'foo', count: 0}, {skipSave: true}) // skipSave on multiple inserts
db.insert({key: 'bar'}, {skipSave: true})
db.insert({key: 'baz'}) // Saves the DB and sores the three objects

// Update and save the DB. Note: $inc creates a missing field.
db.update({key: 'foo'}, {$inc: {count: 1}})

// Delay the save
db.update({key: 'foo'}, {$inc: {count: 1}}, {skipSave: true})
db.update({key: 'bar'}, {$inc: {count: 1}}, {skipSave: true}) // It will create filed 'count'
db.save()
```

### Inserting documents

A document is of type `Object`.

```javascript
const doc = {foo: 'bar', n: 42, bool: true, fruits: ['apple', 'orange'], pi: {val: 3.14}}
const id = db.insert(doc)
```

`db.insert(doc)` returns the id of the inserted document.

DBil assigns a unique `_id` field to each document. It is a string of length 16 characters.

You can provide your own `_id` of type `string`, however, it must be unique for the db.

```javascript
const id1 = db.insert({a: 1, _id: 'foo'}) // Works. Returns 'foo'
const id2 = db.insert({a: 2, _id: 'foo'}) // Doesn't work because the _id already exists. Returns 'undefined'
```

#### Insert multiple docs

When you want to insert multiple docs, call `insert` for each of them.

You can use the `skipSave` when making multiple `insert` to save time on file save.
Call `db.save` after the last insert.

```javascript
for (let i = 0; i < max; i++) {
    db.insert({index: i}, {skipSave: true})
}
db.save()
```

### Finding documents

Use `find` or `findOne` to look for one or multiple documents matching you query.

* `find` returns an array of documents. If no matches, it returns an empty array.
* `findOne` returns the first found document or `undefined`.

You can select documents based on field equality or use comparison operators:
`$eq`, `$ne`, `$lt`, `$lte`, `$gt`, `$gte`, `$in`, `$nin`.
Other available operators are `$exists` and `$regex`.
You can also use logical operators `$and`, `$or`, `$not` and `$where`.
See below for the syntax.

You can use standard projections to restrict the fields to appear in the results (see below).

#### Basic querying

Basic querying means are looking for documents whose fields match the ones you
specify.

```javascript
// Let's say our DB contains the following documents
db.insert({planet: 'Mars',    system: 'solar',    inhabited: false, moons: 2 })
db.insert({planet: 'Earth',   system: 'solar',    inhabited: true,  moons: 1 })
db.insert({planet: 'Jupiter', system: 'solar',    inhabited: false, moons: 79})
db.insert({planet: 'Omicron', system: 'futurama', inhabited: true,  moons: 7 })

// Find all documents in the collection
const allDocs = db.find({})
// [{planet: 'Mars',...}, {planet: 'Earth',...}, {...}, {...}]

// Finding all planets in the solar system
const docs = db.find({system: 'solar'})
// [{planet: 'Mars',...}, {planet: 'Earth',...}, {planet: 'Jupiter',...}]
// If no document is found, docs is equal to []

// Finding all inhabited planets in the solar system
// All fileds values must match.
const docs = db.find({system: 'solar', inhabited: true})
// [{planet: 'Earth', ...}]
```

#### Operators: $eq, $ne, $lt, $lte, $gt, $gte, $in, $nin, $exists, $regex, $type

The syntax is `{field1: {$op: value1}, field2: {$op: value}}` where `$op` is any comparison
operator:

* `$eq`, `$ne`: equal to, not equal to the value
* `$lt`, `$lte`: less than, less than or equal
* `$gt`, `$gte`: greater than, greater than or equal
* `$in`: member of an array of values
* `$includes`: a `string` or an `array` field includes the value
* `$nin`: not a member of an array
* `$exists`: checks whether the document posses the property `field`. `value`
  should be true or false
* `$regex`: checks whether a string is matched by the regular expression.
* `$type`: checks for a field type. It accepts all JS types + `'array'`

```javascript
// {field: {$eq: value}} is actually the same as {field: value}
db.find({planet: {$eq: 'Earth'}})
// [{planet: 'Earth', ...}]
// Same as
db.find({planet: 'Earth'})

// $ne
db.find({system: {$ne: 'solar'}})
// [{planet: 'Omicron',...}]

// $lt, $lte, $gt and $gte work on numbers and strings
db.find({'moons': {$gt: 5}})
// [{planet: 'Jupiter', ...}, {planet: 'Omicron', ....}]

// When used with strings, lexicographical order is used
db.find({planet: {$gt: 'Mercury'}})
// docs contains Omicron

// Using $in. $nin is used in the same way
db.find({planet: {$in: ['Earth', 'Jupiter']}})
// docs contains Earth and Jupiter

// Using $regex
db.find({planet: {$regex: /ar/}})
// docs Mars and Earth

// Using $includes with a string field
db.find({planet: {$includes: 'ar'}})
// docs Mars and Earth

// $includes an array field.
// If DB has docs
// {_id: '1', a: [1, 2]}
// {_id: '2', a: [2, 3]}
db.find({a: {$includes: 3}})
// Matches _id = '2'
```

#### Logical operators: $and, $or, $not, $where

You can combine queries using logical operators:

* `{$and   : [query1, query2, ...]}`.
* `{$or    : [query1, query2, ...]}`.
* `{$not   : query }`
* `{$where : function (doc) {...; return true/false} }`
* `field: value`
* `field: {$op: value}`

```javascript
db.find({$or: [{planet: 'Earth'}, {planet: 'Mars'}]})
// docs contains Earth and Mars

db.find({$not: {planet: 'Earth'}})
// docs contains Mars, Jupiter, Omicron

db.find({$where: doc => doc.planet.length > 6})
// docs with planet name longer than 6 chars

// You can mix normal queries, comparison queries and logical operators
db.find({$or: [{planet: 'Earth'}, {planet: 'Mars'}], inhabited: true})
// docs contains Earth
```

#### Projections

You can give `find` an optional second argument, `projections`.
The syntax is similar as MongoDB: `{a: 1, b: 1}` to return only the `a`
and `b` fields, `{a: 0, b: 0}` to omit these two fields. You cannot use both
modes at the time.

DBil does not inluce `_id` to the response implicitely.

```javascript
// Same database as above

// Keep only the given fields
db.findOne({planet: 'Mars'}, {planet: 1, system: 1})
// doc is {planet: 'Mars', system: 'solar'}

// Omitt only the given fields and _id
db.findOne({planet: 'Mars'}, {planet: 0, system: 0, _id: 0})
// doc is {inhabited: false, moons: 2}
```

### Counting documents

You can use `count` to count documents. It has the same syntax as `find`. For example:

```javascript
// Count all planets in the solar system
db.count({system: 'solar'})
// count equals to 3

// Count all documents in the datastore
db.count({})
// count equals to 4
```

### Updating documents

`db.update(query, update, options)` will update all documents
matching `query` according to the `update` rules:

* `query` is the same kind of finding query you use with `find`
* `update` specifies how the documents should be modified. It is a set of modifiers for the current fields or new fields.
* `options` is an object with one possible parameter:
    * `multi` (defaults to `false`) which allows the modification of several documents if set to `true`.
    * `skipSave` it skip saving DB to file. Default is: `false`.

Possible `update` options are:

```javascript
// Format
// const numUpdated = db.update(query, update, options = {multi: false})

const update = {
    $inc   : {a: 1, b: -1, ...},       // Increments 'a', 'b', ...
    $push  : {a: 1, b: 2, ...},        // Pushes 1 to 'a' and 2 to 'b' if 'a' and 'b' are arrays.
    $set   : {a: 'foo', b: 42, ...},   // Sets or creates fileds 'a', 'b', ... 
    $unset : {a: true, b: false, ...}, // Deletes filed 'a'
    $rename: {a: 'b'},                 // Renames filed 'a' to 'b'
}

const numUpdated = db.update({}, update)
```

**Note**: you can't change a document's `_id`.

```javascript
// Set an existing field's value
const numUpdated = db.update({system: 'solar'}, {$set: {system: 'solar system'}}, {multi: true})
// numUpdated = 3
// Field 'system' on Mars, Earth, Jupiter now has value 'solar system'

// Deleting a field
const numUpdated = db.update({planet: 'Mars'}, {$unset: {system: true}})
// Now the document for Mars doesn't contain the `system` field
```

### Removing documents

`db.remove(query, options)` will remove all documents matching `query`
according to `options`

* `query` is the same as the ones used for finding and updating
* `options` has two fields:
  * `multi` which allows the removal of multiple documents if set to true. Default is: `{multi: false}`
  * `skipSave` it skip saving DB to file. Default is: `{skipSave: false}`

```javascript
// Remove one document from the collection
// The dafault option is {multi: false}
const numRemoved = db.remove({planet: 'Mars'})
// Removes the doc of planet Mars. Returns 1.

// Remove multiple documents
db.remove({system: 'solar'}, {multi: true})
// All planets from the solar system were removed

// Removing all documents with the 'match-all' query
db.remove({}, {multi: true})
```
### Logging

**DBil** logs errors by using `@popovmp/micro-logger` ( https://www.npmjs.com/package/@popovmp/micro-logger ).
You may include `micro-logger` to your application and specify the output log file:

```javascript
// In index.js
require('@popovmp/micro-logger').init('~/logs/my-app.log')
```

## Web API

DBil can be used remotely via HTTP requests. It requires Express to do so.

```javascript
const express = require('express')
const dbil    = require('@popovmp/dbil')

const dbNames   = ['account', 'invoice']
const apiSecret = 'foo-bar'

// Initilaise DB files. Files must exist.
for (const dbName of dbNames) {
	const dbFile = path.join(__dirname, 'dbil', `${dbName}.json`)
	const db     = dbil.getDb(dbFile, dbName)
	logInfo(`DB loaded: ${dbName}, records: ${db.count({})}`, 'index')
}

// Initilaise web API
const dbRouter = dbil.initApi(express, apiSecret)

const app = express()
app.use('/api/dbil', dbRouter)

const server = http.createServer(app)
server.listen(8080)
```

The above Express application initializes 2 DBs: `account` and `invoice`.
It listens `post` requests at `server/api/dbil/ACTION`, where ACTION is one of:

 - `count`   
 - `find`    
 - `find-one`
 - `insert`  
 - `remove`  
 - `update`  
 - `save`    

The `post` request has the form of the DBil embed API plus a `secret` and a `dbName` parameters.

Examples:

```javascript
// find
// POST to  `server/api/dbil/find`
const postBody = {
    secret    : 'foo-bar',
    dbName    : 'account',
    query     : {city: 'London'},
    projection: {name: 1, email: 1}, 
}

// Response: data = [Object...]
// {err: null, data: [{user1}, {user2}]}

// update
// POST to  `server/api/dbil/update`.
// It adds a Spanish course to an account with an email 'john@example.com'.
const postBody = {
    secret  : 'foo-bar', 
    dbName  : 'account',
    query   : {email: 'john@example.com'},
    update  : {$push: {courses: 'Spanish'}},
    option  : {multi: false}
}

// Response: data = numUpdated
// {err: null, data: 1}
```
