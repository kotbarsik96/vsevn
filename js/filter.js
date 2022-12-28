
optOldTxt = document.getElementById("optOld").textContent;
optZnkTxt = document.getElementById("optZnk").textContent;
optStatTxt = document.getElementById("optStat").textContent;
optVacTxt = document.getElementById("optVac").textContent;
optTypeTxt = document.getElementById("optType").textContent;
optCityTxt = document.getElementById("optCity").textContent;
optComTxt = document.getElementById("optCom").textContent;
optRezTxt = document.getElementById("optRez").textContent;
optFavsBlacklistTxt = document.querySelector("#optFavsBlacklist").textContent;
optEducationTxt = document.querySelector("#optEducation").textContent;
optRezumeStatusumeStatusTxt = "Работа с резюме";

filterContent = document.querySelector('.filters_wrapper').innerHTML;

function onFilterSelectsChange() {
    CheckClearFilter();
    doFilter();
}

function CheckClearFilter() {
    let clearFilterBtns = document.querySelectorAll(".foundation-clear_filter");
    let haveActiveSelc = false;
    let ourSelectCl = document.querySelectorAll('.filters_wrapper .selectBox');
    for (let i = 0; i < ourSelectCl.length; i++) {
        if (ourSelectCl[i].classList.contains('selbActive')) {
            haveActiveSelc = true;
        }
    }
    if (haveActiveSelc) {
        clearFilterBtns
            .forEach(btn => btn.classList.add('clear_filter_active'));
    } else {
        clearFilterBtns
            .forEach(btn => btn.classList.remove('clear_filter_active'));
    }
}

/*  Активация фильтров (применение фильтрации в таблице). Чтобы фильтрация работала, нужно:
        ============= ДЛЯ ЧЕКБОКСОВ, У КОТОРЫХ АТРИБУТ value="" СОДЕРЖИТ КОНТЕНТ ИЗ textContent ===========
        1) чтобы у элемента .checkboxes стоял атрибут data-filter-key="key", где вместо "key" указывается ключ, используемый в атрибутах ниже;
        2) у элементов input внутри чекбоксов-/радио-контейнеров должен стоять атрибут value, по которому и будет "связан" поиск для фильтрации. 
            Если в value указано значение "all", то это равносильно тому, что в селекте не было выбрано никаких значений;
        3) внутри таблицы у каждого элемента, участвующего в фильтрации, должен стоять атрибут data-filter-item="key", где "key" является тем же значением, что и в 1). Например, такой атрибут ставится для ячейки, где содержится имя, и "key" этой ячейки будет "name".

        =============== ДЛЯ СЕЛЕКТОВ И ЧЕКБОКСОВ, КОТОРЫЕ СВЯЗАНЫ С ПОМОЩЬЮ data-filter-value =============
        1) чтобы у элемента .checkboxes стоял атрибут data-filter-key="key", где вместо "key" указывается ключ, используемый в атрибутах ниже, а также data-filter-condition, обозначающий, что этот фильтр связывается не с контентом внутри ячейки, а с data-filter-condition-value;
        2) у элементов input внутри чекбоксов-/радио-контейнеров должен стоять атрибут value="", значением которого будет являться то же значение, что ставится в атрибут data-filter-condition-value (ниже);
            Если в value указано значение в формате "> x" или "< x", где x - число, это значит, что в атрибуте data-filter-condition-value искомой ячейки должно находиться число соответственно больше или меньше x. Работает аналогично с выражениями ">= x", "<= x";
        3) внутри таблицы, у ячейки в соответствующем элементе должен стоять атрибут data-filter-condition-value с соответствующим 1) значением value, а также атрибут data-filter-item.

        ПРИМЕР: выбор по статусу. Элементу .checkboxes задаются атрибуты: data-filter-key="worktype" data-filter-condition 
        input'у с вариантом "Безработный(ая)" задается атрибут: value="no-work", input'у с вариантом "Работает" задается атрибут value="works". 
        Соответствующей ячейке в таблице задаются атрибуты data-filter-condition-value="no-work/works" (зависит от выбора пользователя), data-filter-item="worktype". Соответственно, если пользователь поменяет выбор, атрибут data-filter-condition-value также ОБЯЗАТЕЛЬНО ДОЛЖНО БЫТЬ ИЗМЕНЕНО.
*/
function doFilter() {
    setTimeout(() => {
        let filters = Array.from(
            document.querySelector(".filters_wrapper").querySelectorAll(".multiselect")
        );
        let filtersActive = filters.filter(f => {
            let selectedInputs = Array.from(f.querySelectorAll("input:checked"));
            return selectedInputs.length > 0;
        });
        let tableItems = Array.from(document.querySelectorAll(".table_body"));
        let isAnyValueSelected = Boolean(
            filters.find(f => f.querySelector("input:checked"))
        );
        if (!isAnyValueSelected) {
            tableItems.forEach(tableItem => {
                tableItem.classList.remove("__removed");
                tableItem.classList.remove("__removed-byfilter");
            });
            return;
        }
        let noMatchItems = [];

        filtersActive.forEach(filter => {
            let selectedInputs = Array.from(filter.querySelectorAll("input:checked"));
            let dataParamsBlock = selectedInputs[0].closest(".checkboxes");
            let filterKey = dataParamsBlock.dataset.filterKey;
            let hasFilterCondition = dataParamsBlock.hasAttribute("data-filter-condition");
            let values = selectedInputs.map(inp => {
                return inp.value.trim().toLowerCase().replace(/\s\s/g, "");
            });
            let mathValues = values.filter(val => val.startsWith(">") || val.startsWith("<"));

            tableItems.forEach(tableItem => {
                if (noMatchItems.includes(tableItem)) return;

                let tableCells = Array.from(tableItem.querySelectorAll(`[data-filter-item="${filterKey}"]`));
                if (tableCells.length < 1) return;
                if (values.includes("all")) return;

                let match;
                if (hasFilterCondition) {
                    match = tableCells.find(tableCell => {
                        let tableCellValue = tableCell.dataset.filterConditionValue;
                        let matchesByMathValue = Boolean(
                            mathValues.find(mathVal => {
                                let num = parseInt(mathVal.replace(/\D/g, ""));
                                let inequalitySign = mathVal.replace(/\d/g, "");
                                let isNoEqual = !inequalitySign.includes("=");

                                if (inequalitySign.includes("<") && isNoEqual)
                                    return num > parseInt(tableCellValue);
                                if (inequalitySign.includes(">") && isNoEqual)
                                    return num < parseInt(tableCellValue);

                                if (inequalitySign.includes("<=")) return num >= parseInt(tableCellValue);
                                if (inequalitySign.includes(">=")) return num <= parseInt(tableCellValue);

                                return false;
                            })
                        );
                        let matches = values.includes(tableCellValue) || matchesByMathValue;

                        return matches;
                    });
                } else {
                    match = tableCells.find(tableCell => {
                        let tableCellContent = tableCell.textContent.trim().toLowerCase().replace(/\s\s/g, "");
                        let matches = Boolean(
                            values.find(val => tableCellContent.includes(val))
                        );

                        return matches;
                    });
                }
                if (!match) noMatchItems.push(tableItem);
            });
        });
        let matchItems = tableItems.filter(tableItem => !noMatchItems.includes(tableItem));
        
        noMatchItems.forEach(tableItem => {
            tableItem.classList.add("__removed");
            tableItem.classList.add("__removed-byfilter");
        });
        matchItems.forEach(tableItem => {
            tableItem.classList.remove("__removed");
            tableItem.classList.remove("__removed-byfilter");
        });

        tableSearch();
    }, 0);
}

