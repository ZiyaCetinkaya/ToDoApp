const electron = require("electron");
const { ipcRenderer } = electron;

let btnGetHistory = document.querySelector("#btnGetHistory");
let brand = document.querySelector("#brand");
let btnSearchHistory = document.querySelector('#btnSearchHistory');
let txtDate = document.querySelector('#txtDate');
let jobListContainer = document.querySelector('#jobListContainer');

brand.addEventListener("click", e => {
    e.preventDefault();
    ipcRenderer.send("app:home");
});

btnGetHistory.addEventListener("click", e => {
    e.preventDefault();
    ipcRenderer.send("app:history");
});

btnEndDay.addEventListener("click", e => {
    e.preventDefault();
    ipcRenderer.send("app:endDay");
});

// Sayfayı minimize etmek için kullanılıyor.
btnMinimizeApp.addEventListener("click", e => {
    e.preventDefault();
    ipcRenderer.send("app:minimize");
});

// Uygulamayı kapatmak için kullanılıyor.
btnCloseApp.addEventListener("click", e => {
    e.preventDefault();
    ipcRenderer.send("app:exit");
});

btnSearchHistory.addEventListener("click", e => {
    e.preventDefault();
    let date = txtDate.value;
    ipcRenderer.send("history:search", date = date);
});

ipcRenderer.on("history:searchResult", (e, results) => {
    LoadJobsByDate(results);
});

function LoadJobsByDate(results) {
    jobListContainer.innerHTML = "";
    if (results.length > 0) {
        results.forEach(job => {
            const col = document.createElement("div");
            col.className = "col-md-12 mt-2";
            const card = document.createElement("div");
            card.className = "card bg-dark text-light border-0 rounded-0";
            const cardBody = document.createElement("div");
            cardBody.className = "card-body p-2";
            const span = document.createElement("span");
            span.innerText = job.jobDetails;

            cardBody.appendChild(span);
            card.appendChild(cardBody);
            col.appendChild(card);
            jobListContainer.appendChild(col);
        });
    } else {
        const col = document.createElement("div");
        col.className = "col-md-12 mt-2";
        const card = document.createElement("div");
        card.className = "card bg-warning text-dark border-0 rounded-0";
        const cardBody = document.createElement("div");
        cardBody.className = "card-body p-3 text-center";
        cardBody.innerHTML = `<i class="fa fa-exclamation-circle fa-3x"></i><br><h5 class="mt-3">${txtDate.value} Tarihinde Hiç Çalışmamışsınız.</h5>`;
        card.appendChild(cardBody);
        col.appendChild(card);
        jobListContainer.appendChild(col);
    }
}

// Sayfa ilk load olurken yapılacak işlemler için kullanılıyor.
function OnLoad() {
    // Sağ üst köşedeki tarih bilgisi dolduruluyor.
    let date = new Date();
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let month =
        date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1;
    lblTodayDate.innerHTML = `${day}/${month}/${date.getFullYear()}`;


    let today = new Date().toISOString().substr(0, 10);
    document.querySelector("#txtDate").value = today;

}


OnLoad();