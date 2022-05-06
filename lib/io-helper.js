'use strict'

const {logInfo} = require('@popovmp/micro-logger')
const {readFileSync, writeFile} = require('fs')
const {basename} = require('path')

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

	const db = fileContent
		? JSON.parse(fileContent)
		: {}

	logInfo(`DB loaded ${basename(filePath)}, records: ${Object.keys(db).length}`, 'loadDb')
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
