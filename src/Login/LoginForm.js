import React from "react"
import PropTypes from "prop-types"
import Form from "antd/lib/form"
import Icon from "antd/lib/icon"
import Input from "antd/lib/input"
import Checkbox from "antd/lib/checkbox"
import Button from "antd/lib/button"

import log from "../util/log"

const FormItem = Form.Item

const { ipcRenderer } = window.require("electron")

class LoginForm extends React.Component {
    constructor(props) {
        super(props)
    }

    openRegisterWin() {
        ipcRenderer.send('close-login-win-open-register-win')
    }

    render() {
        const {
            submitting,
            autologin,
            username,
            usernameHelp,
            usernameValidateStatus,
            password,
            passwordHelp,
            passwordValidateStatus,
            navToRetrievePassword,
            setUsername,
            setPassword,
            setAutologin,
            loginSubmit,
        } = this.props

        return (
            <div
                style={{width: '300px'}}
                className='login-form-content'
            >
                <FormItem
                    help={usernameHelp}
                    validateStatus={usernameValidateStatus}
                >
                    <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        value={username}
                        placeholder="用户名"
                        onChange={setUsername}
                        disabled={submitting ? true : false}
                    />
                </FormItem>
                <FormItem
                    help={passwordHelp}
                    validateStatus={passwordValidateStatus}
                >
                    <Input
                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        type="password"
                        value={password}
                        placeholder="密码"
                        onChange={setPassword}
                        disabled={submitting ? true : false}
                    />
                </FormItem>
                <FormItem>
                    <Checkbox
                        checked={autologin}
                        onChange={setAutologin}
                    >自动登录</Checkbox>
                    <a
                        onClick={navToRetrievePassword}
                        style={{float: 'right'}}
                    >忘记密码</a>
                    { submitting ?
                        <Button
                            type="primary"
                            style={{width: '100%'}}
                            loading={true}
                            disabled
                        >
                            登录中...
                        </Button>
                        :
                        <Button
                            type="primary"
                            style={{width: '100%'}}
                            onClick={loginSubmit}
                        >
                            登录
                        </Button>
                    }
                    <a onClick={this.openRegisterWin}>新用户注册</a>
                </FormItem>
            </div>
        )
    }
}

LoginForm.propTypes = {
    submitting: PropTypes.bool.isRequired,
    autologin: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    usernameHelp: PropTypes.string.isRequired,
    usernameValidateStatus: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    passwordHelp: PropTypes.string.isRequired,
    passwordValidateStatus: PropTypes.string.isRequired,
    navToRetrievePassword: PropTypes.func.isRequired,
    setUsername: PropTypes.func.isRequired,
    setPassword: PropTypes.func.isRequired,
    setAutologin: PropTypes.func.isRequired,
    loginSubmit: PropTypes.func.isRequired,
}

export default LoginForm
