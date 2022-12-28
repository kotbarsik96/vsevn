const tableWrapper = document.querySelector(".datetable_wrapper ");

document.querySelector('#calendar2_out').onclick = function () {
  document.querySelector('.datetable_wrapper').classList.toggle("datetable_active");
}
document.querySelector('#calendar3_out').onclick = function () {
  document.querySelector('.datetable_wrapper').classList.toggle("datetable_active");
}
months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function Calendar2(id, year, month) {
  var Dlast = new Date(year, month + 1, 0).getDate(),
    D = new Date(year, month, Dlast),
    DNlast = new Date(D.getFullYear(), D.getMonth(), Dlast).getDay(),
    DNfirst = new Date(D.getFullYear(), D.getMonth(), 1).getDay(),
    calendar = '<tr>',
    monthNum = month;
  month = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  if (DNfirst != 0) {
    for (var i = 1; i < DNfirst; i++) calendar += '<td>';
  } else {
    for (var i = 0; i < 6; i++) calendar += '<td>';
  }
  for (var i = 1; i <= Dlast; i++) {
    if (i == new Date().getDate() && D.getFullYear() == new Date().getFullYear() && D.getMonth() == new Date().getMonth()) {
      calendar += '<td class="havedate">' + i;
    } else {
      calendar += '<td class="havedate">' + i;
    }
    if (new Date(D.getFullYear(), D.getMonth(), i).getDay() == 0) {
      calendar += '<tr>';
    }
  }
  for (var i = DNlast; i < 7; i++) calendar += '<td>&nbsp;';
  document.querySelector('#' + id + ' tbody').innerHTML = calendar;
  document.querySelector('#' + id + ' thead tr:nth-child(2) td:nth-child(2)').innerHTML = '<div><select class="CalendarSelectt"><option value="0">Январь</option><option value="1">Февраль</option><option value="2">Март</option><option value="3">Апрель</option><option value="4" selected>Май</option><option value="5">Июнь</option><option value="6">Июль</option><option value="7">Август</option><option value="8">Сентябрь</option><option value="9">Октябрь</option><option value="10">Ноябрь</option><option value="11">Декабрь</option></select></div>';

  document.querySelector('#' + id + ' thead td:nth-child(2)').innerHTML = '<div><select class="CalendarSelectt"><option value="2020">2020</option><option value="2021">2021</option><option value="2022">2022</option></select></div>';

  let SelYear = document.querySelectorAll('#' + id + ' tr:nth-child(1) option');
  let SelMon = document.querySelectorAll('#' + id + ' tr:nth-child(2) option');

  for (let u = 0; u < SelMon.length; u++) {
    if (SelMon[u].hasAttribute('selected')) {
      SelMon[u].removeAttribute('selected');
    }
    if (SelMon[u].value == D.getMonth()) {
      SelMon[u].setAttribute('selected', true)
    }
  }
  for (let u = 0; u < SelYear.length; u++) {
    if (SelYear[u].hasAttribute('selected')) {
      SelYear[u].removeAttribute('selected');
    }
    if (SelYear[u].value == D.getFullYear()) {
      SelYear[u].setAttribute('selected', true);
    }
  }
  document.querySelector('#' + id + ' thead td:nth-child(2)').dataset.month = D.getMonth();
  document.querySelector('#' + id + ' thead td:nth-child(2)').dataset.year = D.getFullYear();
  if (document.querySelectorAll('#' + id + ' tbody tr').length < 6) {  // чтобы при перелистывании месяцев не "подпрыгивала" вся страница, добавляется ряд пустых клеток. Итог: всегда 6 строк для цифр
    document.querySelector('#' + id + ' tbody').innerHTML += '<tr class="table_last_row"><td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;';
  }

  let lastRows = document.querySelectorAll('.table_last_row');
  if (lastRows.length == 2) {
    for (let y = 0; y < lastRows.length; y++) {
      lastRows[y].remove();
    }
  }
}

// выставить первоначальные значения (январь текущего года: 1 по 31 число)
// выставить год и месяц
Calendar2("calendar2", new Date().getFullYear(), 0);
Calendar2("calendar3", new Date().getFullYear(), 0);

// выставить дни
let calendarsData = getCalendarsData();
let clickEvent = new Event("click");
setTimeout(() => {
  calendarsData.cdr2FirstDay.dispatchEvent(clickEvent);
  calendarsData.cdr3LastDay.dispatchEvent(clickEvent);
}, 0);

