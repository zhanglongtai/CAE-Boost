import React from "react"
import PropTypes from "prop-types"
import Radio from "antd/lib/radio"
import Button from "antd/lib/button"

import log from "../../../util/log"

const { ipcRenderer } = window.require("electron")

const RadioButton = Radio.Button
const RadioGroup = Radio.Group

class Menu extends React.Component {
    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
    }

    componentDidMount() {
    }

    handleChange(event) {
        const index = parseInt(event.target.value)
        this.props.setContent(index)
    }

    openAddTaskWin() {
        ipcRenderer.send('open-add-task-win')
    }

    render() {
        const styles = {
            container: {
                minWidth: 1000,
                width: '100%',
                height: 80,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
        }

        return (
            <div
                className='menu'
                style={styles.container}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: '40px',
                        top: '24px',
                    }}
                >
                    <Button
                        type="primary"
                        icon="plus-circle"
                        size="default"
                        onClick={this.openAddTaskWin}
                    >新增任务</Button>
                </div>
                <RadioGroup onChange={this.handleChange} value={this.props.contentIndex}>
                    <RadioButton value="0">我的上传</RadioButton>
                    <RadioButton value="1">任务列表</RadioButton>
                    <RadioButton value="2">我的下载</RadioButton>
                </RadioGroup>
            </div>
        )
    }
}

Menu.propTypes = {
    contentIndex: PropTypes.string.isRequired,
    setContent: PropTypes.func.isRequired,
}

export default Menu
