const {MongoClient, ObjectID} = require('mongodb')

/**
 * Mongo helper
 * @param app - Blockbase Application
 * @return {{upsertedId, upsertedCount, modifiedCount, matchedCount}|{nModified}|{deletedCount}|{insertedId, insertedCount}|Promise<CommandResult|*>|{updateMany(String, String, *=, Array): Promise<{nModified: Number}>, ObjectID: MongoClient.connect.ObjectID, find(String, String, Object): Promise<Array<*>>, create(String, String, (Object|Array), *=): Promise<{insertedCount: Number, insertedId: String}>, updateOne(String, String, *=, Object): Promise<{upsertedId, upsertedCount, modifiedCount, matchedCount}>, delete(String, String, *=): Promise<{deletedCount: Number}>, findOneAndUpdate(String, String, *=, *=, *=): Promise<{upsertedId, upsertedCount, modifiedCount, matchedCount}>}}
 */
module.exports = app => {
    const {host} = app.config.get('mongo')

    /**
     * Execute a MongoDB Function
     * @param database
     * @param collection
     * @param {function(Collection): (*)} func - MongoDB function to execute
     * @return {Promise<CommandResult|*>}
     * @private
     */
    const _execute = (database, collection, func) => {
        try {
            return MongoClient
                .connect(host, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                })
                .then(async client => {
                    const col = client.db(database).collection(collection)
                    const result = await func(col)
                    await client.close()
                    return result
                })
        } catch (e) {
            console.error('MongoDB error', e)
        }
    }

    return {

        /**
         * Raw Execute function
         */
        execute: _execute,

        /**
         * Export ObjectID
         */
        ObjectID,

        /**
         * Find objects
         * @param {String} database - Mongo Database, ex : 'football'
         * @param {String} collection - Mongo collection, ex : 'pages'
         * @param {Object} filter - Mongo filter options
         * @return {Promise<Array<*>>}
         */
        async find(database, collection, filter) {

            if ('_id' in filter && typeof filter._id === 'string')
                filter._id = new ObjectID(filter._id)

            const func = async col => col.find(filter).toArray()
            return _execute(database, collection, func)
        },

        /**
         * Create one or many objects
         * @param {String} database - Mongo Database, ex : 'football'
         * @param {String} collection - Mongo collection, ex : 'pages'
         * @param {object, array} data
         * @param {*=} options
         * @return {Promise<{insertedCount: Number, insertedId: String}>}
         */
        async create(database, collection, data, options) {
            /**
             * func
             * @param {Collection} col
             * @return {Promise<*>}
             */
            const func = async col => col[!Array.isArray(data) ? 'insertOne' : 'insertMany'](data)
            const {insertedId, insertedCount} = await _execute(database, collection, func)
            return {insertedId, insertedCount}
        },

        /**
         * Delete a single object
         * @param {String} database - Mongo Database, ex : 'football'
         * @param {String} collection - Mongo collection, ex : 'pages'
         * @param filter
         * @return {Promise<{deletedCount: Number}>}
         */
        async deleteOne(database, collection, filter) {
            const func = async col => col.deleteOne(filter)
            const {deletedCount} = await _execute(database, collection, func)
            return {deletedCount}

        },

        /**
         * Find a document and update it in one atomic operation, requires a write lock for the duration of the operation.$
         * @locks the document
         * @param {String} database - Mongo Database, ex : 'football'
         * @param {String} collection - Mongo collection, ex : 'pages'
         * @param filter
         * @param operation
         * @param options
         * @return {Promise<{ok, value}>}
         */
        async findOneAndUpdate(database, collection, filter, operation, options = {upsert: false}) {
            if (typeof operation !== 'object')
                throw new Error('MongoDB Error, expected operation to be an Object')
            const func = async col => col.findOneAndUpdate(filter, operation, options)
            const {ok, value} = await _execute(database, collection, func)
            return {ok, value}

        },
        /**
         * Update a single object
         * @param {String} database - Mongo Database, ex : 'football'
         * @param {String} collection - Mongo collection, ex : 'pages'
         * @param filter
         * @param {object} data
         * @return {Promise<{upsertedId, upsertedCount, modifiedCount, matchedCount}>}
         */
        async updateOne(database, collection, filter, data) {
            if (typeof data !== 'object')
                throw new Error('MongoDB Error, expected data to be an Object')
            const func = async col => col.updateOne(filter, {$set: data})
            const {modifiedCount, upsertedId, upsertedCount, matchedCount} = await _execute(database, collection, func)
            return {modifiedCount, upsertedId, upsertedCount, matchedCount}

        },

        /**
         * Update many objects
         * @param {String} database - Mongo Database, ex : 'football'
         * @param {String} collection - Mongo collection, ex : 'pages'
         * @param filter
         * @param {Array} data
         * @return {Promise<{nModified: Number}>}
         */
        async updateMany(database, collection, filter, data) {
            if (typeof data !== 'object')
                throw new Error('MongoDB Error, expected data to be an Object')
            const func = async col => col.updateMany(filter, {$set: data})
            const {nModified} = await _execute(database, collection, func)
            return {nModified}

        }
    }
}
