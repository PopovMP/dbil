'use strict'

const {readFileSync, writeFile} = require('fs')

/**
 * Reads a DB from file
 *
 * @param {string|undefined} [filePath]
 *
 * @return {Object}
 */
function loadDb(filePath)
{
	const fileContent = readFileSync(filePath, 'utf8')

	return fileContent ? JSON.parse(fileContent) : {}
}

/**
 * Writes DB to disc
 *
 * @param {object} db
 * @param {string} filePath
 * @param {function(err: Error)} callback
 *
 * @return {void}
 */
function saveDb(db, filePath, callback)
{
	writeFile(filePath, JSON.stringify(db), {encoding: 'utf8'},
		callback)
}

module.exports = {
	loadDb,
	saveDb,
}