// поиск по таблице
/* Для поиска по таблице нужно:
    1) определить searchkey (дальше будет указываться в атрибутах);
    2) чтобы присутствовал элемент <input type="hidden" name="table_allInfo_search" data-table-search-key="searchkey"> (если невидимый поиск)
    ИЛИ <input type="text" placeholder="Поиск" name="table_allInfo_search" data-table-search-key="name"> (если видимый поиск)
    3) ячейкам, внутри которых будет произведен поиск, задается атрибут data-table-search-item="searchkey"
    4) ссылкам, текст которых будет помещен в поиск при нажатии, задается data-table-search-hidden="searchkey", а также класс "table_info_filter_link"
*/
let tableSearchInputs = document.querySelectorAll("[name='table_allInfo_search']");
tableSearchInputs.forEach(inp => {
    inp.addEventListener("input", tableSearch);
});

function tableSearch() {
    let tableBodies = Array.from(document.querySelectorAll(".table_body:not(.__removed-byfilter)"));
    let tableBodiesMatch = tableBodies;

    tableSearchInputs.forEach(input => {
        let value = input.value.toLowerCase().trim().replace(/\s\s/g, "");
        let searchKey = input.dataset.tableSearchKey;
        if (!value) return;

        tableBodiesMatch = tableBodiesMatch.filter(tbd => {
            let blocks = Array.from(tbd.querySelectorAll(`[data-table-search-item="${searchKey}"]`));
            if (blocks.length < 1) return;

            let matches = false;
            blocks.forEach(block => {
                if (matches) return;

                let name = block.textContent.toLowerCase().trim().replace(/\s\s/g, "");
                if(value.includes("безработ")) {
                    matches = name.includes("безработ");
                    return;
                }
                matches = name.includes(value);
            });

            return matches;
        });
    });
    tableBodiesMatch.forEach(tbd => tbd.classList.remove("__removed"));
    tableBodies.forEach(tbd => {
        if (tableBodiesMatch.includes(tbd)) return;

        tbd.classList.add("__removed");
    });

    let clearButtons = document.querySelectorAll(".foundation-clear_filter");
    let activeSelects = document.querySelectorAll('.filters_wrapper .selbActive');
    let isActiveSelects = activeSelects.length > 0;
    if (tableBodiesMatch.length === tableBodies.length && !isActiveSelects) {
        clearButtons.forEach(clearBtn => {
            clearBtn.classList.remove("clear_filter_active");
        });
    } else {
        clearButtons.forEach(clearBtn => {
            clearBtn.classList.add("clear_filter_active");
        });
    }
}

