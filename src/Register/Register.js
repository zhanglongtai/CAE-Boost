import React from "react"
// import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"

import RegisterForm from "./RegisterForm"
import MsgContent from "./MsgContent"
import log from "../util/log"
import { getRegisterAPI } from "../api"

const { ipcRenderer } = window.require("electron")

class Register extends React.Component {
    constructor() {
        super()

        this.state = {
            content: 'form-content', // 'form-content', 'msg-content'
            submitting: false,
            username: '',
            usernameHelp: '',
            usernameValidateStatus: '',
            password: '',
            passwordHelp: '',
            passwordValidateStatus: '',
            passwordConfirm: '',
            passwordConfirmHelp: '',
            passwordConfirmValidateStatus: '',
            email: '',
            emailHelp: '',
            emailValidateStatus: '',
            msgType: '',
            msg: '',
            accessToken: '',
            refreshToken: '',
        }

        this.navToRegister = this.navToRegister.bind(this)

        this.setUsername = this.setUsername.bind(this)
        this.setPassword = this.setPassword.bind(this)
        this.setPasswordConfirm = this.setPasswordConfirm.bind(this)
        this.setEmail = this.setEmail.bind(this)
        this.registerSubmit = this.registerSubmit.bind(this)

        this.validateFields = this.validateFields.bind(this)
        this.validatedUsername = this.validatedUsername.bind(this)
        this.validatedPassword = this.validatedPassword.bind(this)
        this.validatedPasswordConfirm = this.validatedPasswordConfirm.bind(this)
        this.validatedEmail = this.validatedEmail.bind(this)

        this.clearErrorMsg = this.clearErrorMsg.bind(this)
    }

    componentDidMount() {
        ipcRenderer.send('register-ready-to-show')
    }

    navToRegister() {
        log('click')
        this.setState({
            content: 'form-content',
            submitting: false,
        })
    }

    clearErrorMsg() {
        this.setState({
            usernameHelp: '',
            usernameValidateStatus: '',
            passwordHelp: '',
            passwordValidateStatus: '',
            passwordConfirmHelp: '',
            passwordConfirmValidateStatus: '',
            emailHelp: '',
            emailValidateStatus: '',
        })
    }

    setUsername(event) {
        this.clearErrorMsg()

        const name = event.target.value
        this.setState({
            username: name
        })
    }

    setPassword(event) {
        this.clearErrorMsg()

        const pw = event.target.value
        this.setState({
            password: pw
        })
    }

    setPasswordConfirm(event) {
        this.clearErrorMsg()

        const pw = event.target.value
        this.setState({
            passwordConfirm: pw
        })
    }

    setEmail(event) {
        this.clearErrorMsg()

        const email = event.target.value
        this.setState({
            email: email,
        })
    }

    validatedUsername(username) {
        // username is empty
        if (username === '') {
            this.setState({
                usernameHelp: '用户名不能为空',
                usernameValidateStatus: 'error',
                passwordHelp: '',
                passwordValidateStatus: '',
                passwordConfirmHelp: '',
                passwordConfirmValidateStatus: '',
                emailHelp: '',
                emailValidateStatus: '',
            })
            return false
        }

        // first poistion is not lowwer case alphabet
        let tables = 'abcdefghijklmnopqrstuvwxyz'
        if (tables.includes(username[0]) === false) {
            this.setState({
                usernameHelp: '首位不是小写字母',
                usernameValidateStatus: 'error',
                passwordHelp: '',
                passwordValidateStatus: '',
                passwordConfirmHelp: '',
                passwordConfirmValidateStatus: '',
                emailHelp: '',
                emailValidateStatus: '',
            })
            return false
        }

        // username contains improper letter
        tables = 'abcdefghijklmnopqrstuvwxyz0123456789_'
        for (let letter of username) {
            if (tables.includes(letter) === false) {
                this.setState({
                    usernameHelp: '包含不允许的字符',
                    usernameValidateStatus: 'error',
                    passwordHelp: '',
                    passwordValidateStatus: '',
                    passwordConfirmHelp: '',
                    passwordConfirmValidateStatus: '',
                    emailHelp: '',
                    emailValidateStatus: '',
                })
                return false
            }
        }
    }

