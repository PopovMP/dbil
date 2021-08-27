## DBil

DBil is heavily inspired by [nedb](https://github.com/louischatriot/nedb).

Goals:
 - **simple** - syntax similar to MongoDB / NeDB.
 - **synchronous** - all queries are synchronous. Only DB save accepts an optional callback.
 - **fast** - DBil has a simple API with only the most needed instructions. 
 - **clean** - no dependencies, no promises (of any kind)...

## Installation, tests

Module name on npm is `@popovmp/dbil`.

```
npm install @popovmp/dbil
```

## API

It is a subset of MongoDB's API (the most used operations).

* [Creating/loading a database](#creatingloading-a-database)
* [Persistence](#persistence)
* [Inserting documents](#inserting-documents)
* [Finding documents](#finding-documents)
    * [Basic Querying](#basic-querying)
    * [Operators: $eq, $ne, $lt, $lte, $gt, $gte, $in, $nin, $exists, $regex](#operators-eq-ne-lt-lte-gt-gte-in-nin-exists-regex)
    * [Logical operators ($and, $or, $not, $where)](#logical-operators-and-or-not-where)
    * [Projections](#projections)
* [Counting documents](#counting-documents)
* [Updating documents](#updating-documents)
* [Removing documents](#removing-documents)

### Creating/loading a database

You can use DBil as an in-memory only CB or as a persistent DB.

Create in-memory only DB:

```js
const {getDB} = require('@popovmp/dbil')
const db = getDB()
```

Load a DB from file

```js
const {getDB} = require('@popovmp/dbil')
const db = getDB('path/to/db.file')
```

* `filename` (optional): path to the file where the data is persisted. If left
  blank, the datastore is automatically considered in-memory only. The file must exist at startup.

### Persistence

DBil allows you to make as many queries as you need in-memory. However, you need to explicitly save the DB when you finish.

```js
// queries, queries,...
db.save() // Fire and forget.
// db.save accepts an optional callback

db.save((err) => {
	if (err) {
        console.error(err)
    }
})
```

### Inserting documents

A document is of type `Object`.

```javascript
var doc = {foo: 'bar', n: 42, itIs: true, fruits: ['apple', 'orange', 'pear'], pi: {name: 'Pi', val: 3.14}}
const id = db.insert(doc)
```

`db.inser(doc)` returns the id of the inserted document.

You can also bulk-insert an array of documents.

```javascript
const ids = db.insert([{ a: 5 }, { a: 42 }])
```

DBil assigns a unique field `_id` to each document. You can provide your own `_id`, but it must be unique for the db.

```javascript
const id1 = db.insert({a: 1, _id: 'foo'}) // Works. Returns 'foo'
const id2 = db.insert({a: 2, _id: 'foo'}) // Doesn't work. Returns 'undefined'
```

### Finding documents

Use `find` to look for multiple documents matching you query, or `findOne` to
look for one specific document. You can select documents based on field equality
or use comparison operators (`$eq`, `$ne`, `$lt`, `$lte`, `$gt`, `$gte`, `$in`, `$nin`).
Other available operators are `$exists` and `$regex`.
You can also use logical operators `$and`, `$or`, `$not` and `$where`. See
below for the syntax.

You can use standard projections to restrict the fields to appear in the
results (see below).

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

// The same rules apply when you want to only find one document
const doc = db.findOne({system: 'futurama'})
// {planet: 'Omicron', ...}
// If no document is found, doc is undefined

// If `findOne` maches multiple documents, it returns `undefined`
const doc = db.findOne({system: 'solar'})
// returns `undefined` for safety reasons
```

#### Operators: $eq, $ne, $lt, $lte, $gt, $gte, $in, $nin, $exists, $regex

The syntax is `{field1: {$op: value1}, field2: {$op: value}}` where `$op` is any comparison
operator:

* `$eq`, `$ne`: equal to, not equal to the value
* `$lt`, `$lte`: less than, less than or equal
* `$gt`, `$gte`: greater than, greater than or equal
* `$in`: member of an array of values
* `$nin`: not a member of an array
* `$exists`: checks whether the document posses the property `field`. `value`
  should be true or false
* `$regex`: checks whether a string is matched by the regular expression.


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
db.find({ planet: { $gt: 'Mercury' } })
// docs contains Omicron

// Using $in. $nin is used in the same way
db.find({ planet: { $in: ['Earth', 'Jupiter'] } })
// docs contains Earth and Jupiter

// Using $regex with another operator
db.find({planet: {$regex: /ar/}})
// docs only contains Mars because Earth was excluded from the match by $nin
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
db.find({ $or: [{planet: 'Earth'}, {planet: 'Mars'}] })
// docs contains Earth and Mars

db.find({$not: {planet: 'Earth'}})
// docs contains Mars, Jupiter, Omicron Persei 8

db.find({$where: doc => doc.planet.length > 6})
// docs with planet name longer than 6 chars

// You can mix normal queries, comparison queries and logical operators
db.find({$or: [{planet: 'Earth'}, {planet: 'Mars'}], inhabited: true})
// docs contains Earth
```

#### Projections

You can give `find` and `findOne` an optional second argument, `projections`.
The syntax is the same as MongoDB: `{ a: 1, b: 1 }` to return only the `a`
and `b` fields, `{ a: 0, b: 0 }` to omit these two fields. You cannot use both
modes at the time, except for `_id` which is by default always returned and
which you can choose to omit. You can project on nested documents.

```javascript
// Same database as above

// Keeping only the given fields
db.find({planet: 'Mars'}, {planet: 1, system: 1})
// docs is [{planet: 'Mars', system: 'solar', _id: 'id1'}]

// Keeping only the given fields but removing _id
db.find({ planet: 'Mars' }, {planet: 1, system: 1, _id: 0})
// docs is [{ planet: 'Mars', system: 'solar' }]

// Omitting only the given fields and removing _id
db.find({ planet: 'Mars' }, {planet: 0, system: 0, _id: 0})
// docs is [{inhabited: false, moons: 2}]
```

### Counting documents

You can use `count` to count documents. It has the same syntax as `find`. For
example:

```javascript
// Count all planets in the solar system
db.count({ system: 'solar' })
// count equals to 3

// Count all documents in the datastore
db.count({})
// count equals to 4
```


### Updating documents

`db.update(query, update, options)` will update all documents
matching `query` according to the `update` rules:

* `query` is the same kind of finding query you use with `find` and `findOne`
* `update` specifies how the documents should be modified. It is a set of modifiers for the current fields or new fields.
* `options` is an object with two possible parameters
    * `multi` (defaults to `false`) which allows the modification of several
      documents if set to true

Possible update options are:

```js
// Format
// const numUpdated = db.update(query, update, options = {multi: false})

const update = {
	$inc   : {field1: 1, field2: -1, ...},
    $set   : {field3: 'val1', field4: 'val2', ...},
    $unset : {filed5: true, filed6: true, ...},
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
* `options` only one option for now: `multi` which allows the removal of
  multiple documents if set to true. Default is false

```javascript
// Remove one document from the collection
// The dafault option is {multi: false}
const numRemoved = db.remove({ planet: 'Mars' })
// Removes the doc of planet Mars

// Remove multiple documents
const numRemoved = db.remove({system: 'solar'}, {multi: true})
// All planets from the solar system were removed

// Removing all documents with the 'match-all' query
const numRemoved = db.remove({}, {multi: true})
```
