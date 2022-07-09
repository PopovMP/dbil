'use strict'

const {logError, getLastError, resetLastError} = require('@popovmp/micro-logger')

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
 * Parses the request and returns DB and parameters.
 * DB must be initialised before an API call.
 *
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 * @param {{dbHolder, apiSecret :string}} env
 * @param {string} methodName
 * @param {Object} params - {foo: 1, bar: 0} - foo is required, bar is optional
 *
 * @return {void}
 */
function dbAction(req, res, env, methodName, params)
{
	const {secret, dbName} = req.body

	if (!secret || secret !== env.apiSecret)
		return reportError(res, 'Wrong secret key')

	if (!dbName || !env.dbHolder[dbName])
		return reportError(res, 'Wrong DB name: ' + dbName)

	const dbArgs = []

	for (const param of Object.keys(params) ) {
		if (params[param] && !req.body[param])
			return reportError(res, 'Missing parameter: ' + param)

		try {
			dbArgs.push( JSON.parse(req.body[param] || '{}') )
		}
		catch(e) {
			return reportError(res, 'Cannot parse parameter: ' + param)
		}
	}

	resetLastError(null)

	const db   = env.dbHolder[dbName]
	const data = db[methodName].apply(null, dbArgs)
	const err  = getLastError()

	res.json({err, data})
}

/**
 * Logs and responds an error
 *
 * @param {ExpressRes} res
 * @param {string}     errMessage
 *
 * @return {void}
 */
function reportError(res, errMessage)
{
	logError(errMessage, 'db-api :: parseParams')
	res.json({err: errMessage, data: null})
}

/**
 * Gets a DB action
 *
 * @param {{dbHolder, apiSecret: string}} env
 * @param {string} method
 * @param {Object} params
 *
 * @return {function(req: ExpressReq, res: ExpressRes)}
 */
function makeAction(env, method, params)
{
	return (req, res) => dbAction(req, res, env, method, params)
}

/**
 * Initializes API and sets listeners.
 * Returns an Express router.
 *
 * @param {{Router: function}} express
 * @param {{dbHolder, apiSecret: string}} env
 *
 * @return {function} - Express router
 */
function dbApi(express, env)
{
	const router = express.Router()

	router.post('/count',    makeAction(env, 'count',   {query: 1}))
	router.post('/find',     makeAction(env, 'find',    {query: 1, projection: 0}))
	router.post('/find-one', makeAction(env, 'findOne', {query: 1, projection: 0}))
	router.post('/insert',   makeAction(env, 'insert',  {doc: 1, options: 0}))
	router.post('/remove',   makeAction(env, 'remove',  {query: 1, options: 0}))
	router.post('/update',   makeAction(env, 'update',  {query: 1, update: 1, options: 0}))
	router.post('/save',     makeAction(env, 'save',    {}))

	return router
}

module.exports = {
	dbApi
}