    validatedPassword(password) {
        // password is empty
        if (password === '') {
            this.setState({
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '密码不能为空',
                passwordValidateStatus: 'error',
                passwordConfirm: '',
                passwordConfirmHelp: '',
                passwordConfirmValidateStatus: '',
                emailHelp: '',
                emailValidateStatus: '',
            })
            return false
        }

        // password contains improper letter
        let tables = 'abcdefghijklmnopqrstuvwxyz'
        tables += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        tables += '`1234567890-=~!@#$%^&*()_+[]\\{}|,./<>?'
        for (let letter of password) {
            if (tables.includes(letter) === false) {
                this.setState({
                    usernameHelp: '',
                    usernameValidateStatus: '',
                    passwordHelp: '包含不允许的字符',
                    passwordValidateStatus: 'error',
                    passwordConfirm: '',
                    passwordConfirmHelp: '',
                    passwordConfirmValidateStatus: '',
                    emailHelp: '',
                    emailValidateStatus: '',
                })
                return false
            }
        }

        // password length is less than 8
        if (password.length < 8) {
            this.setState({
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '密码长度小于8位',
                passwordValidateStatus: 'error',
                passwordConfirm: '',
                passwordConfirmHelp: '',
                passwordConfirmValidateStatus: '',
                emailHelp: '',
                emailValidateStatus: '',
            })
            return false
        }
    }

    validatedPasswordConfirm(password, passwordConfirm) {
        // password is empty
        if (password !== passwordConfirm) {
            this.setState({
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '',
                passwordValidateStatus: '',
                passwordConfirmHelp: '确认密码与设置密码不一致',
                passwordConfirmValidateStatus: 'error',
                emailHelp: '',
                emailValidateStatus: '',
            })
            return false
        }
    }

    validatedEmail(email) {
        // email is empty
        if (email === '') {
            this.setState({
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '',
                passwordValidateStatus: '',
                passwordConfirmHelp: '',
                passwordConfirmValidateStatus: '',
                emailHelp: '邮箱不能为空',
                emailValidateStatus: 'error',
            })
            return false
        }

        // email format is not correct
        if (email.includes('@') === false) {
            this.setState({
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '',
                passwordValidateStatus: '',
                passwordConfirmHelp: '',
                passwordConfirmValidateStatus: '',
                emailHelp: '邮箱格式错误',
                emailValidateStatus: 'error',
            })
            return false
        }

        const [front, back] = email.split('@')
       
        if (front === '') {
            this.setState({
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '',
                passwordValidateStatus: '',
                passwordConfirmHelp: '',
                passwordConfirmValidateStatus: '',
                emailHelp: '邮箱格式错误',
                emailValidateStatus: 'error',
            })
            return false
        } else {
            const tables = 'abcdefghijklmnopqrstuvwxyz0123456789_.'
            for (let letter of front) {
                if (tables.includes(letter) === false) {
                    this.setState({
                        usernameHelp: '',
                        usernameValidateStatus: '',
                        passwordHelp: '',
                        passwordValidateStatus: '',
                        passwordConfirmHelp: '',
                        passwordConfirmValidateStatus: '',
                        emailHelp: '邮箱格式错误',
                        emailValidateStatus: 'error',
                    })
                    return false
                }
            }
        }
        
        if (back === '' || back.includes('.') === false) {
            this.setState({
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '',
                passwordValidateStatus: '',
                passwordConfirmHelp: '',
                passwordConfirmValidateStatus: '',
                emailHelp: '邮箱格式错误',
                emailValidateStatus: 'error',
            })
            return false
        } else if(back.split('.')[back.split('.').length - 1] === '') {
            this.setState({
                usernameHelp: '',
                usernameValidateStatus: '',
                passwordHelp: '',
                passwordValidateStatus: '',
                passwordConfirmHelp: '',
                passwordConfirmValidateStatus: '',
                emailHelp: '邮箱格式错误',
                emailValidateStatus: 'error',
            })
            return false
        } else {
            const tables = 'abcdefghijklmnopqrstuvwxyz0123456789.-'
            for (let letter of back) {
                if (tables.includes(letter) === false) {
                    this.setState({
                        usernameHelp: '',
                        usernameValidateStatus: '',
                        passwordHelp: '',
                        passwordValidateStatus: '',
                        passwordConfirmHelp: '',
                        passwordConfirmValidateStatus: '',
                        emailHelp: '邮箱格式错误',
                        emailValidateStatus: 'error',
                    })
                    return false
                }
            }
        }
    }

