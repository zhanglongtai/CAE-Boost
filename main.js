const {
    app,
    BrowserWindow,
    ipcMain,
    shell,
} = require("electron")

const StoreConfig = require("./main-lib/storeConfig")

const config = {
    env: 'dev', // 'dev' or 'prod'
    addTaskErrorMsg: '',
}

let reactDevtool = null
switch (process.platform) {
    case 'linux':
        reactDevtool = '/home/tiger/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/2.3.3_0'
        break
    case 'win32':
        reactDevtool = 'C:\\Users\\Tiger\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\3.2.1_0'
        break
}

// win pool for client
const win = {
    winLogin: null,
    winRegister: null,
    winMainView: null,
    winTestDownload: null,
    winAddTask: null,
    winAddTaskErrorMsg: null,
    winNodeTypeSelector: null,
    winCharge: null,
    winBillHistory: null,
}


// ========== util func ==========
const log = function() {
    console.log.apply(null, arguments)
}
// ========== util func ==========


// ========= App ==========
app.on('ready', () => {
    if (config.env === 'dev') {
        BrowserWindow.addDevToolsExtension(reactDevtool)
    }

    const storeConfig = new StoreConfig()
    const autoLogin = storeConfig.get('auto-login')

    if (autoLogin) {
        createMainViewWin()
    } else {
        createLoginWin()
    }
})

app.on('will-quit', () => {
    const storeConfig = new StoreConfig()
    const autoLogin = storeConfig.get('auto-login')

    if (autoLogin === false) {
        storeConfig.set('username', '')
        storeConfig.set('access-token', '')
        storeConfig.set('refresh-token', '')
    }
})
// ========= App ==========


// ========== TestDownload ==========
const createTestDownloadWin = function() {
    const options = {
        width: 600,
        height: 600,
        show: true,
    }

    win.winTestDownload = new BrowserWindow(options)
    
    if (config.env === 'dev') {
        win.winTestDownload.webContents.openDevTools()
    }
    
    win.winTestDownload.loadURL(`file://${__dirname}/renderer/testDownload.html`)
}

ipcMain.on('download-file', (event, url) => {
    log('down load url', url)
    win.winTestDownload.webContents.downloadURL(url)

    const fileNameList = url.split('/')
    const fileName = fileNameList[fileNameList.length - 1]

    win.winTestDownload.webContents.session.on('will-download', (sessionEvent, item, webContents) => {
        // Set the save path, making Electron not to prompt a save dialog.
        item.setSavePath(`/tmp/${fileName}`)
      
        item.on('updated', (updateEvent, state) => {
            if (state === 'interrupted') {
                log('Download is interrupted but can be resumed')
            } else if (state === 'progressing') {
                if (item.isPaused()) {
                    log('Download is paused')
                } else {
                    const received = item.getReceivedBytes()
                    const total = item.getTotalBytes()
                    const percent = Math.floor(received/total*100)
                    log(`Received bytes: ${item.getReceivedBytes()}`)
                    event.sender.send('download-update', percent)
                }
            }
        })

        item.once('done', (event, state) => {
            if (state === 'completed') {
                log('Download successfully')
            } else {
                log(`Download failed: ${state}`)
            }
        })

        ipcMain.on('pause-download', () => {
            item.pause()
        })

        ipcMain.on('resume-download', () => {
            item.resume()
        })
    })
})
// ========== TestDownload ==========


// ========== ConfigStore ==========


// ========= Login ==========
const createLoginWin = function() {
    const options = {
        width: 640,
        height: 440,
        minWidth: 640,
        minHeight: 440,
        show: false,
        title: '登录',
        icon: 'file://${__dirname}/renderer/icon/favicon.ico',
        // frame: false,
    }

    win.winLogin = new BrowserWindow(options)

    win.winLogin.setMenuBarVisibility(false)

    if (config.env === 'dev') {
        win.winLogin.webContents.openDevTools()
    }

    win.winLogin.loadURL(`file://${__dirname}/renderer/login.html`)

    win.winLogin.on('closed', () => {
        win.winLogin = null
    })
}

const closeLoginWin = function() {
    if (win.winLogin !== null) {
        win.winLogin.close()
    }
}

ipcMain.on('login-ready-to-show', () => {
    closeRegisterWin()
    closeMainView()
    win.winLogin.show()
})

