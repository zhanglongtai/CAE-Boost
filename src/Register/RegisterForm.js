import React from "react"
import PropTypes from "prop-types"
import Form from "antd/lib/form"
import Icon from "antd/lib/icon"
import Input from "antd/lib/input"
import Checkbox from "antd/lib/checkbox"
import Button from "antd/lib/button"
import Tooltip from "antd/lib/tooltip"

import log from "../util/log"

const FormItem = Form.Item

const { ipcRenderer } = window.require("electron")

class RegisterForm extends React.Component {
    constructor(props) {
        super(props)
    }

    openLoginWin() {
        ipcRenderer.send('close-register-win-open-login-win')
    }

    render() {
        const {
            submitting,
            username,
            usernameHelp,
            usernameValidateStatus,
            password,
            passwordHelp,
            passwordValidateStatus,
            passwordConfirm,
            passwordConfirmHelp,
            passwordConfirmValidateStatus,
            email,
            emailHelp,
            emailValidateStatus,
            setUsername,
            setPassword,
            setPasswordConfirm,
            setEmail,
            registerSubmit,
        } = this.props

        return (
            <div
                style={{width: '300px'}}
                className='login-form-content'
            >
                <FormItem
                    help={usernameHelp}
                    validateStatus={usernameValidateStatus}
                    style={{position: 'relative'}}
                >
                    <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        value={username}
                        placeholder="设置用户名"
                        onChange={setUsername}
                        disabled={submitting ? true : false}
                    />
                    <div
                        style={{position: 'absolute', right: '-20px', top: '1px'}}
                    >
                        <Tooltip title="字母、数字和下划线，首位只能是字母">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                    </div>
                </FormItem>
                <FormItem
                    help={passwordHelp}
                    validateStatus={passwordValidateStatus}
                >
                    <Input
                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        type="password"
                        value={password}
                        placeholder="设置密码"
                        onChange={setPassword}
                        disabled={submitting ? true : false}
                    />
                </FormItem>
                <FormItem
                    help={passwordConfirmHelp}
                    validateStatus={passwordConfirmValidateStatus}
                >
                    <Input
                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        type="password"
                        value={passwordConfirm}
                        placeholder="再次确认密码"
                        onChange={setPasswordConfirm}
                        disabled={submitting ? true : false}
                    />
                </FormItem>
                <FormItem
                    help={emailHelp}
                    validateStatus={emailValidateStatus}
                >
                    <Input
                        prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        value={email}
                        placeholder="设置注册邮箱"
                        onChange={setEmail}
                        disabled={submitting ? true : false}
                    />
                </FormItem>
                <FormItem>
                    { submitting ?
                        <Button
                            type="primary"
                            style={{width: '100%'}}
                            loading={true}
                            disabled
                        >
                            注册中...
                        </Button>
                        :
                        <Button
                            type="primary"
                            style={{width: '100%'}}
                            onClick={registerSubmit}
                        >
                            注册
                        </Button>
                    }
                    <a onClick={this.openLoginWin}>返回登录</a>
                </FormItem>
            </div>
        )
    }
}

RegisterForm.propTypes = {
    submitting: PropTypes.bool.isRequired,
    username: PropTypes.string.isRequired,
    usernameHelp: PropTypes.string.isRequired,
    usernameValidateStatus: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    passwordHelp: PropTypes.string.isRequired,
    passwordValidateStatus: PropTypes.string.isRequired,
    passwordConfirm: PropTypes.string.isRequired,
    passwordConfirmHelp: PropTypes.string.isRequired,
    passwordConfirmValidateStatus: PropTypes.string.isRequired,
    setUsername: PropTypes.func.isRequired,
    setPassword: PropTypes.func.isRequired,
    setPasswordConfirm: PropTypes.func.isRequired,
    setEmail: PropTypes.func.isRequired,
    registerSubmit: PropTypes.func.isRequired,
}

export default RegisterForm
