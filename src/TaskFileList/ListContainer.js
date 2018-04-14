import React from "react"
import PropTypes from "prop-types"
import Table from "antd/lib/table"

import log from "../util/log"

// const { ipcRenderer } = window.require("electron")

class ListContainer extends React.Component {
    constructor() {
        super()

        this.state = {
            selectedRowKeys: [],
            selectedRows: [],
        }

        this.onSelectedRowKeysChange = this.onSelectedRowKeysChange.bind(this)
    }

    componentDidMount() {
    }

    onSelectedRowKeysChange(selectedRowKeys, selectedRows) {
        this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedRows: selectedRows,
        })
        this.props.setDownloadList(selectedRows)
    }

    render() {
        const {
            taskFileList,
        } = this.props

        const styles = {
            container: {
                width: '100%',
                height: '500px',
            },
        }

        const columns = [
            {
                title: '文件名称',
                dataIndex: 'fileName',
                key: 'fileName',
                width: 400,
            },
            {
                title: '文件大小',
                dataIndex: 'fileSize',
                key: 'fileSize',
                width: 200,
                render: (text) => {
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

                    return formattedSize(text)
                }
            },
        ]

        const { selectedRowKeys } = this.state

        const rowSelection = {
            onChange: this.onSelectedRowKeysChange,
            selectedRowKeys: selectedRowKeys,
        }
          

        return (
            <div
                className='task-list'
                style={styles.container}
            >
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={taskFileList}
                    pagination={false}
                    scroll={{ y: 300 }}
                />
            </div>
        )
    }
}

ListContainer.propTypes = {
    taskFileList: PropTypes.array.isRequired,
    setDownloadList: PropTypes.func.isRequired,
}

export default ListContainer
