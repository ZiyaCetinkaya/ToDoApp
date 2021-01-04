const electron = require("electron");
const { dialog } = electron;

module.exports = class MyDialogs {
  constructor(title, message, win) {
    this.title = title;
    this.message = message;
    this.win = win;
  }

  AskQuestionDialog() {
    let options = {};
    let rslt = 1;
    options.type = "warning";
    options.title = this.title;
    options.message = this.message;
    options.buttons = ["&Yes", "&No"];
    options.cancelId = 2;
    options.noLink = true;
    options.position = "center";

    rslt = dialog.showMessageBoxSync(this.win, options);

    return rslt;
  }

  OkDialog() {
    let options = {};
    let rslt = 1;
    options.type = "info";
    options.title = this.title;
    options.message = this.message;
    options.buttons = ["&Ok"];
    options.cancelId = 2;
    options.noLink = true;

    dialog.showMessageBoxSync(this.win, options);
  }

  ErrorDialog() {
    let options = {};
    let rslt = 1;
    options.type = "error";
    options.title = this.title;
    options.message = this.message;
    options.buttons = ["&Ok"];
    options.cancelId = 2;
    options.noLink = true;

    dialog.showMessageBoxSync(this.win, options);
  }
};