    validateFields() {
        const { username, password, passwordConfirm, email } = this.state

        if (this.validatedUsername(username) === false) {
            return false
        }

        if (this.validatedPassword(password) === false) {
            return false
        }

        if (this.validatedPasswordConfirm(password, passwordConfirm) === false) {
            return false
        }

        if (this.validatedEmail(email) === false) {
            return false
        }

        return true
    }

    registerSubmit() {
        const validatedPass = this.validateFields()

        if (validatedPass) {
            this.clearErrorMsg()

            const { username, password, email } = this.state

            const url = getRegisterAPI()

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    email: email,
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

                        this.setState({
                            content: 'msg-content',
                            msgType: 'success',
                            msg: '注册成功!',
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                        })
                    } else {
                        switch(result['err_code']) {
                            case 'UsernameExist':
                                this.setState({
                                    submitting: false,
                                    usernameHelp: '用户名已存在',
                                    usernameValidateStatus: 'error',
                                    passwordHelp: '',
                                    passwordValidateStatus: '',
                                    passwordConfirmHelp: '',
                                    passwordConfirmValidateStatus: '',
                                    emailHelp: '',
                                    emailValidateStatus: '',
                                })
                                break
                            case 'EmailExist':
                                this.setState({
                                    submitting: false,
                                    usernameHelp: '',
                                    usernameValidateStatus: '',
                                    passwordHelp: '',
                                    passwordValidateStatus: '',
                                    passwordConfirmHelp: '',
                                    passwordConfirmValidateStatus: '',
                                    emailHelp: '邮箱已被注册',
                                    emailValidateStatus: 'error',
                                })
                                break
                        }
                    }
                })
                .catch((error) => {
                    log('request failed', error.message)
                    if (error.message === 'Failed to fetch') {
                        this.setState({
                            content: 'msg-content',
                            msgType: 'error',
                            msg: '网络错误',
                        })
                    } else {
                        this.setState({
                            content: 'msg-content',
                            msgType: 'error',
                            msg: error.message,
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
                height: 600,
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
            msgType,
            msg,
            accessToken,
            refreshToken,
        } = this.state

        return (
            <div className='login' style={styles.container}>
                { content === 'form-content' ?
                    <RegisterForm
                        submitting={submitting}
                        username={username}
                        usernameHelp={usernameHelp}
                        usernameValidateStatus={usernameValidateStatus}
                        password={password}
                        passwordHelp={passwordHelp}
                        passwordValidateStatus={passwordValidateStatus}
                        passwordConfirm={passwordConfirm}
                        passwordConfirmHelp={passwordConfirmHelp}
                        passwordConfirmValidateStatus={passwordConfirmValidateStatus}
                        email={email}
                        emailHelp={emailHelp}
                        emailValidateStatus={emailValidateStatus}
                        setUsername={this.setUsername}
                        setPassword={this.setPassword}
                        setPasswordConfirm={this.setPasswordConfirm}
                        setEmail={this.setEmail}
                        registerSubmit={this.registerSubmit}
                    />
                    :
                    <MsgContent
                        username={username}
                        msgType={msgType}
                        msg={msg}
                        accessToken={accessToken}
                        refreshToken={refreshToken}
                        navToRegister={this.navToRegister}
                    />
                }
            </div>
        )
    }
}

// Register.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Register
