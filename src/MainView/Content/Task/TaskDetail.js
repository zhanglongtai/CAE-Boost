import React from "react"
import PropTypes from "prop-types"
import Icon from "antd/lib/icon"

import Residual from "./Residual"
import log from "../../../util/log"

// const {ipcRenderer} = window.require("electron")

class TaskDetail extends React.Component {
    constructor() {
        super()
    }

    componentDidMount() {
    }

    render() {
        const {
            setContent,
            content,
            taskName,
            taskID,
            taskContainerWidth,
        } = this.props

        const styles = {
            container: {
                // minWidth: 1000,
                // width: '100%',
                display: content === 'task-list' ? 'none' : 'flex',
                minWidth: taskContainerWidth,
                minHeight: 620,
                // display: 'flex',
                transitionDuration: '0.5s',
                transform: content === 'task-list' ? '' : 'translate(-100%)',
            },
            navContainer: {
                maxWidth: '10%',
                minWidth: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
            residualContainer: {
                flexGrow: 1,
                // maxWidth: '90%',
                minWidth: '900px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            },
        }

        let detail
        if (content === 'task-detail') {
            detail = <Residual
                taskID={taskID}
                taskName={taskName}
            />
        } else {
            detail = null
        }

        return (
            <div
                className='task-detail'
                style={styles.container}
            >
                <div
                    className='task-detail-nav'
                    style={styles.navContainer}
                    onClick={setContent.bind(null, 'task-list')}
                >
                    <Icon
                        style={{fontSize: '40px', color: '#82B1FF'}}
                        type="left-circle-o"
                        className='task-detail-nav-icon'
                    />
                </div>
                <div
                    className='task-detail-residual'
                    style={styles.residualContainer}
                >
                    { detail }
                </div>
            </div>
        )
    }
}

TaskDetail.propTypes = {
    taskContainerWidth: PropTypes.number.isRequired,
    setContent: PropTypes.func.isRequired,
    content: PropTypes.string.isRequired,
    taskName: PropTypes.string.isRequired,
    taskID: PropTypes.string.isRequired,
}

export default TaskDetail
