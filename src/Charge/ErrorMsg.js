import React from "react"
import PropTypes from "prop-types"
import Button from "antd/lib/button"

import log from "../util/log"

// const { ipcRenderer } = window.require("electron")

class ErrorMsg extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { errMsg, backTo, navTo } = this.props

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
                className='login-form-content'
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
                    <h3 style={{margin: 0}}>{errMsg}</h3>
                </div>
                <Button
                    type="primary"
                    style={{width: '100%'}}
                    onClick={navTo.bind(null, backTo)}
                >
                    返回
                </Button>
            </div>
        )
    }
}

ErrorMsg.propTypes = {
    errMsg: PropTypes.string.isRequired,
    backTo: PropTypes.string.isRequired,
    navTo: PropTypes.func.isRequired,
}

export default ErrorMsg
