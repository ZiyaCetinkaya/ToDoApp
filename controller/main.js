const electron = require("electron");
const url = require("url");
const path = require("path");
const MyDialogs = require("../controller/myDialogs");
const DataAccess = require("./dataAccess");

const { app, BrowserWindow, ipcMain } = electron;
let mainWindow;
let enDayWindow;
let das = new DataAccess();

app.on("ready", e => {
  app.allowRendererProcessReuse = true;
  das.ControlJsonFile();
  CreateMainWindow();

  mainWindow.webContents.once("dom-ready", () => {
    GetJobs();
  });
});

function CreateMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Günlük İş Takibi",
    // alwaysOnTop: true,
    backgroundColor: "#123131",
    frame: false,
    show: false,
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    webPreferences: {
      // js dosyasında require kullanabilmek için ekledim
      nodeIntegration: true
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "../view/mainWindow.html"),
      protocol: "file",
      slashes: true
    })
  );

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
}

function CreateEndDayWindow() {
  enDayWindow = new BrowserWindow({
    width: 640,
    height: 480,
    title: "Günü Bitir",
    modal: true,
    hasShadow: true,
    parent: mainWindow,
    resizable: false,
    minimizable: false,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      // js dosyasında require kullanabilmek için ekledim
      nodeIntegration: true
    }
  });
}

ipcMain.on("app:endDay", () => {
  CreateEndDayWindow();

  enDayWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "../view/endDay.html"),
      protocol: "file",
      slashes: true
    })
  );

  enDayWindow.webContents.once("dom-ready", () => {
    GetJobsForEndDay();
    enDayWindow.show();
  });
});

ipcMain.on("app:minimize", () => {
  mainWindow.minimize();
});

ipcMain.on("app:home", () => {
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "../view/mainWindow.html"),
      protocol: "file",
      slashes: true
    })
  );
  mainWindow.webContents.on("did-finish-load", () => {
    GetJobs();
  });
});

ipcMain.on("app:history", () => {
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "../view/history.html"),
      protocol: "file",
      slashes: true
    })
  );

  let today = new Date().toISOString().substr(0, 10);
  mainWindow.webContents.on("did-finish-load", () => {
    GetJobsByDate(today);
  });
});

ipcMain.on("app:exit", () => {
  let dialog = new MyDialogs("UYARI", "Uygulama Kapatılsın Mı?", mainWindow);
  if (dialog.AskQuestionDialog() === 0) {
    app.quit();
  }
});

ipcMain.on("job:remove", (e, jobId) => {
  let dialog = new MyDialogs(
    "UYARI",
    "İş Kaydı Silinecek.\nDevam Edilsin Mi?",
    mainWindow
  );
  if (dialog.AskQuestionDialog() === 0) {
    RemoveJob(jobId);
    GetJobs();
  }
});

ipcMain.on("job:merge", (e, { id, detail }) => {
  if (detail) {
    if (!id) {
      AddNewJob(detail);
      GetJobs();
    } else {
      UpdateJob(id, detail);
      GetJobs();
    }
  } else {
    let dialog = new MyDialogs("UYARI", "İş Detayı Yazmalısınız.", mainWindow);
    dialog.ErrorDialog();
  }
});

ipcMain.on("history:search", (e, date) => {
  if (date) {
    GetJobsByDate(date);
  } else {
    let dialog = new MyDialogs("UYARI", "Tarih Belirtmelisiniz.", mainWindow);
    dialog.ErrorDialog();
  }
});

ipcMain.on("copy:ok", () => {
  let dialog = new MyDialogs("OK", "Metin Panoya Kopyalandı.", mainWindow);
  dialog.OkDialog();
});

function GetJobs() {
  let result = das.GetTodayJobs_Json();
  mainWindow.webContents.send("app:init", result);
  // das.GetJobs(function(err, result) {
  //   if (err) console.log(err);
  //   else mainWindow.webContents.send("app:init", result);
  // });
}

function GetJobsByDate(date) {
  let result = das.GetJobsByDate_Json(date);
  mainWindow.webContents.send("history:searchResult", result);
  // das.GetJobsByDate(date, function (err, result) {
  //   if (err) console.log(err);
  //   else mainWindow.webContents.send("history:searchResult", result);
  // });
}

function GetJobsForEndDay() {
  let text = das.GetJobsForEndDay_Json();
  enDayWindow.webContents.send("endDay:init", text);
  // das.GetJobsForEndDay(function (err, text) {
  //   if (err) console.log(err);
  //   else enDayWindow.webContents.send("endDay:init", text);
  // });
}

function RemoveJob(jobId) {
  try {
    das.RemoveJob_Json(jobId);
    let dialog = new MyDialogs("OK", "İş Kaydı Silidi.", mainWindow);
    dialog.OkDialog();
  } catch (error) {
    console.error(error.message);
  }

  // das.RemoveJob(jobId, function (err, result) {
  //   if (err) console.log(err);
  //   if (result > 0) {
  //     let dialog = new MyDialogs("OK", "İş Kaydı Silidi.", mainWindow);
  //     dialog.OkDialog();
  //   }
  // });
}

function AddNewJob(detail) {
  try {
    das.AddNewJob_Json(detail);
    let dialog = new MyDialogs(
      "OK",
      "Yeni İş Kaydı Oluşturuldu.",
      mainWindow
    );
    dialog.OkDialog();
  } catch (error) {
    let dialog = new MyDialogs(
      "UYARI",
      "Yeni İş Kaydı Oluşturulamadı.",
      mainWindow
    );
    dialog.ErrorDialog();
  }

  // das.AddNewJob(detail, function (err, result) {
  //   if (err) console.log(err);
  //   if (result > 0) {
  //     let dialog = new MyDialogs(
  //       "OK",
  //       "Yeni İş Kaydı Oluşturuldu.",
  //       mainWindow
  //     );
  //     dialog.OkDialog();
  //   } else {
  //     let dialog = new MyDialogs(
  //       "UYARI",
  //       "Yeni İş Kaydı Oluşturulamadı.",
  //       mainWindow
  //     );
  //     dialog.ErrorDialog();
  //   }
  // });
}

function UpdateJob(id, detail) {
  try {
    das.UpdateJob_Json(id, detail);
    let dialog = new MyDialogs("OK", "İş Kaydı Güncellendi.", mainWindow);
    dialog.OkDialog();
  } catch (error) {
    let dialog = new MyDialogs(
      "UYARI",
      "İş Kaydı Güncellenemedi.",
      mainWindow
    );
    dialog.ErrorDialog();
  }
  // das.UpdateJob(id, detail, function (err, result) {
  //   if (err) console.log(err);
  //   if (result > 0) {
  //     let dialog = new MyDialogs("OK", "İş Kaydı Güncellendi.", mainWindow);
  //     dialog.OkDialog();
  //   } else {
  //     let dialog = new MyDialogs(
  //       "UYARI",
  //       "İş Kaydı Güncellenemedi.",
  //       mainWindow
  //     );
  //     dialog.ErrorDialog();
  //   }
  // });
}
