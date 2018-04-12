const EventEmitter = require('events')
const fs = require("fs")
const AWS = require("aws-sdk")

const Progress = require("./progress")

// ========== util func ==========
const log = function() {
    console.log.apply(null, arguments)
}
// ========== util func ==========

class S3Client {
    constructor(options) {
        /* AWS S3 params
         * options = {
         *     accessKeyId: 'N3Z92X0RX6J4FXQ70JHX',
         *     secretAccessKey: 'AVdNLrkNdd72uM3XbIvfJ8YAe6lsz5zGrTgk8KuG',
         *     endpoint: 'http://10.0.0.11:7480 ',
         *     s3ForcePathStyle: true,
         * }
        */
        this.client = new AWS.S3(options)

        this.maxSinglePartSize = 20 * 1024 * 1024
    }

    uploadFile(filePath, fileName, bucketName) {
        const uploadSmallFile = function(self, filePath, fileSize, bucketName, instance, total) {
            const fileStream = fs.createReadStream(filePath)

            const transform = new Progress()
            fileStream.pipe(transform)

            const params = {
                ContentLength: fileSize,
                Bucket: bucketName,
                Key: fileName,
                Body: transform,
            }

            // fileStream.on('data', (chunk) => {
            //     log('upload chunk', chunk)
            // })

            // fileStream.on('end', () => {
            //     log('upload end')
            // })

            transform.on('upload-progress', (data) => {
                instance.emit('upload-progress', {
                    total: total,
                    uploaded: data,
                })
            })

            transform.on('upload-end', () => {
                instance.emit('upload-end')
            })

            const r = self.client.putObject(params, (err, data) => {
                if (err) {
                    log('upload error', err)
                    instance.emit('upload-error', err)
                } else {
                    log('upload finished', data)
                    // self.client.listObjects({Bucket: bucketName}, (err, data) => {
                    //     if (err) {
                    //         log('list objects err', err)
                    //     } else {
                    //         log('list objects', data)
                    //     }
                    // })
                }
            })

            r.on('httpUploadProgress', (progress, response) => {
                log('httpUploadProgress', progress)
            })
        }

        const uploadInstance = new EventEmitter()

        let totalSize = 0

        fs.stat(filePath, (err, stats) => {
            if (err) {
                log(err)
            } else {
                totalSize = stats.size
                uploadSmallFile(this, filePath, totalSize, bucketName, uploadInstance, totalSize)
            }
        })

        return uploadInstance
    }

    downloadFile(filePath, fileName, bucketName) {}
}

module.exports = S3Client
