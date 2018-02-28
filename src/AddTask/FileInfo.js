import React from "react"
import PropTypes from "prop-types"

class FileInfo extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {
            fileName,
            fileIndex,
            removeFile,
        } = this.props

        return (
            <div className="ant-upload-list ant-upload-list-text">
                <div className="ant-upload-list-item ant-upload-list-item-done">
                    <div className="ant-upload-list-item-info">
                        <span>
                            <i className="anticon anticon-paper-clip"></i>
                            <div
                                className="ant-upload-list-item-name"
                                title={fileName}
                            >{fileName}</div>
                        </span>
                    </div>
                    <i
                        title="删除文件"
                        className="anticon anticon-cross"
                        onClick={() => {removeFile(fileIndex)}}
                    ></i>
                </div>
            </div>
        )
    }
}

FileInfo.propTypes = {
    fileName: PropTypes.string.isRequired,
    fileIndex: PropTypes.number.isRequired,
    removeFile: PropTypes.func.isRequired,
}

export default FileInfo