clearBtn = document.querySelectorAll('.foundation-clear_filter');
for (let u = 0; u < clearBtn.length; u++) {
    clearBtn[u].onclick = function () {
        if (
            clearBtn[0].classList.contains('clear_filter_active')
        ) {
            let ourSelectCl = document.querySelectorAll('.filters_wrapper .selectBox');
            let ourCheckBoxCl = document.querySelectorAll('.filters_wrapper .multiselect input[type="checkbox"]');
            let ourLabelCl = document.querySelectorAll('.filters_wrapper .multiselect label');
            let ourInputsCl = document.querySelectorAll('.filters_wrapper .multiselect input');
            for (let i = 0; i < ourSelectCl.length; i++) {
                ourSelectCl[i].classList.remove('selbActive');
            }
            for (let i = 0; i < ourCheckBoxCl.length; i++) {
                ourCheckBoxCl[i].checked = false;
            }
            for (let i = 0; i < ourLabelCl.length; i++) {
                ourLabelCl[i].classList.remove('labelActive');
            }
            for (let i = 0; i < ourInputsCl.length; i++) {
                ourInputsCl[i].checked = false;
            }

            document.getElementById("optOld").textContent = optOldTxt;
            document.getElementById("optZnk").textContent = optZnkTxt;
            document.getElementById("optStat").textContent = optStatTxt;
            document.getElementById("optVac").textContent = optVacTxt;
            document.getElementById("optType").textContent = optTypeTxt;
            document.getElementById("optCity").textContent = optCityTxt;
            document.getElementById("optCom").textContent = optComTxt;
            document.getElementById("optRez").textContent = optRezTxt;
            document.querySelector("#optFavsBlacklist").textContent = optFavsBlacklistTxt;
            document.querySelector("#optEducation").textContent = optEducationTxt;

            clearBtn.forEach(btn => btn.classList.remove("clear_filter_active"));

            let searchInputs = document.querySelectorAll("[name='table_allInfo_search']");
            let inputEvent = new Event("input");
            searchInputs.forEach(inp => {
                inp.value = "";
                inp.dispatchEvent(inputEvent);
            });
        }

        doFilter();
        tableSearch();
    }
}


function closeSelects(idSelect) {
    let ourSelect = document.querySelector("#" + idSelect);
    closeSelect(ourSelect);
}
function closeSelect(select) {
    let ourCheckBoxes = document.querySelectorAll('.filters_wrapper .multiselect input[type="checkbox"]');
    let ourInputText = document.querySelectorAll('.filters_wrapper .multiselect input[type="text"]');
    for (let u = 0; u < ourCheckBoxes.length; u++) {
        let CheckBoxParent = ourCheckBoxes[u].parentElement.parentElement.parentElement;

        if (CheckBoxParent.parentElement.childNodes[1].classList.contains('selbActive')) {

        } else if (CheckBoxParent.childNodes[1].classList.contains('selbActive')) {

        } else {
            ourCheckBoxes[u].checked = false;
        }
    }
    for (let u = 0; u < ourInputText.length; u++) {
        ourInputText[u].value = ''
    }

    if (select.classList.contains('select_active')) {
        select.classList.remove('select_active')
    } else {
        allSelectList = document.querySelectorAll('.multiselect');
        for (let i = 0; i < allSelectList.length; i++) {
            allSelectList[i].classList.remove('select_active');
        }

        select.classList.add('select_active')
    }
}

// По вакансии
const selectVac = document.querySelector('#selectBoxVac');
selectVac.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectVac');
});

let labelVac = ''
optVacTxtOut = optVacTxt + ' (выбрано: ';
const btnVac = document.querySelector('#selectBtnVac');
btnVac.addEventListener('click', () => {
    let searchVacInput = document.querySelector("#searchVac");
    searchVacInput.value = "";
    searchVacInput.dispatchEvent(new Event("input"));
    let valueTextBlock = document.getElementById("optVac")
        .closest(".selectBox_wrapper")
        .querySelector(".selectBox_value-text");
    let VacCheckCount = 0;
    var labelsVac = document.getElementsByClassName('labelCheckVac');
    for (var i = 0; i < labelsVac.length; i++) {
        if (labelsVac[i].checked) {
            CheckWordVac = labelsVac[i].checked;
            labelVac = document.querySelector(`[for="${labelsVac[i].id}"]`);
            labelVac = labelVac.querySelector(".checkbox_text");
            labelVac = labelVac.textContent;
            VacCheckCount += 1;
        }
    }

    if (VacCheckCount > 1) {
        valueTextBlock.innerHTML = `
            <span class="selectBox_selected-name">${optVacTxt}</span>
            <span class="selectBox_selected-amount">Выбрано: ${VacCheckCount}</span>
        `;
        document.querySelector('#selectBoxVac').classList.add('selbActive');
    } else if (VacCheckCount == 1) {
        document.querySelector('#selectBoxVac').classList.add('selbActive');
        valueTextBlock.textContent = labelVac;
    } else {
        valueTextBlock.textContent = optVacTxt;
        document.querySelector('#selectBoxVac').classList.remove('selbActive');
    }
    document.querySelector('#selectVac').classList.remove('select_active');
    onFilterSelectsChange();
});

