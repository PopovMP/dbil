'use strict'

const { loadDb, saveDb } = require('./lib/io-helper')
const { dbQuery        } = require('./lib/db-query')
const { dbProjection   } = require('./lib/db-projection')
const { dbInsert       } = require('./lib/db-insert')
const { dbUpdate       } = require('./lib/db-update')

/**
 * @typedef {Object} RemoveOptions
 * @property {boolean} multi
 */

/**
 * @typedef {Object} UpdateOptions
 * @property {boolean} multi
 */

/**
 *  @param {string} [filePath]
 */

function getDb(filePath)
{
	const db = loadDb(filePath)

	/**
	 * Counts docs in DB.
	 *
	 * @param {Object} query
	 *
	 * @return {number}
	 * @private
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
	 * @private
	 */
	function find(query, projection = {})
	{
		const ids = dbQuery(db, query)
		const res = []

		for (const id of ids) {
			res.push( dbProjection(db[id], projection) )
		}

		return res
	}

	/**
	 * Finds a doc in DB. Returns the doc or `undefined`.
	 *
	 * @param {Object} query
	 * @param {Object} [projection]
	 *
	 * @return {Object | undefined}
	 * @private
	 */
	function findOne(query, projection = {})
	{
		const ids = dbQuery(db, query)

		return ids.length === 1
			? dbProjection(db[ids[0]], projection)
			: undefined
	}

	/**
	 * Inserts a new document to DB.
	 * Returns the ID of the inserted document.
	 * Returns an array of the inserted IDs in case of multiple documents.
	 * Returns `undefined` on a failure.
	 *
	 * @param {Object || Object[]} doc
	 *
	 * @return {string | string[] | undefined}
	 * @private
	 */
	function insert(doc)
	{
		if (Array.isArray(doc)) {
			const ids = []

			for (const singleDoc of doc) {
				ids.push(dbInsert(db, singleDoc))
			}

			return ids
		}

		return dbInsert(db, doc)
	}

	/**
	 * Remove documents.
	 * Returns the count of the removed docs
	 *
	 * @param {Object} query
	 * @param {RemoveOptions} [options]
	 *
	 * @return {number} Count of removed documents
	 * @private
	 */
	function remove(query, options)
	{
		const ids = dbQuery(db, query)

		if (ids.length === 0)
			return 0

		// check for a possibly unwanted remove of multiple docs
		if (ids.length > 1 && !options.multi)
			return 0

		for (const id of ids) {
			delete db[id]
		}

		return ids.length
	}

	/**
	 * Updates all documents matching the query.
	 * Returns the count of the updated docs.
	 *
	 * @param {Object} query
	 * @param {Object} update
	 * @param {UpdateOptions} [options]
	 *
	 * @return {number} Count of updated documents
	 */
	function update(query, update, options = {})
	{
		const ids = dbQuery(db, query)

		if (ids.length === 0)
			return 0

		// Check of possibly unwanted update of multiple docs
		if (ids.length > 1 && !options.multi)
			return 0

		let countUpdated = 0
		for (const id of ids) {
			countUpdated += dbUpdate(db[id], update) ? 1 : 0
		}

		return countUpdated
	}

	/**
	 * Saves DB to disc.
	 *
	 * @param {function(err?: Error)} [callback]
	 */
	function save(callback = save_redy)
	{
		saveDb(db, filePath, callback)
	}

	function save_redy(err)
	{
		if (err)
			console.error('Error with DB save: ' + err)
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

module.exports = {
	getDb,
}

