/**
 * Blockbase test file
 * @author Blacksmith <code@blacksmith.studio>
 */
const should = require('should')
process.env['NODE_CONFIG_DIR'] = __dirname + '/config'

const blockbase = require('blockbase')

let driver
let application
blockbase({root: __dirname}, async app => {
    driver = app.drivers.mongo = require('../driver')(app)
    application = app
})

describe('Mongo driver tests', async function () {

    describe('Initialization', function () {
        it('should initialize the app', async function () {
            should.exist(application)
            should.exist(driver)
        })
    })

    describe('Architecture', function () {
        it('should have models', function () {
            should.exist(application.models)
            should.exist(application.models.user)
        })
    })


    let data = {firstname: 'toto'}
    describe('Models', function () {
        it('should save a model', async function () {
            const user = new application.models.user(data)
            try {
                const result = await user.save()
                should.exist(result)
                should.exist(result.data)
                should.exist(result.data.firstname)
                should.equal(result.data.firstname, data.firstname)
                data = result.data
            } catch (e) {
                should.not.exist(e)
            }
        })

        it('should read a model', async function () {
            const user = new application.models.user({id: data.id})
            try {
                const result = await user.read()
                should.exist(result)
                should.exist(result.data)
                should.equal(result.data.id, data.id)
                should.exist(result.data.firstname)
                should.equal(result.data.firstname, data.firstname)
            } catch (e) {
                should.not.exist(e)
            }
        })

        it('should update a model', async function () {
            const user = new application.models.user({...data, firstname: 'jéjé'})
            try {
                const result = await user.update()
                should.exist(result)

                should.exist(result.data)
                should.equal(result.data.id, user.data.id)
                should.exist(result.data.firstname)
                should.equal(result.data.firstname, user.data.firstname)
            } catch (e) {
                console.error(e)
                should.not.exist(e)
            }
        })

        it('should update a model again', async function () {
            const user = new application.models.user({...data, lastname: 'postman'})
            try {
                const result = await user.update()
                should.exist(result)

                should.exist(result.data)
                should.equal(result.data.id, user.data.id)
                should.exist(result.data.lastname)
                should.equal(result.data.lastname, user.data.lastname)
            } catch (e) {
                console.error(e)
                should.not.exist(e)
            }
        })

        it('should delete a model', async function () {
            const user = new application.models.user(data)
            try {
                const result = await user.delete()
                should.exist(result)
                should.equal(result, true)
            } catch (e) {
                should.not.exist(e)
            }
        })
    })
})
