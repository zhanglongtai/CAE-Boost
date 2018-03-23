import React from "react"
// import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"

import LoginForm from "./LoginForm"
import ErrorMsg from "./ErrorMsg"
import RetrievePassword from "./RetrievePassword"
import log from "../util/log"
import { getloginAPI } from "../api"

const { ipcRenderer } = window.require("electron")

class Login extends React.Component {
    constructor() {
        super()

        this.state = {
            content: 'login-form', // 'login-form', 'error-msg', 'retrieve-password'
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
        this.navToRetrievePassword = this.navToRetrievePassword.bind(this)
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

    navToRetrievePassword() {
        this.setState({
            content: 'retrieve-password',
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

            // const url = `${getloginAPI()}?username=${username}&password=${password}`
            const url = `${getloginAPI()}`
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            })
                .then((response) => {
                    if (response.status >= 200 && response.status < 500) {
                        return response
                    } else {
                        if (response.status >= 500) {
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
                    if (result['success']) {
                        const accessToken = result['data']['access_token']
                        const refreshToken = result['data']['refresh_token']

                        ipcRenderer.send('close-login-win-open-main-view-win', {
                            username: username,
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                            autoLogin: autologin ? true : false,
                        })
                    } else {
                        switch(result['err_code']) {
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
                            case 'LoginFail':
                                this.setState({
                                    submitting: false,
                                    content: 'error-msg',
                                    errMsg: '用户名或密码错误',
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

        let showContent = null
        switch (content) {
            case 'login-form':
                showContent = <LoginForm
                    submitting={submitting}
                    autologin={autologin}
                    username={username}
                    usernameHelp={usernameHelp}
                    usernameValidateStatus={usernameValidateStatus}
                    password={password}
                    passwordHelp={passwordHelp}
                    passwordValidateStatus={passwordValidateStatus}
                    navToRetrievePassword={this.navToRetrievePassword}
                    setUsername={this.setUsername}
                    setPassword={this.setPassword}
                    setAutologin={this.setAutologin}
                    loginSubmit={this.loginSubmit}
                />
                break
            case 'error-msg':
                showContent = <ErrorMsg
                    errMsg={errMsg}
                    navToLogin={this.navToLogin}
                />
                break
            case 'retrieve-password':
                showContent = <RetrievePassword
                    navToLogin={this.navToLogin}
                />
        }

        return (
            <div className='login' style={styles.container}>
                { showContent }
            </div>
        )
    }
}

// Login.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Login
