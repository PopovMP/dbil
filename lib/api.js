"use strict";

const {logError, getLastError, resetLastError} = require("@popovmp/micro-logger");

/**
 * @typedef {Object} DbActionOptions
 *
 * @property {1|0} [query]
 * @property {1|0} [projection]
 * @property {1|0} [doc]
 * @property {1|0} [options]
 * @property {1|0} [update]
 */

/**
 * Executes a DB operation
 *
 * @param {ExpressReq} req
 * @param {ExpressRes} res
 * @param {{dbHolder, apiSecret :string}} env
 * @param {string} opName - DB operation's name
 * @param {DbActionOptions} params - {foo: 1, bar: 0} - foo is required, bar is optional
 *
 * @return {void}
 */
function dbAction(req, res, env, opName, params) {
    /**
     * @param {string} errMessage
     * @returns {void}
     */
    const reportError = (errMessage) => {
        logError(errMessage, "db-api :: dbAction");
        res.json({err: errMessage, data: null});
    };

    const {secret, dbName} = req.body;

    if (!secret || secret !== env.apiSecret)
        return reportError("wrong secret key");

    if (!dbName || !env.dbHolder[dbName])
        return reportError(`wrong DB name: ${dbName}`);

    const opArgs = [];

    for (const param of Object.keys(params)) {
        if (params[param] && !req.body[param])
            return reportError(`missing parameter: ${param}`);

        try {
            const argObj = typeof req.body[param] === "string"
                ? JSON.parse(req.body[param])
                : req.body[param] || {};

            if (typeof argObj !== "object" || Array.isArray(argObj) || argObj === null)
                return reportError(`parameter is not an object: ${param}`);

            opArgs.push(argObj);
        } catch (e) {
            return reportError(`cannot parse parameter: ${param}`);
        }
    }

    resetLastError(null);

    const data = env.dbHolder[dbName][opName].apply(null, opArgs);
    const err  = getLastError();

    res.json({err, data});
}

/**
 * Sets routes to an Express router
 *
 * @param {ExpressRouter} router
 * @param {{dbHolder, apiSecret: string}} env
 *
 * @return {ExpressRouter}
 */
function dbApi(router, env) {

    /**
     * @param {string} opName
     * @param {DbActionOptions} options
     * @return {(req: Request, res: Response) => void}
     */
    const makeAction = (opName, options) => (req, res) => dbAction(req, res, env, opName, options);

    router.post("/count",    makeAction("count",   {query: 1}));
    router.post("/find",     makeAction("find",    {query: 1, projection: 0}));
    router.post("/find-one", makeAction("findOne", {query: 1, projection: 0}));
    router.post("/insert",   makeAction("insert",  {doc: 1, options: 0}));
    router.post("/remove",   makeAction("remove",  {query: 1, options: 0}));
    router.post("/update",   makeAction("update",  {query: 1, update: 1, options: 0}));
    router.post("/save",     makeAction("save",    {}));

    return router;
}

module.exports = { dbApi };
