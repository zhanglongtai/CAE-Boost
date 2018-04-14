import React from "react"
// import PropTypes from "prop-types"
import Icon from "antd/lib/icon"
import Button from "antd/lib/button"
import Spin from "antd/lib/spin"

import ListContainer from "./ListContainer"
import log from "../util/log"

const { ipcRenderer } = window.require("electron")
const { dialog } = window.require("electron").remote

const formattedList = function(list) {
    return list.map((item, index) => {
        const key = index
        const fileName = item.fileName
        const fileSize = item.fileSize

        return {
            key: key,
            fileName: fileName,
            fileSize: fileSize,
        }
    })
}

class TaskFileList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            taskID: '',
            taskFileList: {
                isFetching: true,
                success: false,
                list: [],
                errorMsg: '',
            },
            downloadList: [],
        }

        this.fetchTaskFileList = this.fetchTaskFileList.bind(this)
        this.setDownloadList = this.setDownloadList.bind(this)
        this.submitDownloadList = this.submitDownloadList.bind(this)
    }

    componentDidMount() {
        ipcRenderer.send('task-file-list-ready-to-show')

        ipcRenderer.on('task-id', (event, taskID) => {
            this.setState({
                taskID: taskID,
            }, this.fetchTaskFileList)
        })

        ipcRenderer.on('update-task-file-list', (event, args) => {
            const success = args.success
            
            if (success) {
                const fileList = formattedList(args.fileList)

                this.setState({
                    taskFileList: {
                        isFetching: false,
                        success: true,
                        list: fileList,
                        errorMsg: '',
                    }
                })
            } else {
                const errorMsg = args.errorMsg
                
                this.setState({
                    taskFileList: {
                        isFetching: false,
                        success: false,
                        list: [],
                        errorMsg: errorMsg,
                    }
                })
            }
        })
    }

    fetchTaskFileList() {
        const { taskID } = this.state

        this.setState({
            taskFileList: {
                isFetching: true,
                success: false,
                list: [],
                errorMsg: '',
            }
        })

        ipcRenderer.send('get-task-file-list', taskID)
    }

    closeTaskFileListWin() {
        ipcRenderer.send('close-task-file-list-win')
    }

    setDownloadList(list) {
        this.setState({
            downloadList: list,
        })
    }

    submitDownloadList() {
        dialog.showOpenDialog({
            properties: ['openDirectory'],
        }, (folderPathArray) => {
            const folderPath = folderPathArray[0]
            const fileList = this.state.downloadList.slice()
            const taskID = this.state.taskID

            ipcRenderer.send('download-file', {
                fileList: fileList,
                taskID: taskID,
                folderPath: folderPath,
            })

            this.closeTaskFileListWin()
        })
    }

    render() {
        const styles = {
            container: {
                width: 600,
                height: 500,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            },
            header: {
                WebkitAppRegion: 'drag',
                width: '95%',
                height: '49px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            },
            content: {
                width: '100%',
                height: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            },
            footer: {
                width: '95%',
                height: '49px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
        }

        const { taskFileList } = this.state

        let taskFileListContent = null
        if (taskFileList.isFetching) {
            taskFileListContent = (
                <div
                    className="task-file-list-loading-container"
                    style={{
                        width: '600px',
                        height: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Spin tip="获取数据中..." />
                </div>
            )
        } else {
            if (taskFileList.success) {
                taskFileListContent = <ListContainer
                    taskFileList={taskFileList.list}
                    setDownloadList={this.setDownloadList}
                />
            } else {
                taskFileListContent = (
                    <div
                        style={{
                            width: '600px',
                            height: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        className='task-list-error'
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 0 40px 0',
                            }}
                        >
                            <i
                                className="material-icons"
                                style={{
                                    fontSize: 40,
                                    margin: '0 10px 0 0',
                                    color: 'gray',
                                }}
                            >error_outline</i>
                            <h3 style={{margin: 0}}>{taskFileList.errorMsg}</h3>
                        </div>
                        <Button
                            type="primary"
                            style={{width: '30%'}}
                            onClick={this.fetchTaskFileList}
                        >点击重试</Button>
                    </div>
                )
            }
        }

        return (
            <div
                className='task-file-list-container'
                style={styles.container}
            >
                <div
                    className='task-file-list-header'
                    style={styles.header}
                >
                    <h2 style={{margin: 0}}>DlakeCloud</h2>
                    <div
                        onClick={this.closeTaskFileListWin}
                        style={{
                            WebkitAppRegion: 'no-drag',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        className='icon-container'
                    >
                        <Icon type="close" />
                    </div>
                </div>
                <div
                    className='divider'
                    style={{
                        borderBottom: '1px #e1e4e8 solid',
                        height: 0,
                        width: '100%',
                    }}
                />
                { taskFileListContent }
                <div
                    className='divider'
                    style={{
                        borderBottom: '1px #e1e4e8 solid',
                        height: 0,
                        width: '100%',
                    }}
                />
                <div
                    className='task-file-list-footer'
                    style={styles.footer}
                >
                    <Button
                        disabled={taskFileList.isFetching || (taskFileList.success === false)}
                        type="primary"
                        onClick={this.submitDownloadList}
                    >确认下载</Button>
                </div>
            </div>
        )
    }
}

// TaskFileList.propTypes = {
//     contentIndex: PropTypes.string.isRequired,
//     setContent: PropTypes.func.isRequired,
// }

export default TaskFileList
