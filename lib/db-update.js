'use strict'

/*
<update> = {
	? $inc   : {field: delta,   ...}, // Increments the field with delta or creates a field equal to delta
	? $push  : {field: value,   ...}, // Pushes a value to an array field
	? $rename: {field: newName, ...}, // Renames a field
	? $set   : {field: value,   ...}, // Sets a new value to a filed or creates a new field
	? $unset : {field: bool,    ...}, // Deletes a field
}
*/

const {logError} = require('@popovmp/micro-logger')
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
	if (typeof update !== 'object' || update === null || Array.isArray(update)) {
		logError(`update is not an object: ${update}`, 'dbUpdate')
		return false
	}

	let isUpdated = false

	for (const operator of Object.keys(update)) {
		const operand = update[operator]

		switch (operator) {
			case '$inc':
				for (const field of Object.keys(operand)) {
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
							logError(`Cannot $inc ${field} of type ${typeof doc[field]}`, 'dbUpdate')
							break
					}
				}
				break

			case '$push':
				for (const field of Object.keys(operand)) {
					if (! Array.isArray(doc[field]) ) {
						logError(`Cannot $push to a non-array field` , 'dbUpdate')
						continue
					}

					doc[field].push(operand[field])
					isUpdated = true
				}
				break

			case '$rename':
				for (const field of Object.keys(operand)) {
					if (field === '_id') {
						logError(`Cannot $rename _id`, 'dbUpdate')
						continue
					}

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
					if (field === '_id') {
						logError(`Cannot $set _id`, 'dbUpdate')
						continue
					}

					doc[field] = cloneObj(operand[field])
					isUpdated = true
				}
				break

			case '$unset':
				for (const field of Object.keys(operand)) {
					if (field === '_id') {
						logError(`Cannot $unset _id`, 'dbUpdate')
						continue
					}

					if (doc.hasOwnProperty(field) && operand[field]) {
						delete doc[field]
						isUpdated = true
					}
				}
				break

			default:
				logError(`Improper update operator ${operator}`, 'dbUpdate')
		}
	}

	return isUpdated
}

module.exports = {
	dbUpdate,
}
