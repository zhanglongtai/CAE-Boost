import React from "react"
// import PropTypes from "prop-types"
import Menu from "antd/lib/menu"
import Dropdown from "antd/lib/dropdown"
import Icon from "antd/lib/icon"
import Button from "antd/lib/button"

import log from "../../util/log"

const { ipcRenderer } = window.require("electron")

class Header extends React.Component {
    constructor() {
        super()

        this.state = {
            winMax: false,
        }

        this.maximizeWin = this.maximizeWin.bind(this)
        this.restoreWin = this.restoreWin.bind(this)
    }

    componentDidMount() {
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

    render() {
        const styles = {
            container: {
                // WebkitAppRegion: 'drag',
                width: 1000,
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
                // WebkitAppRegion: 'no-drag',
                width: 100,
                height: 49,
                margin: '0 40px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
            balanceContainer: {
                // WebkitAppRegion: 'no-drag',
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

        const { winMax } = this.state

        const menu = (
            <Menu>
                <Menu.Item key="0">修改密码</Menu.Item>
                <Menu.Item key="1">清单</Menu.Item>
                <Menu.Divider />
                <Menu.Item key="3">注销</Menu.Item>
            </Menu>
        )

        const dropdown = (
            <Dropdown overlay={menu} trigger={['click']}>
                <div>
                    username <Icon type="down" />
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
                        <div style={styles.accountContainer}>{ dropdown }</div>
                        <div style={styles.balanceContainer}>
                            余额: 0.00&nbsp;&nbsp;<span><Button size='small'>充值</Button></span>
                        </div>
                        <div style={styles.voucherContainer}>
                            代金卷: 0.00
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