document.querySelector('#selVacExit').addEventListener('click', () => {
    var labelsVac = document.getElementsByClassName('labelCheckVac');
    for (var i = 0; i < labelsVac.length; i++) {
        if (labelsVac[i].checked) {
            labelsVac[i].checked = false;
        }
    }
    document.getElementById("optVac").textContent = optVacTxt;

    document.querySelector('#selectBoxVac').classList.remove('selbActive');
    onFilterSelectsChange();
});


// По городам и регионам
const selectCity = document.querySelector('#selectBoxCity');
selectCity.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectCity');
});

let labelCity = ''
optCityTxtOut = optCityTxt + ' (выбрано: ';
const btnCity = document.querySelector('#selectBtnCity');
btnCity.addEventListener('click', () => {
    let citySearchInput = document.querySelector("#multiselect__search");
    citySearchInput.value = "";
    citySearchInput.dispatchEvent(new Event("input"));
    let valueTextBlock = document.getElementById("optCity")
        .closest(".selectBox_wrapper")
        .querySelector(".selectBox_value-text");
    let CityCheckCount = 0;
    var labelsCity = document.getElementsByClassName('labelCheckCity');
    for (var i = 0; i < labelsCity.length; i++) {
        if (labelsCity[i].checked) {
            CheckWordCity = labelsCity[i].checked;
            labelCity = document.querySelector(`[for="${labelsCity[i].id}"]`);
            labelCity = labelCity.querySelector(".checkbox_text");
            labelCity = labelCity.textContent
            CityCheckCount += 1;
        }
    }
    if (CityCheckCount > 1) {
        valueTextBlock.innerHTML = `
            <span class="selectBox_selected-name">${optCityTxt}</span>
            <span class="selectBox_selected-amount">Выбрано: ${CityCheckCount}</span>
        `;
        document.querySelector('#selectBoxCity').classList.add('selbActive');

        selectCity.removeAttribute("data-title");
    } else if (CityCheckCount == 1) {
        document.querySelector('#selectBoxCity').classList.add('selbActive');
        valueTextBlock.textContent = labelCity;

        if (labelCity.length > 17) selectCity.dataset.title = labelCity;
        else selectCity.removeAttribute("data-title");
    } else {
        valueTextBlock.textContent = optCityTxt;
        document.querySelector('#selectBoxCity').classList.remove('selbActive');
    }
    document.querySelector('#selectCity').classList.remove('select_active');
    onFilterSelectsChange();
});

document.querySelector('#selCityExit').addEventListener('click', () => {
    var labelsCity = document.getElementsByClassName('labelCheckCity');
    for (var i = 0; i < labelsCity.length; i++) {
        if (labelsCity[i].checked) {
            labelsCity[i].checked = false;
        }
    }
    document.getElementById("optCity").textContent = optCityTxt;

    document.querySelector('#selectBoxCity').classList.remove('selbActive');
    onFilterSelectsChange();

    selectCity.removeAttribute("data-title");
});


document.querySelector('.cityAll').addEventListener('click', () => {
    document.querySelector('#checkboxesCity').classList.toggle('city_active');
    document.querySelector('.cityAll > span:nth-child(1)').classList.toggle('city_minus');
    if (document.querySelector('.cityAll > span:nth-child(1)').innerHTML == '+') {
        document.querySelector('.cityAll > span:nth-child(1)').innerHTML = '-';
    } else if (document.querySelector('.cityAll > span:nth-child(1)').innerHTML == '-') {
        document.querySelector('.cityAll > span:nth-child(1)').innerHTML = '+';
    }
});



// По статусу
const selectStat = document.querySelector('#selectBoxStat');
selectStat.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectStat');
});
var labelsStats = document.getElementsByClassName('labelCheckStat');
for (var i = 0; i < labelsStats.length; i++) {
    labelsStats[i].onclick = function () {
        for (var u = 0; u < labelsStats.length; u++) {
            labelsStats[u].classList.remove('labelActive');
        }
        document.getElementById("optStat").textContent = this.textContent;
        this.classList.add('labelActive');
        document.querySelector('#selectBoxStat').classList.add('selbActive');
        document.querySelector('#selectStat').classList.remove('select_active');
        onFilterSelectsChange();
    }
}
document.querySelector('#selStatExit').addEventListener('click', () => {
    document.getElementById("optStat").textContent = optStatTxt;
    for (var u = 0; u < labelsStats.length; u++) {
        labelsStats[u].classList.remove('labelActive');
        labelsStats[u].querySelector("input").checked = false;
    }
    document.querySelector('#selectBoxStat').classList.remove('selbActive');
    onFilterSelectsChange();
});


