import React from "react"
// import PropTypes from "prop-types"
import Button from "antd/lib/button"

import log from "../util/log"

const { ipcRenderer } = window.require("electron")

class AddTaskErrorMsg extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            errorMsg: '',
        }
    }

    componentDidMount() {
        ipcRenderer.send('add-task-error-msg-ready-to-show')
        ipcRenderer.on('error-msg', (event, errorMsg) => {
            this.setState({
                errorMsg: errorMsg,
            })
        })
    }

    closeAddTaskErrorMsg() {
        ipcRenderer.send('close-add-task-error-msg-win')
    }

    render() {
        const { errMsg } = this.state

        return (
            <div
                style={{
                    width: '300px',
                    height: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                className='add-task-error-msg'
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
                    <h3 style={{margin: 0}}>{errMsg}，请尝试重新提交任务。</h3>
                </div>
                <Button
                    type="primary"
                    style={{width: '100px'}}
                    onClick={this.closeAddTaskErrorMsg}
                >
                    确认
                </Button>
            </div>
        )
    }
}

// AddTaskErrorMsg.propTypes = {
//     amount: PropTypes.string.isRequired,
//     closeChargeWin: PropTypes.func.isRequired,
// }

export default AddTaskErrorMsg
