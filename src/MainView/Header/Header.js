import React from "react"
// import PropTypes from "prop-types"
import fetch from "isomorphic-fetch"
import Menu from "antd/lib/menu"
import Dropdown from "antd/lib/dropdown"
import Icon from "antd/lib/icon"
import Button from "antd/lib/button"

import { getBillAPI } from "../../api"
import log from "../../util/log"

const { ipcRenderer } = window.require("electron")

class Header extends React.Component {
    constructor() {
        super()

        this.state = {
            username: '',
            accessToken: '',
            account: {
                isFetching: true,
                success: false,
                balance: '获取中', // 0.00, 获取中, 获取失败
                voucher: '获取中', // 0.00, 获取中, 获取失败
                chargeRecord: [],
                consumeRecord: [],
            },
            winMax: false,
        }

        this.fetchAccount = this.fetchAccount.bind(this)
        this.maximizeWin = this.maximizeWin.bind(this)
        this.restoreWin = this.restoreWin.bind(this)
        this.handleProfile = this.handleProfile.bind(this)
    }

    componentDidMount() {
        ipcRenderer.on('user-info', (event, args) => {
            log('user-info')
            const { username, accessToken } = args
            this.setState({
                username: username,
                accessToken: accessToken,
            }, () => {
                this.fetchAccount()
            })
        })
    }

    fetchAccount() {
        this.setState({
            account: {
                isFetching: true,
                success: false,
                balance: '获取中',
                voucher: '获取中',
                chargeRecord: [],
                consumeRecord: [],
            },
        })

        const { accessToken } = this.state
        const url = `${getBillAPI()}`

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}` 
            }
        })
            .then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    return response
                } else {
                    if (response.status >= 400 && response.status < 500) {
                        const error = new Error('暂时无法连接服务器')
                        error.response = response
                        throw error
                    } else if (response.status >= 500 ) {
                        const error = new Error('服务器错误')
                        error.response = response
                        throw error
                    } else {
                        const error = new Error(response.statusText)
                        error.response = response
                        throw error
                    }
                }
            })
            .then((response) => {
                return response.json()
            })
            .then((result) => {
                this.setState({
                    account: {
                        isFetching: false,
                        success: true,
                        balance: result['balance'],
                        voucher: result['voucher'],
                        chargeRecord: result['charge-record'],
                        consumeRecord: result['consume-record'],
                    },
                })
            })
            .catch((error) => {
                log(error)
                if (error.message === 'Failed to fetch') {
                    this.setState({
                        account: {
                            isFetching: false,
                            success: false,
                            balance: '获取失败',
                            voucher: '获取失败',
                            chargeRecord: [],
                            consumeRecord: [],
                        },
                    })
                } else {
                    this.setState({
                        account: {
                            isFetching: false,
                            success: false,
                            balance: '获取失败',
                            voucher: '获取失败',
                            chargeRecord: [],
                            consumeRecord: [],
                        },
                    })
                }
            })
    }

    minimizeWin() {
        ipcRenderer.send('minimize-main-view-win')
    }

    maximizeWin() {
        this.setState({
            winMax: true,
        })
        ipcRenderer.send('maximize-main-view-win')
    }

    restoreWin() {
        this.setState({
            winMax: false,
        })
        ipcRenderer.send('restore-main-view-win')
    }

    closeWin() {
        ipcRenderer.send('close-main-view-win')
    }

    openChargeWin() {
        ipcRenderer.send('open-charge-win')
    }

    handleProfile(menu) {
        switch (menu.key) {
            case "1":
            case "2":
                log(menu.key)
                break
            case "3":
                this.logout()
                break
        }
    }

    logout() {
        ipcRenderer.send('close-main-view-win-open-login-win')
    }

    render() {
        const styles = {
            container: {
                WebkitAppRegion: 'drag',
                minWidth: 1000,
                width: '100%',
                height: 49,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            },
            logoContainer: {
                width: 100,
                height: 49,
                margin: '0 0 0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
            logo: {
                height: 15,
            },
            contentContainer: {
                display: 'flex',
                alignItems: 'center',
            },
            accountContainer: {
                WebkitAppRegion: 'no-drag',
                width: 100,
                height: 49,
                margin: '0 40px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
            balanceContainer: {
                WebkitAppRegion: 'no-drag',
                width: 200,
                height: 49,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
            voucherContainer: {
                width: 100,
                height: 49,
                margin: '0 50px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
            otherContainer: {
                WebkitAppRegion: 'no-drag',
                width: 200,
                height: 49,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
            },
            divider: {
                height: 1,
                width: '95%',
                margin: 'auto',
                backgroundColor: 'green',
            },
        }

        const { username, winMax, account } = this.state

        const menu = (
            <Menu onClick={this.handleProfile}>
                <Menu.Item key="0">修改密码</Menu.Item>
                <Menu.Item key="1">查看账单</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="3">注销</Menu.Item>
            </Menu>
        )

        const dropdown = (
            <Dropdown overlay={menu} trigger={['click']}>
                <div>
                    {username} <Icon type="down" />
                </div>
            </Dropdown>
        )

        const windowIcon = (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    onClick={this.minimizeWin}
                    style={{
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    className='icon-container'
                >
                    <i className="iconfont icon-window-minimize"></i>
                </div>
                <div
                    onClick={winMax ? this.restoreWin : this.maximizeWin}
                    style={{
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    className='icon-container'
                >
                    {winMax ? <i className="iconfont icon-windowrestore"></i> : <i className="iconfont icon-windowmaximize"></i>}
                </div>
                <div
                    onClick={this.closeWin}
                    style={{
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    className='icon-container'
                >
                    <i className="iconfont icon-window-close"></i>
                </div>
            </div>
        )

        return (
            <div className='header'>
                <div style={styles.container}>
                    <div style={styles.logoContainer}>
                        <img src='img/DlakeCloud.svg' style={styles.logo} />
                    </div>
                    <div style={styles.contentContainer}>
                        <img
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                border: '2px solid #fafafa',
                            }}
                            alt="avatar"
                            src='img/ic_account_circle_48px_blue500.svg'
                        />
                        <div style={styles.accountContainer}>{ dropdown }</div>
                        <div style={styles.balanceContainer}>
                            余额: {account.balance}&nbsp;&nbsp;<span><Button size='small' onClick={this.openChargeWin}>充值</Button></span>
                        </div>
                        <div style={styles.voucherContainer}>
                            代金卷: {account.voucher}
                        </div>
                        <div style={styles.otherContainer}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Button size='small'>帮助</Button>
                                &nbsp;&nbsp;
                                <Icon type="setting" />
                            </div>
                            { windowIcon }
                        </div>
                    </div>
                </div>
                <div style={styles.divider} />
            </div>
        )
    }
}

// Header.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Header
