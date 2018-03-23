const { app } = require("electron")
const fs = require("fs")

class StoreConfig {
    constructor() {
        this.path = app.getAppPath()
    }

    set(key, value) {
        let config

        try {
            const fileContent = fs.readFileSync(`${this.path}/config.json`)
            config = JSON.parse(fileContent.toString())
            config[key] = value
        } catch (error) {
            console.error(error)
        }

        try {
            fs.writeFileSync(
                `${this.path}/config.json`,
                JSON.stringify(config, null, 4)
            )
        } catch (error) {
            console.error(error)
        }
    }

    get(key) {
        try {
            const fileContent = fs.readFileSync(`${this.path}/config.json`)
            const value = JSON.parse(fileContent.toString())[key]
            return value
        } catch (error) {
            console.error(error)
        }
    }
}

module.exports = StoreConfig
