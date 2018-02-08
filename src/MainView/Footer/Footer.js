import React from "react"
// import PropTypes from "prop-types"

import log from "../../util/log"

// const {ipcRenderer} = window.require("electron")

class Footer extends React.Component {
    constructor() {
        super()
    }

    componentDidMount() {
    }

    render() {
        const styles = {
            container: {
                // WebkitAppRegion: 'drag',
                width: 1000,
                height: 49,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                borderTop: '1px solid #d3d3d3',
            },
            item: {
                marginRight: '10px',
            },
        }

        return (
            <div className='footer' style={styles.container}>
                <div style={styles.item}>联系客服</div>
                <div style={styles.item}>网页监控入口</div>
                <div style={styles.item}>版本: 1.0.0</div>
            </div>
        )
    }
}

// Footer.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default Footer
