'use strict'

const {randomBytes} = require('crypto')

/**
 * Generates a random uid
 *
 * @param { number } len
 *
 * @return { string }
 */
function uid(len)
{
	return randomBytes(Math.ceil(Math.max(8, len * 2)))
		.toString('base64')
		.replace(/[+\/]/g, '')
		.slice(0, len)
}

/**
 * Clones an object
 *
 * @param { any } obj
 *
 * @return { any }
 */
function cloneObj(obj)
{
	if (!obj)
		return obj

	switch (typeof obj) {
		case 'string':
		case 'number':
		case 'boolean':
			return obj
		case 'object':
			return JSON.parse(JSON.stringify(obj))
		default:
			return obj
	}
}

module.exports = {
	uid,
	cloneObj,
}

