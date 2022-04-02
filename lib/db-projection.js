'use strict'

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
	const projKeys = Object.keys(projection)

	if (projKeys.length === 0)
		return cloneObj(doc)

	const output = {}

	if (projection[projKeys[0]]) {
		for (const key of projKeys) {
			output[key] = cloneObj(doc[key])
		}

		output._id = doc._id
	}
	else {
		for (const key of Object.keys(doc) ) {
			if (! projection.hasOwnProperty(key) )
				output[key] = cloneObj(doc[key])
		}
	}

	return output
}

module.exports = {
	dbProjection,
}
