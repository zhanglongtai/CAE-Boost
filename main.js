const {
    app,
    BrowserWindow,
    ipcMain,
    shell,
} = require("electron")

const config = {
    env: 'dev', // 'dev' or 'prod'
    username: '',
    token: '',
}

let reactDevtool = null
switch (process.platform) {
    case 'linux':
        reactDevtool = '/home/tiger/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/2.3.3_0'
        break
    case 'win32':
        reactDevtool = 'C:\\Users\\Tiger\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\3.1.0_0'
        break
}

// win pool for client
const win = {
    winLogin: null,
    winRegister: null,
    winMainView: null,
    winTestDownload: null,
    winAddTask: null,
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

    createLoginWin()
    // createMainViewWin()
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


// ========= Login ==========
const createLoginWin = function() {
    const options = {
        width: 640,
        height: 440,
        minWidth: 640,
        minHeight: 440,
        show: false,
        // frame: false,
    }

    win.winLogin = new BrowserWindow(options)

    win.winLogin.setMenuBarVisibility(false)

    if (config.env === 'dev') {
        win.winLogin.webContents.openDevTools()
    }

    win.winLogin.loadURL(`file://${__dirname}/renderer/login.html`)

    win.winLogin.on('ready-to-show', () => {
        closeRegisterWin()
        closeMainView()
        win.winLogin.show()
    })

    win.winLogin.on('closed', () => {
        win.winLogin = null
    })
}

const closeLoginWin = function() {
    if (win.winLogin !== null) {
        win.winLogin.close()
    }
}

ipcMain.on('close-login-win-open-main-view-win', (event, args) => {
    config.username = args.username
    config.token = args.token

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

    win.winRegister.on('ready-to-show', () => {
        closeLoginWin()
        win.winRegister.show()
    })

    win.winRegister.on('closed', () => {
        win.winRegister = null
    })
}

const closeRegisterWin = function() {
    if (win.winRegister !== null) {
        win.winRegister.close()
    }
}

ipcMain.on('close-register-win-open-main-view-win', (event, args) => {
    config.username = args.username
    config.token = args.token

    win.winRegister.hide()
    createMainViewWin()
})

ipcMain.on('close-register-win-open-login-win', () => {
    win.winRegister.hide()
    createLoginWin()
})
// ========= Login ==========


// ========= MainView ==========
const createMainViewWin = function() {
    const options = {
        width: 1000,
        height: 800,
        minWidth: 1000,
        minHeight: 1000,
        frame: false,
        show: false,
    }

    win.winMainView = new BrowserWindow(options)

    win.winMainView.setMenuBarVisibility(false)

    if (config.env === 'dev') {
        win.winMainView.webContents.openDevTools()
    }

    win.winMainView.loadURL(`file://${__dirname}/renderer/mainView.html`)

    win.winMainView.on('ready-to-show', () => {
        closeLoginWin()
        closeRegisterWin()
        win.winMainView.send('user-info', {
            username: config.username,
            token: config.token,
        })
        win.winMainView.show()
    })

    win.winMainView.on('closed', () => {
        win.winMainView = null
    })
}

const closeMainView = function() {
    if (win.winMainView !== null) {
        win.winMainView.close()
    }
}

ipcMain.on('close-main-view-win-open-login-win', () => {
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
// ========= MainView ==========


// ========= AddTask ==========
const createAddTaskWin = function() {
    const options = {
        width: 600,
        height: 800,
        frame: false,
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

ipcMain.on('open-add-task', () => {
    createAddTaskWin()
})

ipcMain.on('close-add-task', () => {
    win.winAddTask.close()
})
// ========= AddTask ==========