// По типу добавления
const selectType = document.querySelector('#selectBoxType');
selectType.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectType');
});

let labelType = ''
optOldTxtOut = optOldTxt + ' (выбрано: ';
const btnType = document.querySelector('#selectBtnType');
btnType.addEventListener('click', () => {
    let valueTextBlock = document.getElementById("optType")
        .closest(".selectBox_wrapper")
        .querySelector(".selectBox_value-text");
    let TypeCheckCount = 0;
    var labelsType = document.getElementsByClassName('labelCheckType');
    for (var i = 0; i < labelsType.length; i++) {
        if (labelsType[i].checked) {
            CheckWordType = labelsType[i].checked;
            labelType = document.querySelector(`[for="${labelsType[i].id}"]`);
            labelType = labelType.querySelector(".checkbox_text");
            labelType = labelType.textContent
            TypeCheckCount += 1;
        }
    }
    if (TypeCheckCount > 1) {
        valueTextBlock.innerHTML = `
            <span class="selectBox_selected-name">${optTypeTxt}</span>
            <span class="selectBox_selected-amount">Выбрано: ${TypeCheckCount}</span>
        `;
        document.querySelector('#selectBoxType').classList.add('selbActive');

        selectType.removeAttribute("data-title");
    } else if (TypeCheckCount == 1) {
        document.querySelector('#selectBoxType').classList.add('selbActive');
        valueTextBlock.textContent = labelType;

        if (labelType.length > 17) selectType.dataset.title = labelType;
        else selectType.removeAttribute("data-title");
    } else {
        valueTextBlock.textContent = optTypeTxt;
        document.querySelector('#selectBoxType').classList.remove('selbActive');
    }

    document.querySelector('#selectType').classList.remove('select_active');
    onFilterSelectsChange();
});

document.querySelector('#selTypeExit').addEventListener('click', () => {
    var labelsType = document.getElementsByClassName('labelCheckType');
    for (var i = 0; i < labelsType.length; i++) {
        if (labelsType[i].checked) {
            labelsType[i].checked = false;
        }
    }

    document.getElementById("optType").textContent = optTypeTxt;

    document.querySelector('#selectBoxType').classList.remove('selbActive');
    onFilterSelectsChange();

    selectType.removeAttribute("data-title");
});


// По комментариям
const selectCom = document.querySelector('#selectBoxCom');
selectCom.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectCom');
});
var labelsComs = document.getElementsByClassName('labelCheckCom');
for (var i = 0; i < labelsComs.length; i++) {
    labelsComs[i].onclick = function () {
        for (var u = 0; u < labelsComs.length; u++) {
            labelsComs[u].classList.remove('labelActive');
        }
        document.getElementById("optCom").textContent = this.textContent;
        this.classList.add('labelActive');
        document.querySelector('#selectBoxCom').classList.add('selbActive');
        document.querySelector('#selectCom').classList.remove('select_active');
        onFilterSelectsChange();
    }
}
document.querySelector('#selComExit').addEventListener('click', () => {
    document.getElementById("optCom").textContent = optComTxt;
    for (var u = 0; u < labelsComs.length; u++) {
        labelsComs[u].classList.remove('labelActive');
        labelsComs[u].querySelector("input").checked = false;
    }
    document.querySelector('#selectBoxCom').classList.remove('selbActive');

    onFilterSelectsChange();
});


// По работе с резюме
const selectRez = document.querySelector('#selectBoxRez');
selectRez.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectRez');
});

let labelRez = ''
optRezTxtOut = optRezTxt + ' (выбрано: ';
const btnRez = document.querySelector('#selectBtnRez');
btnRez.addEventListener('click', () => {
    let valueTextBlock = document.getElementById("optRez")
        .closest(".selectBox_wrapper")
        .querySelector(".selectBox_value-text");
    let RezCheckCount = 0;
    var labelsRez = document.getElementsByClassName('labelCheckRez');
    for (var i = 0; i < labelsRez.length; i++) {
        if (labelsRez[i].checked) {
            CheckWordRez = labelsRez[i].checked;
            labelRez = document.querySelector(`[for="${labelsRez[i].id}"]`);
            labelRez = labelRez.querySelector(".checkbox_text");
            labelRez = labelRez.textContent
            RezCheckCount += 1;
        }
    }
    if (RezCheckCount > 1) {
        valueTextBlock.innerHTML = `
            <span class="selectBox_selected-name">${optRezTxt}</span>
            <span class="selectBox_selected-amount">Выбрано: ${RezCheckCount}</span>
        `;
        document.querySelector('#selectBoxRez').classList.add('selbActive');

        selectRez.removeAttribute("data-title");
    } else if (RezCheckCount == 1) {
        document.querySelector('#selectBoxRez').classList.add('selbActive');
        document.getElementById("optRez").textContent = labelRez;

        if (labelRez.length > 17) selectRez.dataset.title = labelRez;
        else selectRez.removeAttribute("data-title");
    } else {
        document.getElementById("optRez").textContent = optRezTxt;
        document.querySelector('#selectBoxRez').classList.remove('selbActive');
    }
    document.querySelector('#selectRez').classList.remove('select_active');
    onFilterSelectsChange();
});