// если есть аргументы cdDayValue, функция укажет на их основе аналогичные дни. Если аргументов нет - попытается найти ".active_date".
function getCalendarsData(cdr2DayValue = null, cdr3DayValue = null) {
  let cdr2 = document.querySelector("#calendar2");
  let cdr3 = document.querySelector("#calendar3");
  let cdr2FirstDay = cdr2.querySelector(".havedate");
  let cdr3Days = cdr3.querySelectorAll(".havedate");
  let cdr3LastDay = cdr3Days[cdr3Days.length - 1];

  let cdr2Day;
  let cdr3Day;
  if (cdr2DayValue && cdr3DayValue) {
    cdr2Day = Array.from(cdr2.querySelectorAll(".havedate"))
      .find(date => parseInt(date.innerHTML) == cdr2DayValue);
    cdr3Day = Array.from(cdr3.querySelectorAll(".havedate"))
      .find(date => parseInt(date.innerHTML) == cdr3DayValue);

    if (!cdr2Day && cdr2DayValue > 28) {
      let days = cdr2.querySelectorAll(".havedate");
      cdr2Day = days[days.length - 1];
    }
    if (!cdr3Day && cdr3DayValue > 28) {
      let days = cdr3.querySelectorAll(".havedate");
      cdr3Day = days[days.length - 1];
    }
  } else {
    let c2ActiveDate = cdr2.querySelector(".active_date");
    let c3ActiveDate = cdr3.querySelector(".active_date");
    if (c2ActiveDate) cdr2Day = parseInt(c2ActiveDate.innerHTML);
    if (c3ActiveDate) cdr3Day = parseInt(c3ActiveDate.innerHTML);
  }

  return {
    cdr2,
    cdr3,
    cdr2Day,
    cdr3Day,
    cdr2FirstDay,
    cdr3LastDay
  }
}

calendar2Start();
function calendar2Start() {
  u = 0;
  calendar2tdList = document.querySelectorAll('#calendar2 .havedate');
  for (u = 0; u < calendar2tdList.length; u++) {
    calendar2tdList[u].onclick = function (event) {
      let td2Text = this.innerText;
      if (td2Text >= 1 & td2Text <= 9) {
        td2Text = '0' + td2Text;
      }
      let monthValue = parseInt(
        document.querySelector("#calendar2 thead tr:nth-child(2) select").value
      );
      month2List = months[monthValue];
      if (month2List == 'Август' || month2List == 'Март') {
        month2List += 'а';
      } else {
        month2List = month2List.slice(0, -1);
        month2List += 'я';
      }
      year2List = document.querySelector('#calendar2 thead tr:nth-child(1) select').value;

      let calendar2Out = document.querySelector('#calendar2_out');
      calendar2Out.innerText = td2Text + ' ' + month2List + ' ' + year2List;
      calendar2Out.dataset.dateValue = `${td2Text}.${monthValue + 1}.${year2List}`;

      document.querySelector('#calendar2').parentElement.childNodes[1].value = td2Text + ' ' + month2List + ' ' + year2List;
      this.classList.add('active_date');

      for (i = 0; i < calendar2tdList.length; i++) {
        calendar2tdList[i].classList.remove('active_date');
      }
      this.classList.add('active_date');
      tableWrapper.dispatchEvent(new CustomEvent("date-change", { detail: { calendarNum: 2, isTrusted: event.isTrusted } }));
    }
  }

}

var cal2selYear = 0;
CalenSelcYear2 = document.querySelector('#calendar2 > thead > tr:nth-child(1) td:nth-child(2)');
CalenSelcYear2.onclick = function () {
  cal2selYear += 1;
  if (cal2selYear % 2 == 0) {
    cal2YearGet = parseFloat(document.querySelector("#calendar2 thead tr:nth-child(1) select").value);
    Calendar2("calendar2", cal2YearGet, document.querySelector('#calendar2 thead td:nth-child(2)').dataset.month);
    calendar2Start();
  }

}
var cal3selYear = 0;
CalenSelcYear3 = document.querySelector('#calendar3 > thead > tr:nth-child(1) td:nth-child(2)');
CalenSelcYear3.onclick = function () {
  cal3selYear += 1;
  if (cal3selYear % 2 == 0) {
    cal3YearGet = parseFloat(document.querySelector("#calendar3 thead tr:nth-child(1) select").value);
    Calendar2("calendar3", cal3YearGet, document.querySelector('#calendar3 thead td:nth-child(2)').dataset.month);
    calendar3Start();
  }
}

