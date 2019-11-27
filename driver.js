module.exports = function (app) {
    const {create, findOneAndUpdate, deleteOne, find} = require('./mongo')(app)

    const Logger = app.drivers.logger

    if (!app.config.has('mongo'))
        return Logger.error('Drivers', 'Can not init mongo, no valid config')
    const {database, strict} = app.config.get('mongo')

    /**
     * @namespace app.drivers.mongo
     */
    return {
        async save(item) {

            if (!item.valid()) throw new Error(item.validate().error)

            try {
                const {insertedId, insertedCount} = await create(database, item.params.type, item.data)
                if (!insertedCount) return null
                item.data.id = insertedId
                return item
            } catch (e) {
                throw e
            }
        },
        async read(item) {

            if (!item.data.id)
                throw new Error('Mongo Driver - Object ID is required')
            if (!item.valid()) throw new Error(item.validate().error)

            try {
                const [result] = await find(database, item.params.type, {_id: item.data.id})
                if (!result) return null
                item.body({...result, id: result._id.toString()})
                return item
            } catch (e) {
                throw e
            }
        },
        async update(item) {

            if (!item.data.id)
                throw new Error('Mongo Driver - Object ID is required')
            if (!item.valid()) throw new Error(item.validate().error)

            try {
                const {ok, value} = await findOneAndUpdate(database, item.params.type, {_id: item.data.id}, {$set: item.data})
                if (strict && !ok)
                    throw new Error('Mongo Driver - No item to update')
                item.body({...value, id: value._id.toString()})
                return item
            } catch (e) {
                throw e
            }
        },
        async delete(item) {

            if (!item.data.id)
                throw new Error('Mongo Driver - Object ID is required')
            if (!item.valid()) throw new Error(item.validate().error)

            try {
                const {deletedCount} = await deleteOne(database, item.params.type, {_id: item.data.id})
                if (strict && !deletedCount)
                    throw new Error('Mongo Driver - No item to delete')
                return deletedCount > 0
            } catch (e) {
                throw e
            }
        }
    }
}
