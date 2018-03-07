import React from "react"
import PropTypes from "prop-types"
import Button from "antd/lib/button"

import log from "../util/log"

const { ipcRenderer } = window.require("electron")

class MsgContent extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const {
            username,
            msgType,
            token,
        } = this.props

        if (msgType === 'success') {
            this.timer = setTimeout(() => {
                ipcRenderer.send('close-register-win-open-main-view-win', {
                    username: username,
                    token: token,
                })
            }, 3000)
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    render() {
        const {
            msgType,
            msg,
            navToRegister,
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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 0 40px 0',
                    }}
                >
                    {msgType === 'error' ?
                        <i
                            className="material-icons"
                            style={{
                                fontSize: 40,
                                margin: '0 10px 0 0',
                                color: 'gray',
                            }}
                        >error_outline</i>
                        :
                        <i
                            className="material-icons"
                            style={{
                                fontSize: 40,
                                margin: '0 10px 0 0',
                                color: 'green',
                            }}
                        >done</i>
                    }
                    <h3 style={{margin: 0}}>{msg}</h3>
                </div>
                {msgType === 'error' ?
                    <Button
                        type="primary"
                        style={{width: '100%'}}
                        onClick={navToRegister}
                    >
                        返回注册界面
                    </Button>
                    :
                    <div>正在启动主页面...</div>
                }
            </div>
        )
    }
}

MsgContent.propTypes = {
    username: PropTypes.string.isRequired,
    msgType: PropTypes.string.isRequired,
    msg: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    navToRegister: PropTypes.func.isRequired,
}

export default MsgContent