var cal2selMonth = 0;
CalenSelcMonth2 = document.querySelector('#calendar2 > thead > tr:nth-child(2) td:nth-child(2)');
CalenSelcMonth2.onclick = function () {
  cal2selMonth += 1;
  if (cal2selMonth % 2 == 0) {
    cal2MonthGet = parseFloat(document.querySelector("#calendar2 thead tr:nth-child(2) select").value);
    Calendar2("calendar2", document.querySelector('#calendar2 thead td:nth-child(2)').dataset.year, cal2MonthGet);
    calendar2Start();
  }
}
var cal3selMonth = 0;
CalenSelc3 = document.querySelector('#calendar3 > thead > tr:nth-child(2) td:nth-child(2)');
CalenSelc3.onclick = function () {
  cal3selMonth += 1;
  if (cal3selMonth % 2 == 0) {
    cal3MonthGet = parseFloat(document.querySelector("#calendar3 thead tr:nth-child(2) select").value);
    Calendar2("calendar3", document.querySelector('#calendar3 thead td:nth-child(2)').dataset.year, cal3MonthGet);
    calendar3Start();
  }
}

// переключатель минус месяц
document.querySelector(' #calendar2 thead tr:nth-child(2) td:nth-child(1)').onclick = calendar2MonthMinus;
// переключатель плюс месяц
document.querySelector(' #calendar2 thead tr:nth-child(2) td:nth-child(3)').onclick = calendar2MonthPlus;

function calendar2MonthMinus() {
  Calendar2("calendar2", document.querySelector('#calendar2 thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar2 thead td:nth-child(2)').dataset.month) - 1);
  calendar2Start();
}
function calendar2MonthPlus() {
  Calendar2("calendar2", document.querySelector('#calendar2 thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar2 thead td:nth-child(2)').dataset.month) + 1);
  calendar2Start();
}


// переключатель минус год
document.querySelector(' #calendar2 thead tr:nth-child(1) td:nth-child(1)').onclick = calendar2YearMinus;
// переключатель плюс год
document.querySelector('#calendar2 thead tr:nth-child(1) td:nth-child(3) ').onclick = calendar2YearPlus;

function calendar2YearMinus() {
  if (document.querySelector('#calendar2 thead td:nth-child(2)').dataset.year == 2020) {
    alert('У вас нет в выбираемом периоде резюме соискателей')
  } else {
    Calendar2("calendar2", parseFloat(document.querySelector('#calendar2 thead td:nth-child(2)').dataset.year) - 1, document.querySelector('#calendar2 thead td:nth-child(2)').dataset.month);
    calendar2Start();
  }

}
function calendar2YearPlus() {
  if (document.querySelector('#calendar2 thead td:nth-child(2)').dataset.year == 2022) {
    alert('У вас нет в выбираемом периоде резюме соискателей')
  } else {
    Calendar2("calendar2", parseFloat(document.querySelector('#calendar2 thead td:nth-child(2)').dataset.year) + 1, document.querySelector('#calendar2 thead td:nth-child(2)').dataset.month);
    calendar2Start();
  }
}

//
//
//  Calendar 3
//
//  

calendar3Start();
function calendar3Start() {
  u = 0;
  calendar3tdList = document.querySelectorAll('#calendar3 .havedate');
  for (u = 0; u < calendar3tdList.length; u++) {
    calendar3tdList[u].onclick = function (event) {
      let td3Text = this.innerText;
      if (td3Text >= 1 & td3Text <= 9) {
        td3Text = '0' + td3Text;
      }
      let monthValue = parseInt(
        document.querySelector("#calendar3 thead tr:nth-child(2) select").value
      );
      month3List = months[monthValue];
      if (month3List == 'Август' || month3List == 'Март') {
        month3List += 'а';
      } else {
        month3List = month3List.slice(0, -1);
        month3List += 'я';
      }

      year3List = document.querySelector('#calendar3 thead tr:nth-child(1) select').value;
      let calendar3Out = document.querySelector('#calendar3_out');
      calendar3Out.innerText = td3Text + ' ' + month2List + ' ' + year2List;
      calendar3Out.dataset.dateValue = `${td3Text}.${monthValue + 1}.${year2List}`;

      calendar3Out.innerText = td3Text + ' ' + month3List + ' ' + year3List;
      calendar3Out.dataset.dateValue = `${td3Text}.${monthValue + 1}.${year3List}`;
      document.querySelector('#calendar3').parentElement.childNodes[1].value = td3Text + ' ' + month3List + ' ' + year3List;


      for (i = 0; i < calendar3tdList.length; i++) {
        calendar3tdList[i].classList.remove('active_date');
      }
      this.classList.add('active_date');
      document.querySelector('.datetable_wrapper').classList.remove('datetable_active');
      tableWrapper.dispatchEvent(new CustomEvent("date-change", { detail: { calendarNum: 3, isTrusted: event.isTrusted } }));
    }
  }

}

