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

<operator> = {$eq : <value>}
           | {$gt : <value>}
		   | {$gte: <value>}
		   | {$in : [<value>...]}
		   | {$lt : <value>}
		   | {$lte: <value>}
		   | {$ne : <value>}
		   | {$nin: [<value>...]}
 */

/**
 * Matches query against DB and returns an array of the matched ids.
 *
 * @param { Object } db
 * @param { Object } query
 *
 * @return { string[] } - list of matched ids
 */
function dbQuery(db, query) {
	if (Object.keys(query).length === 0) {
		return Object.keys(db)
	}

	const ids = []

	for (const id of Object.keys(db)) {
		if (evalQuery(db[id], query)) {
			ids.push(id)
		}
	}

	return ids
}

/**
 *
 * @param {Object} doc
 * @param {Object} query
 *
 * @return {boolean}
 */
function evalQuery(doc, query) {

	for (const field of Object.keys(query)) {
		const quVal = query[field]

		switch (field) {
			case '$and':
				if (!quVal.every(e => evalQuery(doc, e))) {
					return false
				}
				break

			case '$or':
				if (!quVal.some(e => evalQuery(doc, e))) {
					return false
				}
				break

			case '$not':
				if (evalQuery(doc, quVal)) {
					return false
				}
				break

			case '$where':
				if (!quVal(doc)) {
					return false
				}
				break

			default:
				if (!(typeof quVal === 'object'
						? evalOperator(doc[field], quVal)
						: doc[field] === quVal)) {
					return false
				}
		}
	}

	return true
}

/**
 *
 * @param {string|number|boolean} value
 * @param {Object} operator
 *
 * @return {boolean}
 */
function evalOperator(value, operator) {
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
		case '$nin':
			return !opVal.includes(value)
		case '$eq':
			return value === opVal
		case '$ne':
			return value !== opVal
		case '$regex':
			return opVal.exec(value)
		default:
			return false
	}
}

module.exports = {
	dbQuery,
}
