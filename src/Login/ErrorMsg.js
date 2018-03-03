import React from "react"
import PropTypes from "prop-types"
import Icon from "antd/lib/icon"
import Alert from "antd/lib/alert"
import Button from "antd/lib/button"

import log from "../util/log"

// const { ipcRenderer } = window.require("electron")

class ErrorMsg extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {
            errMsg,
            navToLogin,
        } = this.props

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
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon
                    style={{
                        width: '100%',
                        height: '100px',
                        marginBottom: '30px',
                    }}
                />
                <Button
                    type="primary"
                    style={{width: '100%'}}
                    onClick={() => {navToLogin('form-content')}}
                >
                    返回登录界面
                </Button>
            </div>
        )
    }
}

ErrorMsg.propTypes = {
    errMsg: PropTypes.string.isRequired,
    navToLogin: PropTypes.func.isRequired,
}

export default ErrorMsg