document.querySelector('#selRezExit').addEventListener('click', () => {
    var labelsRez = document.getElementsByClassName('labelCheckRez');
    for (var i = 0; i < labelsRez.length; i++) {
        if (labelsRez[i].checked) {
            labelsRez[i].checked = false;
        }
    }
    document.getElementById("optRez").textContent = optRezTxt;

    document.querySelector('#selectBoxRez').classList.remove('selbActive');
    onFilterSelectsChange();

    selectRez.removeAttribute("data-title");
});



document.querySelector('#multiselect__search').addEventListener('click', () => {
    document.querySelector('#selectCity').classList.add('select_active');
});



// Знак зодиака
const selectZnk = document.querySelector('#selectBoxZnk');
selectZnk.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectZnk');
});

let labelZnk = ''
optZnkTxtOut = optZnkTxt + ' (выбрано: ';
const btnZnk = document.querySelector('#selectBtnZnk');
btnZnk.addEventListener('click', () => {
    let valueTextBlock = document.getElementById("optZnk")
        .closest(".selectBox_wrapper")
        .querySelector(".selectBox_value-text");
    let ZnkCheckCount = 0;
    var labelsZnk = document.getElementsByClassName('labelCheckZnk');
    for (var i = 0; i < labelsZnk.length; i++) {
        if (labelsZnk[i].checked) {
            CheckWordZnk = labelsZnk[i].checked;
            labelZnk = document.querySelector(`[for="${labelsZnk[i].id}"]`);
            labelZnk = labelZnk.querySelector(".checkbox_text");
            labelZnk = labelZnk.textContent
            ZnkCheckCount += 1;
        }
    }
    if (ZnkCheckCount > 1) {
        valueTextBlock.innerHTML = `
            <span class="selectBox_selected-name">${optZnkTxt}</span>
            <span class="selectBox_selected-amount">Выбрано: ${ZnkCheckCount}</span>
        `;
        document.querySelector('#selectBoxZnk').classList.add('selbActive');

        selectZnk.removeAttribute("data-title");
    } else if (ZnkCheckCount == 1) {
        document.querySelector('#selectBoxZnk').classList.add('selbActive');
        valueTextBlock.textContent = labelZnk;

        if (labelZnk.length > 17) selectZnk.dataset.title = labelZnk;
        else selectZnk.removeAttribute("data-title");
    } else {
        valueTextBlock.textContent = optZnkTxt;
        document.querySelector('#selectBoxZnk').classList.remove('selbActive');
    }
    document.querySelector('#selectZnk').classList.remove('select_active');
    onFilterSelectsChange();

    selectZnk.removeAttribute("data-title");
});

document.querySelector('#selZnkExit').addEventListener('click', () => {
    var labelsZnk = document.getElementsByClassName('labelCheckZnk');
    for (var i = 0; i < labelsZnk.length; i++) {
        if (labelsZnk[i].checked) {
            labelsZnk[i].checked = false;
        }
    }
    document.getElementById("optZnk").textContent = optZnkTxt;

    document.querySelector('#selectBoxZnk').classList.remove('selbActive');
    onFilterSelectsChange();
});

// По возрасту
const selectOld = document.querySelector('#selectBoxOld');
selectOld.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectOld');
});

let labelOld = ''
optOldTxtOut = optOldTxt + ' (выбрано: ';
const btnOld = document.querySelector('#selectBtnOld');
btnOld.addEventListener('click', () => {
    let valueTextBlock = document.getElementById("optOld")
        .closest(".selectBox_wrapper")
        .querySelector(".selectBox_value-text");
    let OldCheckCount = 0;
    var labelsOld = document.getElementsByClassName('labelCheckOld');
    for (var i = 0; i < labelsOld.length; i++) {
        if (labelsOld[i].checked) {
            CheckWordOld = labelsOld[i].checked;
            labelOld = document.querySelector(`[for="${labelsOld[i].id}"]`);
            labelOld = labelOld.querySelector(".checkbox_text");
            labelOld = labelOld.textContent
            OldCheckCount += 1;
        }
    }
    if (OldCheckCount > 1) {
        valueTextBlock.innerHTML = `
            <span class="selectBox_selected-name">${optOldTxt}</span>
            <span class="selectBox_selected-amount">Выбрано: ${OldCheckCount}</span>
        `;
        document.querySelector('#selectBoxOld').classList.add('selbActive');

        selectOld.removeAttribute("data-title");
    } else if (OldCheckCount == 1) {
        document.querySelector('#selectBoxOld').classList.add('selbActive');
        valueTextBlock.textContent = labelOld;

        if (labelOld.length > 17) selectOld.dataset.title = labelOld;
        else selectOld.removeAttribute("data-title");
    } else {
        valueTextBlock.textContent = optOldTxt;
        document.querySelector('#selectBoxOld').classList.remove('selbActive');
    }

    document.querySelector('#selectOld').classList.remove('select_active');
    onFilterSelectsChange();
});

