const electron = require("electron");
const { ipcRenderer } = electron;

let btnEndDay = document.querySelector("#btnEndDay");
let btnMinimizeApp = document.querySelector("#btnMinimizeApp");
let btnCloseApp = document.querySelector("#btnCloseApp");
let lblTodayDate = document.querySelector("#lblTodayDate");
let jobListContainer = document.querySelector("#jobListContainer");
let btnSaveJob = document.querySelector("#btnSaveJob");
let txtNewJob = document.querySelector("#txtNewJob");
let btnGetHistory = document.querySelector("#btnGetHistory");
let brand = document.querySelector("#brand");

let keysPressed = {};

btnEndDay.addEventListener("click", e=> {
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

btnSaveJob.addEventListener("click", e => {
  e.preventDefault();
  ipcRenderer.send("job:merge", {
    id: e.target.getAttribute("data-id"),
    detail: txtNewJob.value
  });
});


brand.addEventListener("click", e => {
  e.preventDefault();
  ipcRenderer.send("app:home");
});

btnGetHistory.addEventListener("click", e => {
  e.preventDefault();
  ipcRenderer.send("app:history");
});

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
}

// Sayfa ilk açılırken veritabanındaki işleri ekrana getirmek için kullanılıyor.
ipcRenderer.on("app:init", (e, jobs) => {
  console.log(jobs);
  jobListContainer.innerHTML = "";
  txtNewJob.value = "";
  btnSaveJob.removeAttribute("data-id");
  if (jobs.length > 0) {
    jobs.forEach(job => {
      AddJob(job);
    });
  } else {
    const card = document.createElement("div");
    card.className = "card bg-warning text-dark border-0 rounded-0";
    const cardBody = document.createElement("div");
    cardBody.className = "card-body p-3 text-center";
    cardBody.innerHTML = `<i class="fa fa-exclamation-circle fa-3x"></i><br><h5 class="mt-3">Bugün Hiç Çalışmamışsınız.</h5>`;
    card.appendChild(cardBody);
    jobListContainer.appendChild(card);
  }
});

// Ekrana bir iş yazdırmak için kullanılıyor.
function AddJob(job) {
  const row = document.createElement("div");
  row.className = "row form-group";
  const col = document.createElement("div");
  col.className = "col-md-12";
  const card = document.createElement("div");
  card.className = "card bg-dark text-light border-0 rounded-0";
  const cardBody = document.createElement("div");
  cardBody.className = "card-body p-3";
  const span = document.createElement("span");
  span.innerText = job.jobDetails;
  const cardFooter = document.createElement("div");
  cardFooter.className = "card-footer bg-light rounded-0 text-right p-0";
  const btnEdit = document.createElement("button");
  btnEdit.className = "btn btn-primary btn-sm rounded-0 mr-1";
  btnEdit.title = "Düzenle";
  btnEdit.innerHTML = `<i class="fa fa-edit" data-id="${job.jobId}"></i>`;
  btnEdit.setAttribute("data-id", job.jobId);

  btnEdit.addEventListener("click", e => {
    e.preventDefault();
    txtNewJob.value = job.jobDetails;
    btnSaveJob.setAttribute("data-id", job.jobId);
  });

  const btnRemove = document.createElement("button");
  btnRemove.className = "btn btn-danger btn-sm rounded-0";
  btnRemove.title = "Sil";
  btnRemove.innerHTML = `<i class="fa fa-trash" data-id="${job.jobId}"></i>`;
  btnRemove.setAttribute("data-id", job.jobId);

  btnRemove.addEventListener("click", e => {
    e.preventDefault();
    ipcRenderer.send("job:remove", e.target.getAttribute("data-id"));
  });

  cardFooter.appendChild(btnEdit);
  cardFooter.appendChild(btnRemove);
  cardBody.appendChild(span);
  card.appendChild(cardBody);
  card.appendChild(cardFooter);
  col.appendChild(card);
  row.appendChild(col);

  jobListContainer.appendChild(row);
}

OnLoad();
