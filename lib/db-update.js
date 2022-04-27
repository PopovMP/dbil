'use strict'

/*
<update> = {
	? $inc   : {filed: delta,   ...},
	? $rename: {filed: newName, ...},
	? $set   : {filed: value,   ...},
	? $unset : {filed: isUnset, ...},
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
					if (field === '_id')
						continue

					switch (typeof doc[field]) {
						case 'number':
							doc[field] += operand[field]
							isUpdated = true
							break
						case 'undefined':
							doc[field] = operand[field]
							isUpdated = true
							break
						default:
							break
					}
				}
				break

			case '$rename':
				for (const field of Object.keys(operand)) {
					if (field === '_id')
						continue

					const newName = String(operand[field])
					if (doc.hasOwnProperty(field) && !doc.hasOwnProperty(newName)) {
						doc[newName] = cloneObj(doc[field])
						delete doc[field]
						isUpdated = true
					}
				}
				break

			case '$set':
				for (const field of Object.keys(operand)) {
					if (field === '_id')
						continue

					doc[field] = cloneObj(operand[field])
					isUpdated = true
				}
				break

			case '$unset':
				for (const field of Object.keys(operand)) {
					if (field === '_id')
						continue

					if (doc.hasOwnProperty(field) && operand[field]) {
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
