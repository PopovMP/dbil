'use strict'

/*
<update> = {
	? $inc  : {filed: delta, ...},
	? $set  : {filed: value, ...},
	? $unset: {filed: isUnset, ...},
}
 */

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

	for (const operator of Object.keys(update)) {
		const operand = update[operator]

		switch (operator) {
			case '$inc':
				for (const field of Object.keys(operand)) {
					if (field !== '_id' && typeof doc[field] === 'number') {
						doc[field] += operand[field]
						isUpdated = true
					}
				}
				break

			case '$set':
				for (const field of Object.keys(operand)) {
					if (field !== '_id') {
						doc[field] = cloneObj(operand[field])
						isUpdated = true
					}
				}
				break

			case '$unset':
				for (const field of Object.keys(operand)) {
					if (field !== '_id' && doc.hasOwnProperty(field) && operand[field]) {
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
