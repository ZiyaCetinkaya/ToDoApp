const electron = require("electron");
const { ipcRenderer, clipboard } = electron;

let txtEndDay = document.querySelector("#txtEndDay");
let btnEndDay = document.querySelector("#btnEndDay");

ipcRenderer.on("endDay:init", (e, text) => {
    txtEndDay.value = text;
});

btnEndDay.addEventListener('click', e => {
    e.preventDefault();
    clipboard.writeText(txtEndDay.value);
    ipcRenderer.send("copy:ok");
});
