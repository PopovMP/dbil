'use strict'

const {logError} = require('@popovmp/micro-logger')

const config = {
	dbHolder : {},
	apiSecret: '',
}

/**
 * @typedef {Object} ExpressReq
 *
 * @property {Object} body - Contains key-value pairs of data submitted in the request body.
 */

/**
 * @typedef {Object} ExpressRes
 *
 * @property {function(object)} json - sends a JSOn response
 */

/**
 * Validates the request. If it is OK, it returns DB.
 * DB must be initialised before an API call.
 *
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function validateRequest(req, res)
{
	const secret = req.body['secret']
	const dbName = req.body['dbName']

	if (secret !== config.apiSecret) {
		res.json({err: 'Something went wrong!', data: null})
		return
	}

	if (!dbName || !config.dbHolder[dbName]) {
		logError('Wrong DB name: ' + dbName, 'db-api :: validateRequest')
		res.json({err: 'Something went wrong!', data: null})
		return
	}

	return config.dbHolder[dbName]
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function count(req, res)
{
	const db = validateRequest(req, res)
	if (!db)
		return

	try {
		const query = JSON.parse(req.body['query'])

		const count = db.count(query)

		res.json({err: null, data: count})
	}
	catch (e) {
		logError(e.message, 'db-api :: count')
		res.json({err: 'Something went wrong!', data: null})
	}
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function find(req, res)
{
	const db = validateRequest(req, res)
	if (!db)
		return

	try {
		const query      = JSON.parse(req.body['query'])
		const projection = JSON.parse(req.body['projection'] || '{}')

		const docs = db.find(query, projection)

		res.json({err: null, data: docs})
	}
	catch (e) {
		logError(e.message, 'db-api :: find')
		res.json({err: 'Something went wrong!', data: null})
	}
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function findOne(req, res)
{
	const db = validateRequest(req, res)
	if (!db)
		return

	try {
		const query      = JSON.parse(req.body['query'])
		const projection = JSON.parse(req.body['projection'] || '{}')

		const doc = db.findOne(query, projection)

		res.json({err: null, data: doc || null})
	}
	catch (e) {
		logError(e.message, 'db-api :: find-one')
		res.json({err: 'Something went wrong!', data: null})
	}
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function insert(req, res)
{
	const db = validateRequest(req, res)
	if (!db)
		return

	try {
		const doc     = JSON.parse(req.body['doc'])
		const options = JSON.parse(req.body['options'] || '{}')

		const id = db.insert(doc, options)

		res.json({err: null, data: id || null})
	}
	catch (e) {
		logError(e.message, 'db-api :: insert')
		res.json({err: 'Something went wrong!', data: null})
	}
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function remove(req, res)
{
	const db = validateRequest(req, res)
	if (!db)
		return

	try {
		const query   = JSON.parse(req.body['query'])
		const options = JSON.parse(req.body['options'] || '{}')

		const numRemoved = db.remove(query, options)

		res.json({err: null, data: numRemoved})
	}
	catch (e) {
		logError(e.message, 'db-api :: remove')
		res.json({err: 'Something went wrong!', data: null})
	}
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function update(req, res)
{
	const db = validateRequest(req, res)
	if (!db)
		return

	try {
		const query   = JSON.parse(req.body['query'])
		const update  = JSON.parse(req.body['update'])
		const options = JSON.parse(req.body['options'] || '{}')

		const numUpdated = db.update(query, update, options)

		res.json({err: null, data: numUpdated})
	}
	catch (e) {
		logError(e.message, 'db-api :: update')
		res.json({err: 'Something went wrong!', data: null})
	}
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function save(req, res)
{
	const db = validateRequest(req, res)
	if (!db)
		return

	try {
		db.save()

		res.json({err: null, data: true})
	}
	catch (e) {
		logError(e.message, 'db-api :: update')
		res.json({err: 'Something went wrong!', data: null})
	}
}

/**
 * Initializes API and sets listeners.
 * Returns an Express router.
 *
 * @param {{Router: function}} express
 * @param {*}      dbHolder
 * @param {string} apiSecret
 *
 * @return {function} - Express router
 */
function dbApi(express, dbHolder, apiSecret)
{
	config.dbHolder  = dbHolder
	config.apiSecret = apiSecret

	const router = express.Router()

	router.post('/count',    count)
	router.post('/find',     find)
	router.post('/find-one', findOne)
	router.post('/insert',   insert)
	router.post('/remove',   remove)
	router.post('/update',   update)
	router.post('/save',     save)

	return router
}

module.exports = {
	dbApi
}
