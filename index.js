'use strict'

const {logError} = require('@popovmp/micro-logger')

const {dbApi}               = require('./lib/api')
const {loadDb, saveDb}      = require('./lib/io')
const {dbQuery, dbQueryOne} = require('./lib/query')
const {dbProjection}        = require('./lib/projection')
const {dbInsert}            = require('./lib/insert')
const {dbUpdate}            = require('./lib/update')

const dbHolder = {}

/**
 * @typedef {Object} ModifyOptions
 *
 * @property {boolean} [multi]
 * @property {boolean} [skipSave]
 */

/**
 * @typedef {Object} InsertOptions
 *
 * @property {boolean} [skipSave]
 */

/**
 *  @param {string} [filePath]
 */
function makeDb(filePath)
{
	const inMemory = typeof filePath !== 'string' || filePath === ''

	const db = inMemory ? {} : loadDb(filePath)

	/**
	 * Counts docs in DB.
	 *
	 * @param {Object} query
	 *
	 * @return {number}
	 */
	function count(query)
	{
		return dbQuery(db, query).length
	}

	/**
	 * Finds docs in DB. Returns an array of docs.
	 *
	 * @param {Object} query
	 * @param {Object} [projection]
	 *
	 * @return {Object[]}
	 */
	function find(query, projection = {})
	{
		return dbQuery(db, query).map( (id) => dbProjection(db[id], projection) )
	}

	/**
	 * Finds the first match doc in DB. Returns a doc or undefined.
	 *
	 * @param {Object} query
	 * @param {Object} [projection]
	 *
	 * @return {Object | undefined}
	 */
	function findOne(query, projection = {})
	{
		/** @type {string | undefined} */
		const id = dbQueryOne(db, query)

		return id && dbProjection(db[id], projection)
	}

	/**
	 * Inserts a new document to DB.
	 * Returns the ID of the inserted document or `undefined` on a failure.
	 *
	 * @param {Object} doc
	 * @param {InsertOptions} [options]
	 *
	 * @return {string | undefined}
	 */
	function insert(doc, options = {})
	{
		/** @type {string | undefined} */
		const id = dbInsert(db, doc)

		if (id && !options.skipSave)
			save()

		return id
	}

	/**
	 * Remove documents.
	 * Returns the count of the removed docs
	 *
	 * @param {Object} query
	 * @param {ModifyOptions} [options]
	 *
	 * @return {number} Count of removed documents
	 */
	function remove(query, options = {})
	{
		/** @type {string[]} */
		const ids = dbQuery(db, query)

		if (ids.length === 0) return 0

		if (ids.length > 1 && !options.multi) {
			logError('`remove` canceled due to selection of multiple docs', 'remove')
			return 0
		}

		for (const id of ids)
			delete db[id]

		if (!options.skipSave)
			save()

		return ids.length
	}

	/**
	 * Updates all documents matching the query.
	 *
	 * @param {Object} query
	 * @param {Object} update
	 * @param {ModifyOptions} [options]
	 *
	 * @return {number} numUpdated - the number of updated documents
	 */
	function update(query, update, options = {})
	{
		/** @type {string[]} */
		const ids = dbQuery(db, query)

		if (ids.length === 0) return 0

		if (ids.length > 1 && !options.multi) {
			logError('`update` canceled due to selection of multiple docs', 'update')
			return 0
		}

		let numUpdated = 0
		for (const id of ids)
			numUpdated += dbUpdate(db[id], update)

		if (numUpdated > 0 && !options.skipSave)
			save()

		return numUpdated
	}

	/**
	 * Saves DB to disc.
	 */
	function save()
	{
		if (inMemory) return

		saveDb(db, filePath, (err) => {
			if (err)
				logError(`Error with DB save: ${err}`, 'save')
		})
	}

	return {
		count,
		find,
		findOne,
		insert,
		remove,
		update,
		save,
	}
}

/**
 * Gets DB
 *
 * @param {string} [filePath]
 * @param {string} [dbTag]
 */
function getDb(filePath, dbTag)
{
	if (!filePath)
		return makeDb()

	const holderKey = dbTag || filePath

	if (!dbHolder[holderKey])
		dbHolder[holderKey] = makeDb(filePath)

	return dbHolder[holderKey]
}

/**
 * Initializes a web API. Returns an Express router.
 *
 * @param {*}      express
 * @param {string} apiSecret
 *
 * @return {*} Express router
 */
function initApi(express, apiSecret)
{
	return dbApi(express, {dbHolder, apiSecret})
}

module.exports = {
	getDb,
	initApi,
}
