import React from "react"
// import PropTypes from "prop-types"
import Input from "antd/lib/input"
import Icon from "antd/lib/icon"
import Select from "antd/lib/select"
import InputNumber from "antd/lib/input-number"
import Button from "antd/lib/button"

import FileInfo from "./FileInfo"
import { getSubmitTaskAPI } from "../api"
import log from "../util/log"

const Option = Select.Option

const { ipcRenderer } = window.require("electron")

class AddTask extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            accessToken: '',
            dragging: false,
            taskName: '',
            solver: '',
            /*
              fileName,
              filSize: "size unit",
              filePath: '../../',
            **/
            fileList: [],
            nodeTypeIndex: 0,
            nodeType: '',
            nodeNum: 8,
        }

        this.setTaskName = this.setTaskName.bind(this)
        this.setSolver = this.setSolver.bind(this)
        this.setFileList = this.setFileList.bind(this)
        this.handleDrop = this.handleDrop.bind(this)
        this.removeFile = this.removeFile.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.setNodeType = this.setNodeType.bind(this)
        this.setNodeNum = this.setNodeNum.bind(this)
        this.submitTask = this.submitTask.bind(this)
    }

    componentDidMount() {
        ipcRenderer.send('add-task-ready-to-show')

        ipcRenderer.on('user-info', (event, args) => {
            this.setState({
                accessToken: args['accessToken'],
            })
        })

        ipcRenderer.on('submit-node-type', (event, args) => {
            this.setNodeType(args.nodeTypeIndex, args.nodeType)
        })
    }

    setTaskName(event) {
        const name = event.target.value
        this.setState({
            taskName: name,
        })
    }

    setSolver(name) {
        this.setState({
            solver: name,
        })
    }

    setFileList(files) {
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

        const fileList = this.state.fileList.slice()
        for (const file of files) {
            const fileName = file.name
            // const fileSize = formattedSize(file.size)
            const fileSize = file.size
            const filePath = file.path
            fileList.push({
                fileName: fileName,
                fileSize: fileSize,
                filePath: filePath,
            })
        }

        this.setState({
            fileList: fileList,
        })
    }

    handleDrop(event) {
        event.preventDefault()

        const dt = event.dataTransfer
        const files = dt.files

        this.setFileList(files)

        this.setState({
            dragging: false,
        })
    }

    handleInputChange(event) {
        const files = event.target.files

        this.setFileList(files)
    }

    removeFile(index) {
        const fileList = this.state.fileList.slice()

        // delete file from list
        const newList = fileList.slice(0, index).concat(fileList.slice(index + 1))
        this.setState({
            fileList: newList,
        })
    }

    setNodeType(index, type) {
        this.setState({
            nodeTypeIndex: index,
            nodeType: type,
        })
    }

    setNodeNum(num) {
        this.setState({
            nodeNum: num,
        })
    }

    validatedTaskName(taskName) {
        // taskName is empty
        if (taskName === '') {
            return false
        } else {
            return true
        }
    }

    validatedSolver(solver) {
        // solver is empty
        if (solver === '') {
            return false
        } else {
            return true
        }
    }

    validatedFileList(fileList) {
        // fileList is empty
        if (fileList.length === 0) {
            return false
        } else {
            return true
        }
    }

    validatedNodeType(nodeType) {
        // nodeType is empty
        if (nodeType === '') {
            return false
        } else {
            return true
        }
    }

    validatedNodeNum(nodeNum) {
        // nodeNum is empty
        if (nodeNum === 0) {
            return false
        } else {
            return true
        }
    }

    validatedTaskInput(taskName, solver, fileList, nodeType, nodeNum) {
        if (this.validatedTaskName(taskName) === false) {
            ipcRenderer.send('open-add-task-error-msg-win', '任务未命名')
            return false
        }

        if (this.validatedSolver(solver) === false) {
            ipcRenderer.send('open-add-task-error-msg-win', '未选择求解器')
            return false
        }

        if (this.validatedFileList(fileList) === false) {
            ipcRenderer.send('open-add-task-error-msg-win', '未选择计算文件')
            return false
        }

        if (this.validatedNodeType(nodeType) === false) {
            ipcRenderer.send('open-add-task-error-msg-win', '未选择节点类型')
            return false
        }

        if (this.validatedNodeNum(nodeNum) === false) {
            ipcRenderer.send('open-add-task-error-msg-win', '未选择节点数量')
            return false
        }

        return true
    }

    submitTask() {
        const { taskName, solver, nodeType, nodeNum, accessToken, fileList } = this.state

        const taskFile = fileList.map((item) => {
            return item['fileName']
        })

        if (this.validatedTaskInput(taskName, solver, taskFile, nodeType, nodeNum) === false) {
            return false
        }

        const url = `${getSubmitTaskAPI()}`
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                'taskName': taskName,
                'solver': solver,
                'taskFile': JSON.stringify(taskFile),
                'nodeType': nodeType,
                'nodeNum': nodeNum,
                'cpuNum': nodeNum,
            }),
        })
            .then((response) => {
                if (response.status >= 200 && response.status < 500) {
                    return response
                } else {
                    if (response.status >= 500) {
                        const error = new Error('服务器错误')
                        error.response = response
                        throw error
                    }
                }
            })
            .then((response) => {
                return response.json()
            })
            .then((result) => {
                if (result['success']) {
                    ipcRenderer.send('upload-file', {
                        fileList: fileList,
                        taskName: taskName,
                    })
                    this.closeAddTaskWin()
                } else {
                    const error = new Error('未知错误')
                    throw error
                }
            })
            .catch((error) => {
                if (error.message === 'Failed to fetch') {
                    ipcRenderer.send('open-add-task-error-msg-win', '网络错误')
                } else {
                    ipcRenderer.send('open-add-task-error-msg-win', error.message)
                }
            })
    }

    closeAddTaskWin() {
        ipcRenderer.send('close-add-task-win')
    }

    openNodeTypeSelector() {
        ipcRenderer.send('open-node-type-selector-win')
    }

    render() {
        const styles = {
            container: {
                width: 600,
                height: 870,
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
                height: '770px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            },
            itemContainer: {
                width: '95%',
                marginTop: '20px',
                borderRadius: '3px',
                border: '1px #e1e4e8 solid',
                padding: '10px 10px 10px 10px',
            },
            footer: {
                width: '95%',
                height: '49px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
        }

        const { dragging, fileList, nodeType, nodeNum } = this.state

        const dropzone = (
            <div
                className={
                    dragging ?
                        "ant-upload ant-upload-drag ant-upload-drag-hover" :
                        "ant-upload ant-upload-drag"
                }
                onDragOver={(event) => {
                    this.setState({dragging: true})
                    event.preventDefault()
                }}
                onDragLeave={(event) => {
                    this.setState({dragging: false})
                    event.preventDefault()
                }}
                onDrop={this.handleDrop}
                onClick={() => {this.input.click()}}
            >
                <span tabIndex="0" className="ant-upload ant-upload-btn" role="button">
                    <input
                        type="file"
                        multiple=""
                        style={{display: "none"}}
                        ref={(input) => {this.input = input}}
                        onChange={this.handleInputChange}
                    />
                    <div className="ant-upload-drag-container">
                        <p className="ant-upload-drag-icon">
                            <i className="anticon anticon-inbox"></i>
                        </p>
                        <p className="ant-upload-text">选择计算文件</p>
                    </div>
                </span>
            </div>
        )

        const files = (
            <div>
                {
                    fileList.map((item, index) => {
                        return <FileInfo
                            key={index}
                            fileName={item.fileName}
                            fileIndex={index}
                            removeFile={this.removeFile}
                        />
                    })
                }
            </div>
        )

        return (
            <div
                className='add-task'
                style={styles.container}
            >
                <div
                    className='add-task-header'
                    style={styles.header}
                >
                    <h2 style={{margin: 0}}>DlakeCloud</h2>
                    <div
                        onClick={this.closeAddTaskWin}
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
                <div className='add-task-content' style={styles.content}>
                    <div style={styles.itemContainer}>
                        <h4>任务名称</h4>
                        <Input placeholder="设置任务名称" onChange={this.setTaskName} />
                    </div>
                    <div style={styles.itemContainer}>
                        <h4>求解器</h4>
                        <Select placeholder="选择求解器" style={{width: '100%'}} onChange={this.setSolver}>
                            <Option value="FLUENT">Fluent</Option>
                            <Option value="SU2">SU2</Option>
                            <Option value="OPENFOAM">OpenFoam</Option>
                        </Select>
                    </div>
                    <div style={styles.itemContainer}>
                        <h4>计算文件</h4>
                        { dropzone }
                        <h4 style={{margin: '10px 0 0 0'}}>文件列表</h4>
                        <div
                            className='file-list'
                            style={{
                                height: '100px',
                                overflowX: 'auto',
                            }}
                        >
                            { files }
                        </div>
                    </div>
                    <div style={styles.itemContainer}>
                        <h4>节点类型</h4>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <p style={{margin: '0 20px 0 0'}}>{nodeType}</p>
                            <Button onClick={this.openNodeTypeSelector}>选择节点类型</Button>
                        </div>
                    </div>
                    <div style={styles.itemContainer}>
                        <h4>节点个数</h4>
                        <InputNumber min={1} max={100} value={nodeNum} onChange={this.setNodeNum} />
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
                <div
                    className='add-task-footer'
                    style={styles.footer}
                >
                    <Button type="primary" onClick={this.submitTask}>提交</Button>
                </div>
            </div>
        )
    }
}

// AddTask.propTypes = {
//     contentIndex: PropTypes.string.isRequired,
//     setContent: PropTypes.func.isRequired,
// }

export default AddTask