document.querySelector('#selOldExit').addEventListener('click', () => {
    var labelsOld = document.getElementsByClassName('labelCheckOld');
    for (var i = 0; i < labelsOld.length; i++) {
        if (labelsOld[i].checked) {
            labelsOld[i].checked = false;
        }
    }

    document.getElementById("optOld").textContent = optOldTxt;

    document.querySelector('#selectBoxOld').classList.remove('selbActive');
    onFilterSelectsChange();

    selectOld.removeAttribute("data-title");
});

// По образованию
const selectEducation = document.querySelector('#selectBoxEducation');
selectEducation.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectEducation');
});

let labelEducation = ''
optEducationTxtOut = optEducationTxt + ' (выбрано: ';
const btnEducation = document.querySelector('#selectBtnEducation');

btnEducation.addEventListener('click', () => {
    let valueTextBlock = document.getElementById("optEducation")
        .closest(".selectBox_wrapper")
        .querySelector(".selectBox_value-text");
    let educationCheckCount = 0;
    var labelsEducation = document.getElementsByClassName('labelCheckEducation');
    for (var i = 0; i < labelsEducation.length; i++) {
        if (labelsEducation[i].checked) {
            CheckWordRez = labelsEducation[i].checked;
            labelEducation = document.querySelector(`[for="${labelsEducation[i].id}"]`);
            labelEducation = labelEducation.querySelector(".checkbox_text");
            labelEducation = labelEducation.textContent
            educationCheckCount += 1;
        }
    }
    if (educationCheckCount > 1) {
        valueTextBlock.innerHTML = `
            <span class="selectBox_selected-name">${optEducationTxt}</span>
            <span class="selectBox_selected-amount">Выбрано: ${educationCheckCount}</span>
        `;
        document.querySelector('#selectBoxEducation').classList.add('selbActive');

        selectEducation.removeAttribute("data-title");
    } else if (educationCheckCount == 1) {
        document.querySelector('#selectBoxEducation').classList.add('selbActive');
        valueTextBlock.textContent = labelEducation;

        if (labelEducation.length > 17) selectEducation.dataset.title = labelEducation;
        else selectEducation.removeAttribute("data-title");
    } else {
        valueTextBlock.textContent = optEducationTxt;
        document.querySelector('#selectBoxEducation').classList.remove('selbActive');
    }
    document.querySelector('#selectEducation').classList.remove('select_active');
    onFilterSelectsChange();

    selectEducation.removeAttribute("data-title");
});

document.querySelector('#selEducationExit').addEventListener('click', () => {
    var labelsEducation = document.getElementsByClassName('labelCheckEducation');
    for (var i = 0; i < labelsEducation.length; i++) {
        if (labelsEducation[i].checked) {
            labelsEducation[i].checked = false;
        }
    }
    document.getElementById("optEducation").textContent = optEducationTxt;

    document.querySelector('#selectBoxEducation').classList.remove('selbActive');
    onFilterSelectsChange();
});


// В избранном/В черном списке (Избранное/Игнорируемые)
const selectBoxFavsBlacklist = document.querySelector('#selectBoxFavsBlacklist');
selectBoxFavsBlacklist.addEventListener('click', (event) => {
    let targ = event.target;
    if (!targ.classList.contains("selctexit_btn") && !targ.closest(".selctexit_btn"))
        closeSelects('selectFavsBlacklist');
});
var labelsFavsBlacklists = document.getElementsByClassName('labelFavsBlacklist');
for (var i = 0; i < labelsFavsBlacklists.length; i++) {
    let label = labelsFavsBlacklists[i];
    label.onclick = function () {
        for (var u = 0; u < labelsFavsBlacklists.length; u++) {
            labelsFavsBlacklists[u].classList.remove('labelActive');
        }
        document.getElementById("optFavsBlacklist").textContent = this.textContent;
        this.classList.add('labelActive');
        document.querySelector('#selectBoxFavsBlacklist').classList.add('selbActive');
        document.querySelector('#selectFavsBlacklist').classList.remove('select_active');

        onFilterSelectsChange();
    }
}
document.querySelector('#selFavsBlacklistExit').addEventListener('click', () => {
    document.getElementById("optFavsBlacklist").textContent = optFavsBlacklistTxt;
    for (var u = 0; u < labelsFavsBlacklists.length; u++) {
        labelsFavsBlacklists[u].classList.remove('labelActive');
        labelsFavsBlacklists[u].querySelector("input").checked = false;
    }
    document.querySelector('#selectBoxFavsBlacklist').classList.remove('selbActive');
    onFilterSelectsChange();
});

// поиск в селекте
let selectSearchInputs = document.querySelectorAll("[data-select-search]");
selectSearchInputs.forEach(inp => {
    inp.addEventListener("input", selectSearch);
});

