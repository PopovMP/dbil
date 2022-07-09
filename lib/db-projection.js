'use strict'

const {logError} = require('@popovmp/micro-logger')

const {cloneObj} = require('./utils')

/**
 * Gets a copy of `doc`, which has only the wanted (or without the unwanted) properties.
 * The doc's `_id` is included if not explicitly rejected.
 * The projection is ether inclusive or exclusive.
 *
 * @param { Object } doc
 * @param { Object } projection
 *
 * @return { Object }
 */
function dbProjection(doc, projection)
{
	if (typeof projection !== 'object' || Array.isArray(projection) || projection === null) {
		logError(`projection is not an object: ${ JSON.stringify(projection) }`, 'dbProjection')
		return
	}

	const projKeys = Object.keys(projection)

	if (projKeys.length === 0)
		return cloneObj(doc)

	const positiveKeysCount = Object.values(projection).reduce( (sum, val) => sum + (val ? 1: 0), 0 )
	if (positiveKeysCount > 0 && positiveKeysCount !== projKeys.length) {
		logError(`projection values are mixed: ${ JSON.stringify(projection) }`, 'dbProjection')
		return
	}

	const output = {}

	if (positiveKeysCount > 0) {
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
