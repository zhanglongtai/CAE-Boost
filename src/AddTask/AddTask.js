import React from "react"
// import PropTypes from "prop-types"
import Input from "antd/lib/input"
import Icon from "antd/lib/icon"
import Select from "antd/lib/select"
import InputNumber from "antd/lib/input-number"
import Button from "antd/lib/button"

import FileInfo from "./FileInfo"
import log from "../util/log"

const Option = Select.Option

const { ipcRenderer } = window.require("electron")

class AddTask extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
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
            nodeNum: 0,
        }

        this.setTaskName = this.setTaskName.bind(this)
        this.setSolver = this.setSolver.bind(this)
        this.setFileList = this.setFileList.bind(this)
        this.handleDrop = this.handleDrop.bind(this)
        this.removeFile = this.removeFile.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.setNodeType = this.setNodeType.bind(this)
        this.setNodeNum = this.setNodeNum.bind(this)
    }

    componentDidMount() {
        ipcRenderer.on('submit-node-type', (event, args) => {
            this.setNodeType(args.nodeTypeIndex, args.nodeType)
        })
    }

    setTaskName(name) {
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
            const fileSize = formattedSize(file.size)
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

        const { dragging, fileList, nodeType } = this.state

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
                            <Option value="fluent">Fluent</Option>
                            <Option value="su2">SU2</Option>
                            <Option value="openfoam">OpenFoam</Option>
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
                        <InputNumber min={1} max={100} defaultValue={8} onChange={this.setNodeNum} />
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
                    <Button type="primary">提交</Button>
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
