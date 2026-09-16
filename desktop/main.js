
const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification, shell, dialog } = require('electron');
const path = require('path');
const https = require('https');

let mainWindow = null;
let tray = null;
const APP_URL = 'https://www.gvcncdsai.io.vn/app';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 650,
    title: 'Smart Teacher Schedule AI - Windows/Mac/Linux Desktop',
    icon: process.platform === 'win32' ? path.join(__dirname, 'icon.ico') : path.join(__dirname, 'icon.png'),
    backgroundColor: '#030712',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: true
    },
    autoHideMenuBar: false
  });

  // Load official web application
  mainWindow.loadURL(APP_URL);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  createMenu();
  createTray();
}

function createMenu() {
  const template = [
    {
      label: 'Hệ Thống',
      submenu: [
        {
          label: '🔄 Đồng bộ Đám mây ngay',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('trigger-cloud-sync');
          }
        },
        {
          label: '🌐 Tải lại trang (F5)',
          accelerator: 'F5',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Ẩn cửa sổ vào khay hệ thống',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (mainWindow) mainWindow.hide();
          }
        },
        {
          label: 'Thoát ứng dụng',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.isQuitting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Xem',
      submenu: [
        { role: 'reload', label: 'Làm mới' },
        { role: 'forceReload', label: 'Tải lại hoàn toàn' },
        { role: 'toggleDevTools', label: 'Bật công cụ nhà phát triển' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Cỡ chữ mặc định' },
        { role: 'zoomIn', label: 'Phóng to' },
        { role: 'zoomOut', label: 'Thu nhỏ' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toàn màn hình' }
      ]
    },
    {
      label: 'Cổng Hệ Thống',
      submenu: [
        {
          label: '🏛️ Cổng Quản Lý Nhà Trường (/school)',
          click: () => {
            if (mainWindow) mainWindow.loadURL('https://www.gvcncdsai.io.vn/school');
          }
        },
        {
          label: '👨‍🏫 Cổng Nghiệp Vụ Giáo Viên (/app)',
          click: () => {
            if (mainWindow) mainWindow.loadURL('https://www.gvcncdsai.io.vn/app');
          }
        },
        {
          label: '🎓 Cổng Học Sinh & Gia Sư AI (/student)',
          click: () => {
            if (mainWindow) mainWindow.loadURL('https://www.gvcncdsai.io.vn/student');
          }
        },
        {
          label: '👨‍👩‍👧 Sổ Liên Lạc Phụ Huynh (/parent)',
          click: () => {
            if (mainWindow) mainWindow.loadURL('https://www.gvcncdsai.io.vn/parent');
          }
        }
      ]
    },
    {
      label: 'Trợ Giúp',
      submenu: [
        {
          label: '🔄 Kiểm tra bản cập nhật mới...',
          click: () => checkForUpdates(true)
        },
        {
          label: '🌐 Trang chủ Smart Teacher Schedule AI',
          click: () => shell.openExternal('https://gvcncdsai.io.vn')
        },
        {
          label: '📱 Tải bản Android APK v2.2.0',
          click: () => shell.openExternal('https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_v2.2.0.apk')
        },
        {
          label: '💬 Hỗ trợ Zalo: 0961364600',
          click: () => shell.openExternal('https://zalo.me/0961364600')
        },
        { type: 'separator' },
        {
          label: 'Về ứng dụng Smart Teacher Schedule AI v2.2.0',
          click: () => {
            if (Notification.isSupported()) {
              new Notification({
                title: 'Smart Teacher Schedule AI Desktop',
                body: 'Phiên bản v2.2.0 - Hệ sinh thái đa nền tảng, tự động hóa sư phạm, đồng bộ đám mây và trợ lý giáo viên AI.'
              }).show();
            }
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, 'icon.png');
    tray = new Tray(iconPath);
    tray.setToolTip('Smart Teacher Schedule AI - Đang chạy ngầm');
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '📅 Mở Lịch Dạy Giáo Viên',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: '🔄 Đồng bộ Đám mây',
        click: () => {
          if (mainWindow) mainWindow.webContents.send('trigger-cloud-sync');
        }
      },
      { type: 'separator' },
      {
        label: 'Thoát ứng dụng',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (e) {
    console.log('Tray creation note:', e);
  }
}

// IPC Handlers
ipcMain.on('desktop-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || 'Smart Teacher Schedule AI',
      body: body || 'Thông báo tiết dạy mới',
      urgency: 'critical'
    }).show();
  }
});

// Auto Update Check Function
function checkForUpdates(manual = false) {
  const versionUrl = 'https://www.gvcncdsai.io.vn/api/version';
  https.get(versionUrl, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const data = JSON.parse(rawData);
        const currentVersionCode = 22; // v2.2.0
        const remoteVersionCode = data.versionCode || 21;
        const remoteVersionName = data.versionName || '2.2.0';

        if (remoteVersionCode > currentVersionCode) {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: `Đã có bản cập nhật mới v${remoteVersionName}!`,
            message: data.title || `Smart Teacher Schedule AI đã có bản cập nhật mới v${remoteVersionName}.`,
            detail: (data.releaseNotes || []).join('\n• ') + '\n\nThầy cô có muốn tải về bản cài đặt mới ngay bây giờ không?',
            buttons: ['Tải bản cài đặt mới (.exe)', 'Để sau'],
            defaultId: 0,
            cancelId: 1
          }).then((result) => {
            if (result.response === 0) {
              const downloadUrl = data.platforms?.windows?.setupUrl || 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_Setup_v2.2.0.exe';
              shell.openExternal(downloadUrl);
            }
          });
        } else if (manual) {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Phiên bản mới nhất',
            message: `Thầy cô đang sử dụng phiên bản v2.2.0 mới nhất của Smart Teacher Schedule AI.`,
            buttons: ['Đồng ý']
          });
        }
      } catch (err) {
        if (manual) {
          dialog.showMessageBox(mainWindow, {
            type: 'error',
            title: 'Kiểm tra cập nhật',
            message: 'Không thể kết nối đến máy chủ kiểm tra phiên bản. Vui lòng thử lại sau.',
            buttons: ['Đóng']
          });
        }
      }
    });
  }).on('error', () => {
    if (manual) {
      dialog.showMessageBox(mainWindow, {
        type: 'error',
        title: 'Lỗi mạng',
        message: 'Vui lòng kiểm tra kết nối Internet của máy tính.',
        buttons: ['Đóng']
      });
    }
  });
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    // Check updates after 5s of startup
    setTimeout(() => {
      checkForUpdates(false);
    }, 5000);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
