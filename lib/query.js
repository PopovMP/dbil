'use strict'

/*
<query> = {
	? $and   : [<query>, ...],
	? $or    : [<query>, ...],
	? $not   : <query>,
	? $where : (doc) => boolean
	? <field>: {<operator>, ...}, // Operator set - one or several operators
	? <field>: <value>,
}

<operator> = // opKey: opVal
	| $exists  : boolean|number
	| $eq      : value
	| $gt      : string|number
	| $gte     : string|number
	| $in      : [value, ...]
	| $includes: string|number
	| $lt      : string|number
	| $lte     : string|number
	| $ne      : value
	| $nin     : [value, ...]
	| $type    : 'string'|'number'|'boolean'|'object'|'array'|'undefined'
 */

const {logError} = require('@popovmp/micro-logger')

/**
 * Matches query against DB and returns an array of the matched ids.
 *
 * @param {Object} db
 * @param {Object} query
 *
 * @return {string[]} - an array of matched ids or an empty array
 */
function dbQuery(db, query)
{
	if (typeof query !== 'object' || Array.isArray(query) || query === null) {
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

	return Object.keys(db).filter( id => evalQuery(db[id], query) )
}

/**
 * Matches query against DB and returns the first match ID or an empty string.
 *
 * @param {Object} db
 * @param {Object} query
 *
 * @return {string|undefined} - the _id of the selected doc or undefined
 */
function dbQueryOne(db, query)
{
	if (typeof query !== 'object' || Array.isArray(query) || query === null) {
		logError(`query is not an object: ${query}`, 'dbQueryOne')
		return
	}

	const queryKeys = Object.keys(query)

	// Gets a single doc by ID. Returns the doc's ID or undefined
	if (queryKeys.length === 1 && typeof query._id === 'string')
		return db[query._id] && query._id

	for (const id of Object.keys(db) ) {
		if ( evalQuery(db[id], query) )
			return id
	}
}

/**
 * Evaluates a query against a doc
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
				if (! quVal.every( e => evalQuery(doc, e) ))
					return false
				break

			case '$or':
				if (! quVal.some( e => evalQuery(doc, e) ))
					return false
				break

			case '$not':
				if ( evalQuery(doc, quVal) )
					return false
				break

			case '$where':
				if (! quVal(doc) )
					return false
				break

			default:
				if (typeof quVal === 'object' ? !evalOperatorSet(doc[field], quVal) : doc[field] !== quVal)
					return false
		}
	}

	return true
}

/**
 * Evaluates an operator set against a doc's value
 *
 * @param {any}    value - the value of the doc's filed of interest
 * @param {Object} opSet - {opKey: opVal, ...}
 *
 * @return {boolean}
 */
function evalOperatorSet(value, opSet)
{
	return Object.keys(opSet).every( opKey => evalOperator(value, opKey, opSet[opKey]) )
}

/**
 * Evaluates a query operator against a doc's value
 *
 * @param {any}    value - target value of the doc's filed of interest
 * @param {string} opKey - query opKey
 * @param {any}    opVal - query operand
 *
 * @return {boolean}
 */
function evalOperator(value, opKey, opVal)
{
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
			return (typeof value === 'string' || Array.isArray(value) ) && value.includes(opVal)
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
			return false
	}
}

module.exports = {
	dbQuery,
	dbQueryOne,
}