function selectSearch(event) {
    let input = event.target;
    let value = input.value.toLowerCase().trim();
    let searchItems = input.closest(".multiselect").querySelectorAll(".select_search_item");
    searchItems.forEach(searchItem => {
        let itemText = searchItem.textContent.toLowerCase().trim();

        if (value) {
            if (itemText.includes(value)) searchItem.classList.remove("__removed");
            else searchItem.classList.add("__removed");

        } else searchItem.classList.remove("__removed");
    });
}

function removeSelBoxHint(event) {
    let targ = event.target;
    let hintBlock = targ.querySelector(".selectBox_hint");
    if (hintBlock) hintBlock.remove();
}

// нажатие на ссылку, активирующую поиск (например, в колонке "Возраст/Год рождения")
let tableFilterLinks = document.querySelectorAll(".table_info_filter_link");
tableFilterLinks.forEach(link => {
    link.addEventListener("click", tableInfoFilterLink);
});

function tableInfoFilterLink(event) {
    let link = event.target;
    let value = link.textContent.trim();
    let inputKey = link.dataset.tableSearchHidden;
    if (!inputKey) return;

    let input = document.querySelector(`[data-table-search-key="${inputKey}"]`);
    if (!input) return;
    let otherHiddenInputs = Array.from(document.querySelectorAll("[type='hidden']"))
        .filter(inp => inp.dataset.tableSearchKey)
        .filter(inp => inp.dataset.tableSearchKey !== inputKey);
    otherHiddenInputs.forEach(hiddenInput => hiddenInput.value = "");

    input.value = value;
    input.dispatchEvent(new Event("input"));
}

// Селекты в таблице (статусы резюме)
let rezumeStatusSelects = document.querySelectorAll(".multiselect.rezume-status");

rezumeStatusSelects.forEach(rezumeStatusSelect => {
    let selectBox = rezumeStatusSelect.querySelector(".selectBox");
    let optRezumeStatus = rezumeStatusSelect.querySelector(".optRezumeStatus");

    selectBox.addEventListener("click", function (event) {
        let targ = event.target;
        if (targ.classList.contains("selctexit_btn") || targ.closest(".selctexit_btn"))
            return;

        if (!event.target.classList.contains("selectBtnRezumeStatus"))
            closeSelect(rezumeStatusSelect);
    });

    let label = '';
    const btn = rezumeStatusSelect.querySelector('.selectBtnRezumeStatus');
    btn.addEventListener('click', () => {
        let valueTextBlock = document.querySelector(".optRezumeStatus")
            .closest(".selectBox_wrapper")
            .querySelector(".selectBox_value-text");
        let checkCount = 0;
        var labelsList = rezumeStatusSelect.getElementsByClassName('labelCheckRezumeStatus');
        for (var i = 0; i < labelsList.length; i++) {
            if (labelsList[i].checked) {
                CheckWordRezumeStatus = labelsList[i].checked;
                label = rezumeStatusSelect.querySelector(`[for="${labelsList[i].id}"]`);
                label = label.querySelector(".checkbox_text");
                label = label.textContent.trim();
                checkCount += 1;
            }
        }
        if (checkCount > 1) {
            valueTextBlock.innerHTML = `
                <span class="selectBox_selected-name">${optRezumeStatusumeStatusTxt}</span>
                <span class="selectBox_selected-amount">Выбрано: ${checkCount}</span>
            `;
            rezumeStatusSelect.querySelector('.selectBoxRezumeStatus').classList.add('selbActive');
        } else if (checkCount == 1) {
            rezumeStatusSelect.querySelector('.selectBoxRezumeStatus').classList.add('selbActive');
            rezumeStatusSelect.querySelector(".optRezumeStatus").textContent = label;

            if (label.length > 17) selectBox.dataset.title = label;
            else selectBox.removeAttribute("data-title");

            let inputValue = rezumeStatusSelect.querySelector("input:checked").value;
            optRezumeStatus.dataset.filterConditionValue = inputValue;
        } else {
            rezumeStatusSelect.querySelector(".optRezumeStatus").textContent = optRezumeStatusumeStatusTxt;
            rezumeStatusSelect.querySelector('.selectBoxRezumeStatus').classList.remove('selbActive');
            selectBox.removeAttribute("data-title");
            optRezumeStatus.dataset.filterConditionValue = "";
        }
        rezumeStatusSelect.classList.remove('select_active');
        onFilterSelectsChange();
    });

    rezumeStatusSelect.querySelector('.selRezumeStatusExit').addEventListener('click', () => {
        var labelsList = document.getElementsByClassName('labelCheckRezumeStatus');
        for (var i = 0; i < labelsList.length; i++) {
            if (labelsList[i].checked) {
                labelsList[i].checked = false;
            }
        }
        rezumeStatusSelect.querySelector(".optRezumeStatus").textContent = optRezumeStatusumeStatusTxt;

        rezumeStatusSelect.querySelector('.selectBoxRezumeStatus').classList.remove('selbActive');
        onFilterSelectsChange();

        selectBox.removeAttribute("data-title");
    });
});