ipcMain.on('close-login-win-open-main-view-win', (event, args) => {
    const { username, accessToken, refreshToken, autoLogin } = args

    const storeConfig = new StoreConfig()
    storeConfig.set('username', username)
    storeConfig.set('access-token', accessToken)
    storeConfig.set('refresh-token', refreshToken)
    storeConfig.set('auto-login', autoLogin)

    win.winLogin.hide()
    createMainViewWin()
})

ipcMain.on('close-login-win-open-register-win', () => {
    win.winLogin.hide()
    createRegisterWin()
})
// ========= Login ==========


// ========= Register ==========
const createRegisterWin = function() {
    const options = {
        width: 640,
        height: 640,
        minWidth: 640,
        minHeight: 640,
        // frame: false,
        show: false,
    }

    win.winRegister = new BrowserWindow(options)

    win.winRegister.setMenuBarVisibility(false)

    if (config.env === 'dev') {
        win.winRegister.webContents.openDevTools()
    }

    win.winRegister.loadURL(`file://${__dirname}/renderer/register.html`)

    win.winRegister.on('closed', () => {
        win.winRegister = null
    })
}

const closeRegisterWin = function() {
    if (win.winRegister !== null) {
        win.winRegister.close()
    }
}

ipcMain.on('register-ready-to-show', () => {
    closeLoginWin()
    win.winRegister.show()
})

ipcMain.on('close-register-win-open-login-win', () => {
    win.winRegister.hide()
    createLoginWin()
})

ipcMain.on('close-register-win-open-main-view-win', (event, args) => {
    const { username, accessToken, refreshToken } = args
    const storeConfig = new StoreConfig()
    storeConfig.set('username', username)
    storeConfig.set('access-token', accessToken)
    storeConfig.set('refresh-token', refreshToken)

    win.winRegister.hide()
    createMainViewWin()
})
// ========= Register ==========


// ========= MainView ==========
const createMainViewWin = function() {
    const options = {
        width: 1000,
        height: 800,
        minWidth: 1000,
        minHeight: 800,
        frame: false,
        show: false,
    }

    win.winMainView = new BrowserWindow(options)

    win.winMainView.setMenuBarVisibility(false)

    if (config.env === 'dev') {
        win.winMainView.webContents.openDevTools()
    }

    win.winMainView.loadURL(`file://${__dirname}/renderer/mainView.html`)

    win.winMainView.on('closed', () => {
        win.winMainView = null
    })
}

const closeMainView = function() {
    if (win.winMainView !== null) {
        win.winMainView.close()
    }
}

ipcMain.on('main-view-ready-to-show', () => {
    closeLoginWin()
    closeRegisterWin()

    const storeConfig = new StoreConfig()
    const username = storeConfig.get('username')
    const accessToken = storeConfig.get('access-token')

    win.winMainView.webContents.send('user-info', {
        username: username,
        accessToken: accessToken,
    })
    win.winMainView.show()
})

ipcMain.on('close-main-view-win-open-login-win', () => {
    const storeConfig = new StoreConfig()
    storeConfig.set('username', '')
    storeConfig.set('access-token', '')
    storeConfig.set('refresh-token', '')
    storeConfig.set('auto-login', false)

    win.winMainView.hide()
    createLoginWin()
})

ipcMain.on('minimize-main-view-win', () => {
    win.winMainView.minimize()
})

ipcMain.on('maximize-main-view-win', () => {
    win.winMainView.maximize()
})

ipcMain.on('restore-main-view-win', () => {
    win.winMainView.restore()
})

ipcMain.on('close-main-view-win', () => {
    win.winMainView.close()
})

ipcMain.on('update-bill', () => {
    win.winMainView.webContents.send('update-bill')
})
// ========= MainView ==========


// ========== AddTask ==========
const createAddTaskWin = function() {
    const options = {
        width: 600,
        height: 870,
        frame: false,
        // resizable: false,
        parent: win.winMainView,
        modal: true,
    }

    win.winAddTask = new BrowserWindow(options)

    if (config.env === 'dev') {
        win.winAddTask.webContents.openDevTools()
    }

    win.winAddTask.loadURL(`file://${__dirname}/renderer/addTask.html`)

    win.winAddTask.on('closed', () => {
        win.winAddTask = null
    })
}

