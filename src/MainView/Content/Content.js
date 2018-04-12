import React from "react"
// import PropTypes from "prop-types"

import Menu from "./Menu"
import Upload from "./Upload"
import Task from "./Task"
import Download from "./Download"
import log from "../../util/log"

const {ipcRenderer} = window.require("electron")

const formattedUploadList = function(list) {
    return list.map((item, index) => {
        const formattedSize = function(fileSize) {
            let size = fileSize
            let unit = "B"
            if (size >= 1024*1024) {
                size = (size / 1024 / 1024).toFixed(1)
                unit = "MB"
            } else if (size >= 1024){
                unit = "KB"
                size = Math.round(size / 1024)
            } else {
                size = Math.round(size)
            }

            return `${size} ${unit}`
        }

        const formattedSpeed = function(speed) {
            let s = speed
            let unit = "B/S"

            if (s >= 1024*1024) {
                s = (s / 1024 / 1024).toFixed(1)
                unit = "MB/S"
            } else if (s >= 1024){
                unit = "KB/S"
                s = (s / 1024).toFixed(1)
            } else {
                s = (s).toFixed(1)
            }

            return `${s} ${unit}`
        }

        const key = index
        const fileName = item.fileName
        const state = 'uploading'
        const taskName = item.taskName
        
        let percent
        if (item.chunkSize.total !==0 ) {
            percent = (item.chunkSize.uploaded / item.chunkSize.total * 100).toFixed(1)
            percent = `${percent}%`
        } else {
            percent = '-'
        }

        const speed = formattedSpeed(item.speed)
        const size = formattedSize(item.fileSize)

        return {
            key: key,
            fileName: fileName,
            state: state,
            taskName: taskName,
            percent: percent,
            speed: speed,
            size: size,
        }
    })
}

const formattedFinishedList = function(list) {
    return list.map((item, index) => {
        const formattedSize = function(fileSize) {
            let size = fileSize
            let unit = "B"
            if (size >= 1024*1024) {
                size = Math.round(size / 1024 / 1024)
                unit = "MB"
            } else if (size >= 1024){
                unit = "KB"
                size = Math.round(size / 1024)
            } else {
                size = Math.round(size)
            }

            return `${size} ${unit}`
        }

        const key = index
        const fileName = item.fileName
        const state = 'finished'
        const taskName = item.taskName
        const percent = '-'
        const speed = '-'
        const size = formattedSize(item.fileSize)

        return {
            key: key,
            fileName: fileName,
            state: state,
            taskName: taskName,
            percent: percent,
            speed: speed,
            size: size,
        }
    })
}

const formattedFailList = function(list) {
    return list.map((item, index) => {
        const formattedSize = function(fileSize) {
            let size = fileSize
            let unit = "B"
            if (size >= 1024*1024) {
                size = Math.round(size / 1024 / 1024)
                unit = "MB"
            } else if (size >= 1024){
                unit = "KB"
                size = Math.round(size / 1024)
            } else {
                size = Math.round(size)
            }

            return `${size} ${unit}`
        }

        const key = index
        const fileName = item.fileName
        const state = 'fail'
        const taskName = item.taskName
        const percent = '-'
        const speed = '-'
        const size = formattedSize(item.fileSize)

        return {
            key: key,
            fileName: fileName,
            state: state,
            taskName: taskName,
            percent: percent,
            speed: speed,
            size: size,
        }
    })
}

class Content extends React.Component {
    constructor() {
        super()

        this.state = {
            contentIndex: 1,
            uploadList: [],
            finishedList: [],
        }

        this.setContent = this.setContent.bind(this)
    }

    componentDidMount() {
        ipcRenderer.on('update-upload-file', (event, args) => {
            log('receive-allfile', args)
            const uploadList = formattedUploadList(args.uploadList)
            const finishedList = formattedFinishedList(args.finishedList)
            const failList = formattedFailList(args.failList)

            this.setState({
                uploadList: uploadList,
                finishedList: finishedList,
                failList: failList,
            })
        })
    }

    setContent(index) {
        this.setState({
            contentIndex: index,
        })
    }

    render() {
        const styles = {
            container: {
                flexGrow: 1,
                minWidth: 1000,
                width: '100%',
                minHeight: 700,
                display: 'flex',
                flexDirection: 'column',
            },
        }

        const { contentIndex, uploadList, finishedList, failList } = this.state

        let content
        switch (contentIndex) {
            case 0:
                content = <Upload
                    uploadList={uploadList}
                    finishedList={finishedList}
                    failList={failList}
                />
                break
            case 1:
                content = <Task />
                break
            case 2:
                content = <Download />
                break
            default:
                content = null
                break
        }

        return (
            <div
                className='content'
                style={styles.container}
            >
                <Menu
                    contentIndex={`${contentIndex}`}
                    setContent={this.setContent}
                />
                { content }
            </div>
        )
    }
}

// Content.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Content
