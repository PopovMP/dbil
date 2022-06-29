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
 * @property {function(object)} json - sends a JSON response
 */

/**
 * Validates the request. If it is OK, it returns DB.
 * DB must be initialised before an API call.
 *
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function parseParams(req, res, params)
{
	const secret = req.body['secret']
	const dbName = req.body['dbName']
	const result = {}

	if (secret !== config.apiSecret) {
		reportError(res, 'Wrong secret key')
		return result
	}

	if (!dbName || !config.dbHolder[dbName]) {
		reportError(res, 'Wrong DB name: ' + dbName)
		return result
	}

	for (const param of Object.keys(params)) {
		if (params[param] && !req.body[param]) {
			reportError(res, 'Missing parameter: ' + param)
			return result
		}

		try {
			result[param] = JSON.parse(req.body[param] || {})
		}
		catch(e) {
			reportError(res, 'Cannot parse parameter: ' + param)
			return result
		}
	}

	result.db = config.dbHolder[dbName]

	return result
}

function reportError(res, message)
{
	logError(message, 'db-api :: parseParams')
	res.json({err: 'Something went wrong!', data: null})
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function count(req, res)
{
	const params = {query: 1}
	const {db, query} = parseParams(req, res, params)
	if (!db) return

	const count = db.count(query)

	res.json({err: null, data: count})
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function find(req, res)
{
	const params = {query: 1, projection: 0}
	const {db, query, projection} = parseParams(req, res, params)
	if (!db) return

	const docs = db.find(query, projection)

	res.json({err: null, data: docs})
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function findOne(req, res)
{
	const params = {query: 1, projection: 0}
	const {db, query, projection} = parseParams(req, res, params)
	if (!db) return

	const doc = db.findOne(query, projection)

	res.json({err: null, data: doc || null})
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function insert(req, res)
{
	const params = {doc: 1, options: 0}
	const {db, doc, options} = parseParams(req, res, params)
	if (!db) return

	const id = db.insert(doc, options)

	res.json({err: null, data: id || null})
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function remove(req, res)
{
	const params = {query: 1, options: 0}
	const {db, query, options} = parseParams(req, res, params)
	if (!db) return

	const numRemoved = db.remove(query, options)

	res.json({err: null, data: numRemoved})
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function update(req, res)
{
	const params = {query: 1, update: 1, options: 0}
	const {db, query, update, options} = parseParams(req, res, params)
	if (!db) return

	const numUpdated = db.update(query, update, options)

	res.json({err: null, data: numUpdated})
}

/**
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 */
function save(req, res)
{
	const params = {}
	const {db} = parseParams(req, res, params)
	if (!db) return

	db.save()

	res.json({err: null, data: true})
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
