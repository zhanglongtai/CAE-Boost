import React from "react"
import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"
import Button from "antd/lib/button"
import Input from "antd/lib/input"
import Form from "antd/lib/form"

import log from "../util/log"
import { getPasswordAPI } from "../api"

// const { ipcRenderer } = window.require("electron")

const FormItem = Form.Item

class RetrievePassword extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            username: '',
            usernameHelp: '',
            usernameValidateStatus: '',
            submitting: false,
            content: 'input-content', // 'input-content', 'result-content', 'error-content'
            obscureEMail: '',
            errMsg: '',
        }

        this.setUsername = this.setUsername.bind(this)
        this.navToInputContent = this.navToInputContent.bind(this)
        this.sendRequest = this.sendRequest.bind(this)
    }

    setUsername(event) {
        const name = event.target.value
        this.setState({
            username: name
        })
    }

    navToInputContent() {
        this.setState({
            submitting: false,
            content: 'input-content',
        })
    }

    sendRequest() {
        const { username } = this.state

        // input can't be empty
        if (username === '') {
            this.setState({
                usernameHelp: '用户名不能为空',
                usernameValidateStatus: 'warning',
            })
            return
        }

        this.setState({
            submitting: true,
            usernameHelp: '',
            usernameValidateStatus: '',
            passwordHelp: '',
            passwordValidateStatus: '',
        })

        const url = `${getPasswordAPI()}?username=${username}`
        fetch(url)
            .then((response) => {
                if (response.status >= 200 && response.status < 300) {
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
                    this.setState({
                        content: 'result-content',
                        obscureEMail: result['obscure-email']
                    })
                } else {
                    switch(result['error-msg']) {
                        case 'username-not-exist':
                            this.setState({
                                submitting: false,
                                usernameHelp: '用户名不存在',
                                usernameValidateStatus: 'error',
                            })
                            break
                    }
                }
            })
            .catch((error) => {
                log('request failed', error.message)
                if (error.message === 'Failed to fetch') {
                    this.setState({
                        content: 'error-content',
                        errMsg: '网络错误',
                    })
                } else {
                    this.setState({
                        content: 'error-content',
                        errMsg: error.message,
                    })
                }
            })
    }

    render() {
        const {
            content,
            username,
            usernameHelp,
            usernameValidateStatus,
            submitting,
            obscureEMail,
            errMsg,
        } = this.state

        const {
            navToLogin,
        } = this.props

        let showContent = null
        switch (content) {
            case 'input-content':
                showContent = (
                    <div
                        style={{
                            width: '300px',
                            height: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        className='login-retrieve-password'
                    >
                        <h3>输入账户名称以取回对应密码</h3>
                        <FormItem
                            help={usernameHelp}
                            validateStatus={usernameValidateStatus}
                            style={{width: '100%', marginBottom: '40px'}}
                        >
                            <Input
                                value={username}
                                placeholder="输入用户名"
                                onChange={this.setUsername}
                                disabled={submitting ? true : false}
                            />
                        </FormItem>
                        <Button
                            type="primary"
                            style={{width: '100%', marginBottom: '10px'}}
                            onClick={this.sendRequest}
                            loading={submitting ? true: false}
                            disabled={submitting ? true: false}
                        >
                            取回密码
                        </Button>
                        <Button
                            style={{width: '100%'}}
                            onClick={navToLogin}
                            loading={submitting ? true: false}
                            disabled={submitting ? true: false}
                        >
                            返回登录界面
                        </Button>
                    </div>
                )
                break
            case 'result-content':
                showContent = (
                    <div
                        style={{
                            width: '300px',
                            height: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        className='login-retrieve-password'
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
                                    color: 'green',
                                }}
                            >done</i>
                            <h3 style={{margin: 0}}>密码已发送至{obscureEMail}, 请登录邮箱查收。</h3>
                        </div>
                        <Button
                            type="primary"
                            style={{width: '100%'}}
                            onClick={navToLogin}
                        >
                            返回注册界面
                        </Button>
                    </div>
                )
                break
            case 'error-content':
                showContent = (
                    <div
                        style={{
                            width: '300px',
                            height: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        className='login-retrieve-password'
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
                            style={{width: '100%', marginBottom: '10px'}}
                            onClick={this.navToInputContent}
                        >
                            返回重试
                        </Button>
                        <Button
                            style={{width: '100%'}}
                            onClick={navToLogin}
                        >
                            返回登录界面
                        </Button>
                    </div>
                )
                break
        }

        return showContent
    }
}

RetrievePassword.propTypes = {
    navToLogin: PropTypes.func.isRequired,
}

export default RetrievePassword