// переключатель минус месяц
document.querySelector('#calendar3 thead tr:nth-child(2) td:nth-child(1)').onclick = calendar3MonthMinus;
// переключатель плюс месяц
document.querySelector(' #calendar3 thead tr:nth-child(2) td:nth-child(3)').onclick = calendar3MonthPlus;

function calendar3MonthPlus() {
  Calendar2("calendar3", document.querySelector('#calendar3 thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar3 thead td:nth-child(2)').dataset.month) + 1);
  calendar3Start();
}
function calendar3MonthMinus() {
  Calendar2("calendar3", document.querySelector('#calendar3 thead td:nth-child(2)').dataset.year, parseFloat(document.querySelector('#calendar3 thead td:nth-child(2)').dataset.month) - 1);
  calendar3Start();
}

// переключатель минус год
document.querySelector('#calendar3 thead tr:nth-child(1) td:nth-child(1) ').onclick = calendar3YearMinus;
// переключатель плюс год
document.querySelector('#calendar3 thead tr:nth-child(1) td:nth-child(3) ').onclick = calendar3YearPlus;

function calendar3YearMinus() {
  if (document.querySelector('#calendar3 thead td:nth-child(2)').dataset.year == 2020) {
    alert('У вас нет в выбираемом периоде резюме соискателей')
  } else {
    Calendar2("calendar3", parseFloat(document.querySelector('#calendar3 thead td:nth-child(2)').dataset.year) - 1, document.querySelector('#calendar3 thead td:nth-child(2)').dataset.month);
    calendar3Start();
  }

}
function calendar3YearPlus() {
  if (document.querySelector('#calendar3 thead td:nth-child(2)').dataset.year == 2022) {
    alert('У вас нет в выбираемом периоде резюме соискателей')
  } else {
    Calendar2("calendar3", parseFloat(document.querySelector('#calendar3 thead td:nth-child(2)').dataset.year) + 1, document.querySelector('#calendar3 thead td:nth-child(2)').dataset.month);
    calendar3Start();
  }

}

document.querySelector('.datetable_wrapper > button').addEventListener('click', e => {
  document.querySelector('.datetable_wrapper').classList.remove('datetable_active');

});

// стрелки: минус/плюс месяц/день
let calendarDayBack = document.querySelector("#calendar_day-back");
let calendarMonthBack = document.querySelector("#calendar_month-back");
let calendarDayNext = document.querySelector("#calendar_day-next");
let calendarMonthNext = document.querySelector("#calendar_month-next");
// стрелка: за весь период
let calendarAllPeriod = document.querySelector("#calendar_period");

