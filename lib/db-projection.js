'use strict'

const {logError} = require('@popovmp/micro-logger')

const {cloneObj} = require('./utils')

/**
 *
 * @param { Object } doc
 * @param { Object } projection
 *
 * @return { Object }
 */
function dbProjection(doc, projection)
{
	if (typeof projection !== 'object' || projection === null || Array.isArray(projection) ) {
		logError(`projection is not an object: ${projection}`, 'dbProjection')
		return
	}

	const projKeys = Object.keys(projection)

	if (projKeys.length === 0)
		return cloneObj(doc)

	const output = {}

	if (projection[projKeys[0]]) {
		for (const key of projKeys)
			output[key] = cloneObj(doc[key])

		output._id = doc._id
	}
	else {
		for (const key of Object.keys(doc) ) {
			if (! Object.hasOwn(projection, key) )
				output[key] = cloneObj(doc[key])
		}
	}

	return output
}

module.exports = {
	dbProjection,
}
