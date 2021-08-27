'use strict'

const {cloneObj} = require('./utils')

/**
 * Updates an document
 *
 * @param { Object } doc
 * @param { Object } update
 *
 * @return {void}
 */
function dbUpdate(doc, update) {
	for (const upKey of Object.keys(update)) {
		const upVal = update[upKey]
		switch (upKey) {
			case '$inc':
				for (const field of Object.keys(upVal)) {
					doc[field] += update[upKey][field]
				}
				break
			case '$set':
				for (const field of Object.keys(upVal)) {
					doc[field] = cloneObj(upVal[field])
				}
				break
			case '$unset':
				for (const field of Object.keys(upVal)) {
					if (upVal[field]) {
						delete doc[field]
					}
				}
				break
		}
	}
}

module.exports = {
	dbUpdate,
}
