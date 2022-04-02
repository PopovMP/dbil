'use strict'

const {cloneObj} = require('./utils')

/**
 * Updates an document
 *
 * @param { Object } doc
 * @param { Object } update
 *
 * @return {boolean}
 */
function dbUpdate(doc, update)
{
	let isUpdated = false

	for (const upKey of Object.keys(update)) {
		const upVal = update[upKey]

		switch (upKey) {
			case '$inc':
				for (const field of Object.keys(upVal)) {
					if (field !== '_id') {
						doc[field] += update[upKey][field]
						isUpdated = true
					}
				}
				break

			case '$set':
				for (const field of Object.keys(upVal)) {
					if (field !== '_id') {
						doc[field] = cloneObj(upVal[field])
						isUpdated = true
					}
				}
				break

			case '$unset':
				for (const field of Object.keys(upVal)) {
					if (upVal[field] && field !== '_id') {
						delete doc[field]
						isUpdated = true
					}
				}
				break
		}
	}

	return isUpdated
}

module.exports = {
	dbUpdate,
}
