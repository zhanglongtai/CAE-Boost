const { Transform } = require('stream')

const transform = function(chunk, encoding, callback) {
    this.transformBytes += chunk.length
    this.emit('upload-progress', this.transformBytes)
    callback(null, chunk)
}

const flush = function(callback) {
    this.emit('upload-end')
    callback()
}

const options = {
    transform: transform,
    flush: flush,
}

class Progress extends Transform {
    constructor() {
        super(options)

        this.transformBytes = 0
    }
}

module.exports = Progress
