import React from "react"
// import PropTypes from "prop-types"

import Header from "./Header"
import Content from "./Content"
import Footer from "./Footer"
import log from "../util/log"

const { ipcRenderer } = window.require("electron")

class MainView extends React.Component {
    constructor() {
        super()
    }
    
    componentDidMount() {
        ipcRenderer.send('main-view-ready-to-show')
    }

    render() {
        const styles = {
            container: {
                minWidth: 1000,
                width: '100%',
                minHeight: 800,
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            },
        }

        return (
            <div style={styles.container}>
                <Header />
                <Content />
                <Footer />
            </div>
        )
    }
}

// MainView.propTypes = {
//     taskID: PropTypes.string.isRequired,
// }

export default MainView
