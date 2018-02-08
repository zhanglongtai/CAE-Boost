import React from "react"
// import PropTypes from "prop-types"

import Menu from "./Menu"
import Upload from "./Upload"
import TaskList from "./TaskList"
import Download from "./Download"
import log from "../../util/log"

// const {ipcRenderer} = window.require("electron")

class Content extends React.Component {
    constructor() {
        super()

        this.state = {
            contentIndex: 1,
        }

        this.setContent = this.setContent.bind(this)
    }

    componentDidMount() {
    }

    setContent(index) {
        this.setState({
            contentIndex: index,
        })
    }

    render() {
        const styles = {
            container: {
                width: 1000,
                height: 700,
                display: 'flex',
                flexDirection: 'column',
            },
        }

        const { contentIndex } = this.state

        let content
        switch (contentIndex) {
            case 0:
                content = <Upload />
                break
            case 1:
                content = <TaskList />
                break
            case 2:
                content = <Download />
                break
            default:
                content = null
                break
        }

        return (
            <div
                className='content'
                style={styles.container}
            >
                <Menu
                    contentIndex={`${contentIndex}`}
                    setContent={this.setContent}
                />
                { content }
            </div>
        )
    }
}

// Content.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Content
