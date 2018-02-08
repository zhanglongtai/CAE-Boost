import React from "react"
// import PropTypes from "prop-types"

import log from "../util/log"

const {ipcRenderer} = window.require("electron")

class TestDownload extends React.Component {
    constructor() {
        super()

        this.state = {
            downloading: false,
            percent: 0,
        }

        this.handleDownload = this.handleDownload.bind(this)
    }

    componentDidMount() {
        ipcRenderer.on('download-update', (event, percent) => {
            log('receive', percent)
            this.setState({
                percent: percent,
            })
        })
    }

    handleDownload() {
        this.setState({
            downloading: true,
            percent: 0,
        })
        ipcRenderer.send('download-file', 'http://127.0.0.1:3000/download/test.rar')
    }

    pauseDownload() {
        ipcRenderer.send('pause-download')
    }

    resumeDownload() {
        ipcRenderer.send('resume-download')
    }

    render() {
        const styles = {
            container: {
                width: 600,
                height: 600,
            },
        }

        let downloadContent
        if (this.state.downloading) {
            downloadContent = (
                <div>下载进度: {this.state.percent}%</div>
            )
        } else {
            downloadContent = null
        }


        return (
            <div style={styles.container}>
                <button onClick={this.handleDownload}>点击下载</button>
                <button onClick={this.pauseDownload}>暂停</button>
                <button onClick={this.resumeDownload}>恢复</button>
                { downloadContent }
            </div>
        )
    }
}

// TestDownload.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default TestDownload
