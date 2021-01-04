const db = require("../controller/connection").db;
const fs = require('fs');

module.exports = class DataAccess {
  GetJobs(callback) {
    var date = new Date();
    var currentdate =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    let sql = `SELECT * FROM job where jobDate = '${currentdate}'`;
    db.query(sql, (error, results, fields) => {
      if (error) return callback(error);
      callback(null, results);
    });
  }

  GetJobsByDate(date, callback) {
    let sql = `SELECT * FROM job where jobDate = '${date}'`;
    db.query(sql, (error, results, fields) => {
      if (error) {
        return callback(error);
      } else {
        callback(null, results);
      }
    });
  }

  GetJobsForEndDay(callback) {
    var date = new Date();
    var dayText, text;
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let month =
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1;
    var currentdate = `${day}/${month}/${date.getFullYear()}`;
    var currentdateForSearch =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    switch (date.getDay()) {
      case 0:
        dayText = "Pazar";
        break;
      case 1:
        dayText = "Pazartesi";
        break;
      case 2:
        dayText = "Salı";
        break;
      case 3:
        dayText = "Çarşamba";
        break;
      case 4:
        dayText = "Perşembe";
        break;
      case 5:
        dayText = "Cuma";
        break;
      case 6:
        dayText = "Cumartesi";
        break;
      default:
        dayText = "";
        break;
    }

    text = `${currentdate}\n${dayText} Günlük Raporu:\n\n`;
    let sql = `SELECT * FROM job where jobDate = '${currentdateForSearch}'`;
    db.query(sql, (error, results, fields) => {
      if (error) {
        return callback(error);
      } else {
        results.forEach(result => {
          text += `- ${result.jobDetails}\n`;
        });
        callback(null, text);
      }
    });
  }

  RemoveJob(jobId, callback) {
    db.query("DELETE FROM job WHERE jobId=?", jobId, (e, r, f) => {
      if (e) return callback(e);
      callback(null, r.affectedRows);
    });
  }

  AddNewJob(detail, callback) {
    var date = new Date();
    var currentdate =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    let sql = `INSERT INTO job SET jobDate='${currentdate}', jobDetails='${detail}'`;
    db.query(sql, (e, r, f) => {
      if (e) return callback(e);
      callback(null, r.affectedRows);
    });
  }

  UpdateJob(id, detail, callback) {
    let sql = `UPDATE job SET jobDetails = '${detail}' WHERE jobId = ${id}`;
    db.query(sql, (e, r, f) => {
      if (e) return callback(e);
      callback(null, r.affectedRows);
    });
  }

  ControlJsonFile() {
    let folderName = `data/${this.CreateFileName()}`;
    let exists = fs.existsSync(folderName);
    if (!exists) {
      console.log("-----");
      this.CreateJsonFile();
    }
  }

  GetJobs_Json() {
    let folderName = `data/${this.CreateFileName()}`;
    let fileContent = fs.readFileSync(folderName, 'utf-8');
    let jobs = [];
    if (fileContent !== "")
      jobs = JSON.parse(fileContent);

    return jobs;
  }

  GetTodayJobs_Json() {
    var currentdateForSearch = this.GetToday();
    let jobs = this.GetJobsByDate_Json(currentdateForSearch);

    return jobs;
  }

  GetJobsByDate_Json(date) {
    let jobs = this.GetJobs_Json();
    let myJobs = jobs.filter(function (value, index, arr) {
      return value.jobDate == date;
    });

    return myJobs;
  }

  GetJobsForEndDay_Json() {
    var date = new Date();
    var dayText, text;
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let month =
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1;
    var currentdate = `${day}/${month}/${date.getFullYear()}`;
    var currentdateForSearch = this.GetToday();
    switch (date.getDay()) {
      case 0:
        dayText = "Pazar";
        break;
      case 1:
        dayText = "Pazartesi";
        break;
      case 2:
        dayText = "Salı";
        break;
      case 3:
        dayText = "Çarşamba";
        break;
      case 4:
        dayText = "Perşembe";
        break;
      case 5:
        dayText = "Cuma";
        break;
      case 6:
        dayText = "Cumartesi";
        break;
      default:
        dayText = "";
        break;
    }

    text = `${currentdate}\n${dayText} Günlük Raporu:\n\n`;
    let jobs = this.GetJobsByDate_Json(currentdateForSearch);
    jobs.forEach(job => {
      text += `- ${job.jobDetails}\n`;
    });

    return text;
  }

  RemoveJob_Json(jobId) {
    let jobs = this.GetJobs_Json();
    let myJobs = jobs.filter(function (value) {
      return value.jobId != jobId;
    });
    this.CreateJsonFile(myJobs);
  }

  AddNewJob_Json(detail, id) {
    let jobs = this.GetJobs_Json();
    let _id;

    if (id) { _id = parseInt(id); }
    else { _id = this.GetNewId(); }

    let today = this.GetToday();
    jobs.push({
      jobId: _id,
      jobDetails: detail,
      jobDate: today
    });
    this.CreateJsonFile(jobs);
  }

  UpdateJob_Json(id, detail) {
    this.RemoveJob_Json(id);
    this.AddNewJob_Json(detail, id);
  }

  CreateFileName() {
    let date = new Date();
    let month = date.getMonth() + 1;

    let folderName;

    if (month == 1) { folderName = 'January' }
    else if (month == 2) { folderName = 'February' }
    else if (month == 3) { folderName = 'March' }
    else if (month == 4) { folderName = 'April' }
    else if (month == 5) { folderName = 'May' }
    else if (month == 6) { folderName = 'June' }
    else if (month == 7) { folderName = 'July' }
    else if (month == 8) { folderName = 'August' }
    else if (month == 9) { folderName = 'September' }
    else if (month == 10) { folderName = 'October' }
    else if (month == 11) { folderName = 'November' }
    else if (month == 12) { folderName = 'December' }
    else { folderName = 'Undefined' }

    return `${folderName}.json`;
  }

  CreateJsonFile(jobs) {
    // let jobs = this.GetJobs_Json();
    let folderName = `data/${this.CreateFileName()}`;
    let content;

    if (jobs) {
      content = JSON.stringify(jobs);
    } else {
      let _jobs = [];
      content = JSON.stringify(_jobs);
    }

    fs.writeFileSync(folderName, content);
  }

  GetNewId() {
    let maxId = 1;
    let jobs = this.GetJobs_Json();

    if (jobs.length > 0) {
      let lastJobId = jobs[jobs.length - 1].jobId;
      maxId = lastJobId + 1;
    }

    return maxId;
  }

  GetToday() {
    let date = new Date();
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let month =
      date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1;
    let year = date.getFullYear();
    let today = `${year}-${month}-${day}`;

    return today;
  }
}

