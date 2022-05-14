'use strict'

/*
<query> = {
	? $and   : [<query>...],
	? $or    : [<query>...],
	? $not   : <query>,
	? $where : (doc) => boolean
	? <field>: <operator>,
	? <field>: <value>,
}

<operator> =
	| {$exists  : <value>}
	| {$eq      : <value>}
	| {$gt      : <value>}
	| {$gte     : <value>}
	| {$in      : [<value>...]}
	| {$includes: <value>}
	| {$lt      : <value>}
	| {$lte     : <value>}
	| {$ne      : <value>}
	| {$nin     : [<value>...]}
	| {$type    : <value>}
 */

const {logError} = require('@popovmp/micro-logger')

/**
 * Matches query against DB and returns an array of the matched ids.
 *
 * @param { Object } db
 * @param { Object } query
 *
 * @return { string[] } - list of matched ids
 */
function dbQuery(db, query)
{
	if (typeof query !== 'object' || query === null || Array.isArray(query)) {
		logError(`query is not an object: ${query}`, 'dbQuery')
		return []
	}

	const queryKeys = Object.keys(query)

	// Gets all IDs if query is empty
	if (queryKeys.length === 0)
		return Object.keys(db)

	// Gets a single doc by ID
	if (queryKeys.length === 1 && typeof query._id === 'string')
		return db[query._id] ? [query._id] : []

	const ids = []

	for (const id of Object.keys(db) ) {
		if ( evalQuery(db[id], query) )
			ids.push(id)
	}

	return ids
}

/**
 * Matches query against DB and returns the first match ID or an empty string.
 *
 * @param { Object } db
 * @param { Object } query
 *
 * @return { string }
 */
function dbQueryOne(db, query)
{
	if (typeof query !== 'object' || query === null || Array.isArray(query)) {
		logError(`query is not an object: ${query}`, 'dbQuery')
		return ''
	}

	const queryKeys = Object.keys(query)

	// Query cannot be empty
	if (queryKeys.length === 0) {
		logError(`query cannot be empty: ${query}`, 'dbQuery')
		return ''
	}

	// Gets a single doc by ID
	if (queryKeys.length === 1 && typeof query._id === 'string')
		return db[query._id] ? query._id : ''

	for (const id of Object.keys(db) ) {
		if ( evalQuery(db[id], query) )
			return id
	}

	return ''
}

/**
 *
 * @param {Object} doc
 * @param {Object} query
 *
 * @return {boolean}
 */
function evalQuery(doc, query)
{
	for (const field of Object.keys(query) ) {
		const quVal = query[field]

		switch (field) {
			case '$and':
				if (! quVal.every(e => evalQuery(doc, e)) )
					return false
				break

			case '$or':
				if (! quVal.some(e => evalQuery(doc, e)) )
					return false
				break

			case '$not':
				if ( evalQuery(doc, quVal) )
					return false
				break

			case '$where':
				if (!quVal(doc))
					return false
				break

			default:
				if (!(typeof quVal === 'object'
						? evalOperator(doc[field], quVal)
						: doc[field] === quVal))
					return false
		}
	}

	return true
}

/**
 *
 * @param {any} value
 * @param {Object} operator
 *
 * @return {boolean}
 */
function evalOperator(value, operator)
{
	const opKey = Object.keys(operator)[0]
	const opVal = operator[opKey]

	switch (opKey) {
		case '$exists':
			return opVal ? value !== undefined : value === undefined
		case '$lt':
			return value < opVal
		case '$lte':
			return value <= opVal
		case '$gt':
			return value > opVal
		case '$gte':
			return value >= opVal
		case '$in':
			return opVal.includes(value)
		case '$includes':
			return (typeof value === 'string' || Array.isArray(value)) && value.includes(opVal)
		case '$nin':
			return !opVal.includes(value)
		case '$eq':
			return value === opVal
		case '$ne':
			return value !== opVal
		case '$regex':
			return opVal.exec(value)
		case '$type':
			return opVal === 'array' ? Array.isArray(value) : typeof value === opVal
		default:
			logError(`Wrong query operator: ${opKey}`, 'evalOperator')
			return false
	}
}

module.exports = {
	dbQuery,
	dbQueryOne,
}
