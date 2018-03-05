import React from "react"
// import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"

import LoginForm from "./LoginForm"
import ErrorMsg from "./ErrorMsg"
import log from "../util/log"
import { getloginAPI } from "../api"

const { ipcRenderer } = window.require("electron")

class Login extends React.Component {
    constructor() {
        super()

        this.state = {
            content: 'login-form', // 'login-form', 'error-msg'
            submitting: false,
            autologin: false,
            username: '',
            usernameHelp: '',
            usernameValidateStatus: '',
            password: '',
            passwordHelp: '',
            passwordValidateStatus: '',
            errMsg: '',
        }

        this.navToLogin = this.navToLogin.bind(this)
        this.setUsername = this.setUsername.bind(this)
        this.setPassword = this.setPassword.bind(this)
        this.setAutologin = this.setAutologin.bind(this)
        this.loginSubmit = this.loginSubmit.bind(this)
        this.validateFields = this.validateFields.bind(this)
    }

    componentDidMount() {
        ipcRenderer.send('ready-to-show')
    }

    navToLogin() {
        this.setState({
            content: 'login-form',
            submitting: false,
        })
    }

    setUsername(event) {
        const name = event.target.value
        this.setState({
            username: name
        })
    }

    setPassword(event) {
        const pw = event.target.value
        this.setState({
            password: pw
        })
    }

    setAutologin() {
        this.setState({
            autologin: !this.state.autologin,
        })
    }

    validateFields() {
        const { username, password } = this.state

        // input can't be empty
        if (username === '') {
            this.setState({
                usernameHelp: '用户名不能为空',
                usernameValidateStatus: 'warning',
                passwordHelp: '',
                passwordValidateStatus: '',
            })
            return false
        }

        if (password === '') {
            this.setState({
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '密码不能为空',
                passwordValidateStatus: 'warning',
            })
            return false
        }

        return true
    }

    loginSubmit() {
        const validatedPass = this.validateFields()

        if (validatedPass) {
            this.setState({
                submitting: true,
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '',
                passwordValidateStatus: '',
            })

            const { username, password, autologin } = this.state

            const url = `${getloginAPI()}?username=${username}&password=${password}`
            fetch(url)
                .then((response) => {
                    if (response.status >= 200 && response.status < 300) {
                        return response
                    } else {
                        if (response.status >= 400) {
                            const error = new Error('服务器错误')
                            error.response = response
                            throw error
                        }
                    }
                })
                .then((response) => {
                    return response.json()
                })
                .then((result) => {
                    if (result.success) {
                        if (autologin) {
                            ipcRenderer.send('auto-login', {
                                username: username,
                                password: password,
                            })
                        }
                        ipcRenderer.send('close-login-win-open-main-view-win')
                    } else {
                        switch(result.errMsg) {
                            case 'UsernameNotExist':
                                this.setState({
                                    submitting: false,
                                    usernameHelp: '用户名不存在',
                                    usernameValidateStatus: 'error',
                                    passwordHelp: '',
                                    passwordValidateStatus: '',
                                })
                                break
                            case 'InvalidPassword':
                                this.setState({
                                    submitting: false,
                                    usernameHelp: '',
                                    usernameValidateStatus: '',
                                    passwordHelp: '密码不正确',
                                    passwordValidateStatus: 'error',
                                })
                                break
                        }
                    }
                })
                .catch((error) => {
                    log('request failed', error.message)
                    if (error.message === 'Failed to fetch') {
                        this.setState({
                            content: 'error-msg',
                            errMsg: '网络错误',
                        })
                    } else {
                        this.setState({
                            content: 'error-msg',
                            errMsg: error.message,
                        })
                    }
                })
        }
    }

    render() {
        const styles = {
            container: {
                // WebkitAppRegion: 'drag',
                width: 600,
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
            accountContainer: {
                // WebkitAppRegion: 'no-drag',
                width: 100,
                height: 49,
                margin: '0 40px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
        }

        const {
            content,
            submitting,
            autologin,
            username,
            usernameHelp,
            usernameValidateStatus,
            password,
            passwordHelp,
            passwordValidateStatus,
            errMsg,
        } = this.state

        return (
            <div className='login' style={styles.container}>
                { content === 'login-form' ?
                    <LoginForm
                        submitting={submitting}
                        autologin={autologin}
                        username={username}
                        usernameHelp={usernameHelp}
                        usernameValidateStatus={usernameValidateStatus}
                        password={password}
                        passwordHelp={passwordHelp}
                        passwordValidateStatus={passwordValidateStatus}
                        setUsername={this.setUsername}
                        setPassword={this.setPassword}
                        setAutologin={this.setAutologin}
                        loginSubmit={this.loginSubmit}
                    />
                    :
                    <ErrorMsg
                        errMsg={errMsg}
                        navToLogin={this.navToLogin}
                    />
                }
            </div>
        )
    }
}

// Login.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Login