ipcMain.on('open-add-task-win', () => {
    createAddTaskWin()
})

ipcMain.on('close-add-task-win', () => {
    win.winAddTask.close()
})
// ========== AddTask ==========


// ========== AddTaskErrorMsg ==========
const createAddTaskErrorMsgWin = function() {
    const options = {
        width: 400,
        height: 400,
        frame: false,
        show: false,
        parent: win.winAddTask,
        modal: true,
    }

    win.winAddTaskErrorMsg = new BrowserWindow(options)

    if (config.env === 'dev') {
        win.winAddTaskErrorMsg.webContents.openDevTools()
    }

    win.winAddTaskErrorMsg.loadURL(`file://${__dirname}/renderer/addTaskErrorMsg.html`)

    win.winAddTaskErrorMsg.on('closed', () => {
        win.winAddTaskErrorMsg = null
    })
}

ipcMain.on('add-task-error-msg-ready-to-show', () => {
    win.winAddTaskErrorMsg.webContents.send('error-msg', {
        errorMsg: config.addTaskErrorMsg,
    })
    win.winAddTaskErrorMsg.show()
})

ipcMain.on('open-add-task-error-msg-win', (event, msg) => {
    config.addTaskErrorMsg = msg
    createAddTaskErrorMsgWin()
})

ipcMain.on('close-add-task-error-msg-win', () => {
    win.winAddTaskErrorMsg.close()
})
// ========== AddTaskErrorMsg ==========


// ========== NodeTypeSelector ==========
const createNodeTypeSelectorWin = function() {
    const options = {
        width: 900,
        height: 400,
        frame: false,
        // resizable: false,
        parent: win.winAddTask,
        modal: true,
    }

    win.winNodeTypeSelector = new BrowserWindow(options)

    if (config.env === 'dev') {
        win.winNodeTypeSelector.webContents.openDevTools()
    }

    win.winNodeTypeSelector.loadURL(`file://${__dirname}/renderer/nodeTypeSelector.html`)

    win.winNodeTypeSelector.on('closed', () => {
        win.winNodeTypeSelector = null
    })
}

ipcMain.on('open-node-type-selector-win', () => {
    createNodeTypeSelectorWin()
})

ipcMain.on('close-node-type-selector-win', () => {
    win.winNodeTypeSelector.close()
})

ipcMain.on('submit-node-type', (event, args) => {
    win.winAddTask.webContents.send('submit-node-type', args)
    win.winNodeTypeSelector.close()
})
// ========== NodeTypeSelector ==========


// ========= Charge ==========
const createChargeWin = function() {
    const options = {
        width: 500,
        height: 500,
        frame: false,
        // resizable: false,
        parent: win.winMainView,
        modal: true,
    }

    win.winCharge = new BrowserWindow(options)

    if (config.env === 'dev') {
        win.winCharge.webContents.openDevTools()
    }

    win.winCharge.loadURL(`file://${__dirname}/renderer/charge.html`)

    win.winCharge.on('closed', () => {
        win.winCharge = null
    })
}

ipcMain.on('open-charge-win', () => {
    createChargeWin()
})

ipcMain.on('close-charge-win', () => {
    win.winCharge.close()
})
// ========= Charge ==========


// ========= BillHistroy ==========
const createBillHistoryWin = function() {
    const options = {
        width: 500,
        height: 700,
        frame: false,
        show: false,
        parent: win.winMainView,
        modal: true,
    }

    win.winBillHistory = new BrowserWindow(options)

    if (config.env === 'dev') {
        win.winBillHistory.webContents.openDevTools()
    }

    win.winBillHistory.loadURL(`file://${__dirname}/renderer/billHistory.html`)

    win.winBillHistory.on('closed', () => {
        win.winBillHistory = null
    })
}

ipcMain.on('bill-history-ready-to-show', () => {
    const storeConfig = new StoreConfig()
    const username = storeConfig.get('username')
    const accessToken = storeConfig.get('access-token')

    win.winBillHistory.webContents.send('user-info', {
        username: username,
        accessToken: accessToken,
    })
    win.winBillHistory.show()
})

ipcMain.on('open-bill-history-win', () => {
    createBillHistoryWin()
})

ipcMain.on('close-bill-history-win', () => {
    win.winBillHistory.close()
})
// ========= Charge ==========


// ========== Upload File ==========