function calendarControlsMonth(direction = "back") {
  // direction = "back"|"next"
  let calendarsOldData = getCalendarsData();
  if (direction == "back") calendar3MonthMinus();
  else calendar3MonthPlus();

  let calendarsNewData = getCalendarsData(calendarsOldData.cdr2Day, calendarsOldData.cdr3Day);

  calendarsNewData.cdr2Day.dispatchEvent(clickEvent);
  calendarsNewData.cdr3Day.dispatchEvent(clickEvent);
}
function calendarControlsDay(direction = "back") {
  // direction = "back"|"next"
  let calendarsOldData = getCalendarsData();

  if (direction === "back") {

    if (calendarsOldData.cdr3Day <= 1) toPrevMonth("3");
    else getPrevDay("3");

    function toPrevMonth(calendarId = "2") {
      // calendarId == "2"|"3"
      calendarId === "2" ? calendar2MonthMinus() : calendar3MonthMinus();
      let calendarsNewData = getCalendarsData();
      let cdr = calendarId === "2" ? calendarsNewData.cdr2 : calendarsNewData.cdr3;
      let days = cdr.querySelectorAll(".havedate");
      let lastDay = days[days.length - 1];
      lastDay.dispatchEvent(clickEvent);
    }
    function getPrevDay(calendarId = "2") {
      let cdr = calendarId === "2" ? calendarsOldData.cdr2 : calendarsOldData.cdr3;
      let cdrDay = calendarId === "2" ? calendarsOldData.cdr2Day : calendarsOldData.cdr3Day;

      let prevDay = parseInt(cdrDay) - 1;
      let prevDayBlock = Array.from(cdr.querySelectorAll(".havedate"))
        .find(day => parseInt(day.innerHTML) === prevDay);
      prevDayBlock.dispatchEvent(clickEvent);
    }
  }

  if (direction === "next") {
    let calendar3NextDay = getNextCalendarDay("3");

    if (calendar3NextDay.nextDayBlock) calendar3NextDay.nextDayBlock.dispatchEvent(clickEvent);
    else toNextMonth("3");

    function getNextCalendarDay(calendarId = "2") {
      let cdr = calendarId === "2" ? calendarsOldData.cdr2 : calendarsOldData.cdr3;
      let currentDay = calendarId === "2" ? calendarsOldData.cdr2Day : calendarsOldData.cdr3Day;
      let nextDay = parseInt(currentDay) + 1;
      let nextDayBlock = Array.from(cdr.querySelectorAll(".havedate"))
        .find(day => parseInt(day.innerHTML) === nextDay);

      return { nextDayBlock, nextDay };
    }
    function toNextMonth(calendarId = "2") {
      calendarId == "2" ? calendar2MonthPlus() : calendar3MonthPlus();
      let newCalendarsData = getCalendarsData();
      let cdr = calendarId == "2" ? newCalendarsData.cdr2 : newCalendarsData.cdr3;
      let nextDayBlock = cdr.querySelector(".havedate");
      nextDayBlock.dispatchEvent(clickEvent);
    }
  }
}

function calendarControlsPeriod() {
  Calendar2("calendar2", 2020, 0);
  Calendar2("calendar3", new Date().getFullYear(), 11);
  calendar2Start();
  calendar3Start();

  let calendarsData = getCalendarsData();
  calendarsData.cdr2FirstDay.dispatchEvent(clickEvent);
  calendarsData.cdr3LastDay.dispatchEvent(clickEvent);
}


// минус месяц
calendarMonthBack.addEventListener("click", () => calendarControlsMonth("back"));
// плюс месяц
calendarMonthNext.addEventListener("click", () => calendarControlsMonth("next"));

// минус день
calendarDayBack.addEventListener("click", () => calendarControlsDay("back"));
// плюс день
calendarDayNext.addEventListener("click", () => calendarControlsDay("next"));

// за весь период
calendarAllPeriod.addEventListener("click", () => calendarControlsPeriod());

// контролировать, чтобы левая дата была раньше, чем правая
tableWrapper.addEventListener("date-change", function (event) {
  setTimeout(() => {
    let startDate = document.querySelector("#calendar2_out").dataset.dateValue;
    let endDate = document.querySelector("#calendar3_out").dataset.dateValue;

    if (startDate && endDate) {
      startDate = startDate.split(".").map(num => parseInt(num));
      endDate = endDate.split(".").map(num => parseInt(num));

      let days = { start: startDate[0], end: endDate[0] };
      let months = { start: startDate[1], end: endDate[1] };
      let years = { start: startDate[2], end: endDate[2] };

      let isIncorrectEndYear = years.start > years.end;
      let isIncorrectEndMonth = !isIncorrectEndYear && months.start > months.end;
      let isIncorrectEndDay = !isIncorrectEndYear && !isIncorrectEndMonth && days.start > days.end;

      let isIncorrectEndDate = isIncorrectEndYear
        || isIncorrectEndMonth
        || isIncorrectEndDay;

      if (isIncorrectEndDate) {
        if (event.detail.calendarNum == 2 || !event.detail.isTrusted) {
          Calendar2("calendar3", years.start, months.start - 1);
          calendar3Start();
          let dayCell = Array.from(document.querySelectorAll("#calendar3 .havedate"))
            .find(date => date.textContent == days.start);
          if (dayCell) dayCell.dispatchEvent(clickEvent);
        }
        if (event.detail.calendarNum == 3 && event.detail.isTrusted) {
          if (event.detail.isTrusted) {
            Calendar2("calendar2", years.end, months.end - 1);
            calendar2Start();
            let dayCell = Array.from(document.querySelectorAll("#calendar2 .havedate"))
              .find(date => date.textContent == days.end);
            if (dayCell) dayCell.dispatchEvent(clickEvent);
          }
        }
      }
    }
  }, 0);
});