PopExits = document.querySelectorAll('.popup_exit');
for (let i = 0; i < PopExits.length; i++) {
    PopExits[i].onclick = closeCommPopup;
}

document.getElementById('popup_work_exit').addEventListener('click', () => {
    document.querySelector('#work_popup_wrapper').classList.remove('popup_active');
    document.body.classList.remove("body--locked-scroll");
});

let btnsObserver = new MutationObserver(() => initPopupButtons());
btnsObserver.observe(document.body, { childList: true });

function setCommWrappersIndexes() {
    let tables = document.querySelectorAll(".table .table_body");
    tables.forEach(table => {
        let comms = table.querySelectorAll(".comm_block_wrap");
        comms.forEach((comm, index) => comm.dataset.commIndex = index);
    });
}
setCommWrappersIndexes();

WorkStatList = document.querySelectorAll('.table_allInfo > div:first-child span:first-child > svg');
for (var i = 0; i < WorkStatList.length; i++) {
    WorkStatList[i].onclick = function () {
        document.querySelector('#work_popup_wrapper').classList.add('popup_active');
        document.body.classList.add("body--locked-scroll");
    }
}

function genderHandler(gender) {
    let noWorkTextBlock =
        document.querySelector('.comm_popup-textarea_name .form_radio:first-child .form_radio_value');
    let workTextBlock =
        document.querySelector('.comm_popup-textarea_name .form_radio:last-child .form_radio_value');

    if (gender == 'female') {
        noWorkTextBlock.textContent = 'Безработная';
        workTextBlock.textContent = 'Работаю, но активно ищу работу';
    } else {
        noWorkTextBlock.textContent = 'Безработный';
        workTextBlock.textContent = 'Работаю, но активно ищу работу';
    }
}

let commPopupWrapper = document.querySelector("#comm_popup_wrapper");
commPopupWrapper.addEventListener("popup-close", () => {
    if (!commPopupWrapper.classList.contains("popup_active")) {
        let textarea = commPopupWrapper.querySelector("textarea");
        textarea.value = "";
    }
});

function closeCommPopup() {
    commPopupWrapper.classList.remove('popup_active');
    document.body.classList.remove("body--locked-scroll");
    commPopupWrapper.classList.remove('ch_comm');
    commPopupWrapper.classList.remove('add_comm');
    commPopupWrapper.dispatchEvent(new CustomEvent("popup-close"));
    setTimeout(() => {
        commPopupWrapper.removeAttribute("data-table-index");
        commPopupWrapper.removeAttribute("data-edit-comm-index");
    }, 100);
}

let favorites = Array.from(document.querySelectorAll('.favorite'));
let darklists = Array.from(document.querySelectorAll('.darklist'));
let popup_continue = Array.from(document.querySelectorAll('.popup_continue'));
let popup_canc = Array.from(document.querySelectorAll('.comm_popup-textarea_btns > button:nth-child(1)')); // не используется
let popup_edit = Array.from(document.querySelectorAll('.popup_edit'));

function initPopupButtons(onPageload = false) {
    let new_favorites = Array.from(document.querySelectorAll(".favorite"))
        .filter(fav => !favorites.includes(fav));
    let new_darklists = Array.from(document.querySelectorAll(".darklist"))
        .filter(darkl => !darklists.includes(darkl));

    new_favorites.forEach(el => el.addEventListener("click", onFavoritesClick));
    new_darklists.forEach(el => el.addEventListener("click", onDarklistClick));

    if (onPageload) {
        favorites.forEach(el => el.addEventListener("click", onFavoritesClick));
        darklists.forEach(el => el.addEventListener("click", onDarklistClick));
    }
}

initPopupButtons(true);

function onFavoritesClick() {
    let closestBlacklist = this.closest(".fav-blacklist_container").querySelector(".darklist");

    if (this.querySelector('a').innerText == 'Добавить в избранное' & closestBlacklist.innerText == 'Добавить в черный список') {
        this.parentElement.parentElement.childNodes[5].classList.add('infavouritelist');
        this.querySelector('a').innerText = 'Убрать из избранного';
        this.dataset.filterConditionValue = "infavoriteslist";
    } else if (this.querySelector('a').innerText == 'Добавить в избранное' & closestBlacklist.innerText == 'Убрать из черного списка') {
        this.querySelector('a').innerText = 'Убрать из избранного';
        this.parentElement.parentElement.childNodes[5].classList.add('infavouritelist');
        closestBlacklist.querySelector('a').innerText = 'Добавить в черный список';
        this.parentElement.parentElement.childNodes[3].classList.remove('indarklist');
        closestBlacklist.removeAttribute("data-filter-condition-value");
        this.dataset.filterConditionValue = "infavoriteslist";
    } else if (this.querySelector('a').innerText == 'Убрать из избранного') {
        this.querySelector('a').innerText = 'Добавить в избранное';
        this.parentElement.parentElement.childNodes[5].classList.remove('infavouritelist')
        this.removeAttribute("data-filter-condition-value");
    }

    doFilter();
}
function onDarklistClick() {
    let closestFavorite = this.closest(".fav-blacklist_container").querySelector(".favorite");

    if (
        this.querySelector('a').innerText == 'Добавить в черный список'
        & closestFavorite.innerText == 'Добавить в избранное'
    ) {
        this.querySelector('a').innerText = 'Убрать из черного списка';
        this.parentElement.parentElement.childNodes[3].classList.add('indarklist');
        this.dataset.filterConditionValue = "indarklist";
    } else if (
        this.querySelector('a').innerText == 'Добавить в черный список'
        & closestFavorite.innerText == 'Убрать из избранного'
    ) {
        this.querySelector('a').innerText = 'Убрать из черного списка';
        closestFavorite.querySelector('a').innerText = 'Добавить в избранное';
        this.parentElement.parentElement.childNodes[3].classList.add('indarklist');
        this.parentElement.parentElement.childNodes[5].classList.remove('infavouritelist');
        closestFavorite.removeAttribute("data-filter-condition-value");
        this.dataset.filterConditionValue = "indarklist";
    } else if (this.querySelector('a').innerText == 'Убрать из черного списка') {
        this.querySelector('a').innerText = 'Добавить в черный список';
        this.parentElement.parentElement.childNodes[3].classList.remove('indarklist');
        this.removeAttribute("data-filter-condition-value");
    }

    doFilter();
}

// удаляет комментарий
function removeComm(comm) {
    let table = comm.closest(".table_body");
    let commIndex = parseInt(comm.dataset.commIndex);
    let commTableIndex = Array.from(document.querySelectorAll(".table .table_body"))
        .findIndex(tBody => tBody === comm.closest(".table_body"));
    commTableIndex = parseInt(commTableIndex);

    let popupTableIndex = parseInt(commPopupWrapper.dataset.tableIndex);
    let nextCommsTable = Array.from(comm.parentNode.querySelectorAll(".comm_block_wrap"))
        .filter(commBlockWrap => {
            let isNext = parseInt(commBlockWrap.dataset.commIndex) > commIndex;
            return isNext;
        });
    let nextCommsPopup = Array.from(commPopupWrapper.querySelectorAll(".comm_popup_foundation-block"))
        .filter(commBlock => {
            let isNext = parseInt(commBlock.dataset.popupCommIndex) > commIndex;
            return isNext;
        });

    // удалить комментарий из блока и из попапа, если он там есть и если открыт попап именно текущего комментария
    let otherComms = comm.parentNode.querySelectorAll(".comm_block_wrapp");
    if (otherComms.length < 2) {
        let commentPresenceBlocks = table.querySelectorAll(`[data-filter-item="comment-presence"]`);
        commentPresenceBlocks.forEach(block => block.dataset.filterConditionValue = "has-no-comment");
    }
    comm.remove();
    if (popupTableIndex === commTableIndex) {
        let popupComm = commPopupWrapper.querySelector(`[data-popup-comm-index="${commIndex}"]`);
        if (popupComm) popupComm.remove();
    }

    // сместить индексы следующих за удаляемым комментариев на -1: как для комментариев в таблице, так и для комментариев в popup'е
    let popupEdit = document.querySelector(".comm_popup_wrapper[data-edit-comm-index]");
    let popupEditCommIndex = popupEdit ? parseInt(popupEdit.dataset.editCommIndex) : null;

    nextCommsTable.forEach(nextComm => {
        let index = parseInt(nextComm.dataset.commIndex);
        nextComm.dataset.commIndex = index - 1;
        if (index == popupEditCommIndex) {
            popupEdit.dataset.editCommIndex = popupEditCommIndex - 1;
        }
    });
    nextCommsPopup.forEach(nextComm => {
        let index = parseInt(nextComm.dataset.popupCommIndex);
        nextComm.dataset.popupCommIndex = index - 1;
    });

    onFilterSelectsChange();
}

let newCommSaveBtn = commPopupWrapper.querySelector(".popup_save_new-comm");
newCommSaveBtn.addEventListener("click", function () {
    let textarea = commPopupWrapper.querySelector("textarea");
    let comm = textarea.value;
    let tableIndex = commPopupWrapper.dataset.tableIndex;
    let tableBody = document.querySelectorAll(".table .table_body")[tableIndex];
    let commIndex = commPopupWrapper.dataset.editCommIndex;

    let commBlockWrap = tableBody.querySelectorAll(".comm_block_wrap")[commIndex];
    let commTextBlock = commBlockWrap.querySelector(".comm_block_text");
    let questionBlock = commBlockWrap.querySelector(".popup_question-content");
    commTextBlock.textContent = comm;
    questionBlock.textContent = comm;

    closeCommPopup();
});

let popupCommCancel = commPopupWrapper.querySelector(".popup_comm_cancel");
popupCommCancel.addEventListener("click", closeCommPopup);


function ppEx(item) {
    let ContBtn = document.querySelectorAll('.popup_continue');
    let ertr = item;
    for (let p = 0; p < ContBtn.length; p++) {
        ContBtn[p].onclick = function (event) {
            PopupStatusHandler(ertr);
            let tableItems = Array.from(
                document.querySelector(".table").querySelectorAll(".table_body")
            );
            let tableIndex = parseInt(event.target.closest("[data-table-index]").dataset.tableIndex);
            let table = tableItems[tableIndex];

            // добавить комментарий в таблицу
            let textarea = event.target.closest(".comm_popup_wrapper").querySelector("textarea");
            let commentContent = textarea.value;
            textarea.value = "";
            closeCommPopup();

            // создать блок (со временем, датой, контентом)
            let date = new Date();
            let day = date.getDate().toString();
            let month = (date.getMonth() + 1).toString();
            let hours = date.getHours().toString();
            let minutes = date.getMinutes().toString();
            let commBlockInner = `
                <span class="comm_block_text_date">
                    ${day.length < 2 ? "0" + day : day}.${month.length < 2 ? "0" + month : month}.${date.getFullYear() + " "}
                    ${hours.length < 2 ? "0" + hours : hours}:${minutes.length < 2 ? "0" + minutes : minutes}
                </span>
                <p class="comm_block_text_wrap">
                    <span class="comm_block_text">
                        ${commentContent}
                    </span>
                </p>
                <div class="popup_edit_wrapper">
                    <div class="popup_edit">
                        <svg style="fill: #0088d2;">
                            <use xlink:href="#pencil"></use>
                        </svg>
                    </div>
                    <div class="popup_question">
                        <svg>
                            <use xlink:href="#question"></use>
                        </svg>
                        <div class="popup_question-content">
                            ${commentContent}
                        </div>
                    </div>
                    <div class="comm_block_remove">
                        <svg class="comm_popup_foundation-block_remove">
                            <use xlink:href="#trash"></use>
                        </svg>
                    </div>
                </div>
            `;
            let commBlockWrap = createElement("div", "comm_block_wrap", commBlockInner);
            // найти, куда вставить
            let insertTo = table.querySelector(".table_allInfo_comments-wrapper");
            // выставить индекс в data-comm-index комментарию
            let otherComms = Array.from(insertTo.querySelectorAll(".comm_block_wrap"));
            commBlockWrap.dataset.commIndex = otherComms.length;
            // вставить новый комментарий и обозначить, что у элемента таблицы есть комментарий
            let hasCommentProperty = insertTo
                .closest(".table_body")
                .querySelector("[data-filter-item='comment-presence']");
            hasCommentProperty.dataset.filterConditionValue = "has-comment";
            insertTo.append(commBlockWrap);

            // применить фильтры и активировать кнопки редактирования
            onFilterSelectsChange();
            initPopupButtons();
        }
    }
}

function PopupStatusHandler(object) {
    let CheckBoxesChangesStatus = document.querySelectorAll('.comm_popup-textarea_name .form_radio');
    for (let o = 0; o < CheckBoxesChangesStatus.length; o++) {
        if (CheckBoxesChangesStatus[o].querySelector('input').checked) {
            let directObj = object.closest(".table_body");
            let datagender = directObj.querySelector('[data-gender]');

            datagender.classList.remove(directObj.querySelector('[data-gender]').dataset.worktype);
            datagender.classList.add(CheckBoxesChangesStatus[o].querySelector('input').dataset.worktype);
            datagender.dataset.worktype = CheckBoxesChangesStatus[o].querySelector('input').dataset.worktype;
            datagender.childNodes[0].textContent = CheckBoxesChangesStatus[o].querySelector('label').textContent;
        }
    }
}

popup_canc.onclick = function () {
    document.body.classList.remove("body--locked-scroll");
    document.querySelector('#comm_popup_wrapper').classList.remove('popup_active');
    document.querySelector('#comm_popup_wrapper').classList.remove('ch_comm');
    document.querySelector('#comm_popup_wrapper').classList.remove('add_comm');
}

document.querySelector('.table_allInfo > div:first-child > div').onclick = function () {
    document.querySelector('.table > div:nth-child(2)').classList.remove('yellow_row');
}
document.querySelector('.table_info_wrapp:nth-child(3) > div:nth-child(1)').onclick = function () {
    document.querySelector('.table > div:nth-child(2)').classList.remove('yellow_row');
}


allSelectors = document.querySelectorAll('.multiselect');
window.addEventListener('click', e => { // при клике в любом месте окна браузера
    const target = e.target;
    if (!target.closest('.multiselect')) { // если этот элемент или его родительские элементы не окно навигации и не кнопка
        for (var i = 0; i < allSelectors.length; i++) {
            allSelectors[i].classList.remove('select_active')
        } // то закрываем окно навигации, удаляя активный класс
    }
});
window.addEventListener('click', e => { // при клике в любом месте окна браузера
    const target = e.target
    if (!target.closest('.datetable_wrapper') & !target.closest('#calendar2_out') & !target.closest('#calendar3_out') & !target.closest('.CalendarSelectt') & !target.closest('.CalendarSelectt > option')) { // если этот элемент или его родительские элементы не окно навигации и не кнопка
        document.querySelector('.datetable_wrapper').classList.remove('datetable_active')
        // то закрываем окно навигации, удаляя активный класс
    }
});

//indarklist infavorite


tablesMore = document.querySelectorAll('.table_more');
for (var i = 0; i < tablesMore.length; i++) {
    tablesMore[i].onclick = function () {
        this.parentElement.childNodes[3].classList.toggle('table_popup_active');
    }
}
tablegenderit = document.querySelectorAll('.table_popup > div:first-child');
for (var i = 0; i < tablegenderit.length; i++) {
    tablegenderit[i].onclick = function () {
        this.parentElement.classList.remove('table_popup_active');
    }
}


document.querySelector('.work_more > a').onclick = function () {
    document.querySelector('.work_more').classList.toggle('work_more_active');
}
document.querySelector('.work_more button').onclick = function () {
    document.querySelector('.work_more').classList.remove('work_more_active');
}
allMoreWorks = document.querySelectorAll('.work_more');
window.addEventListener('click', e => { // при клике в любом месте окна браузера
    const target = e.target
    if (!target.closest('.work_more > div') & !target.closest('.work_more')) { // если этот элемент или его родительские элементы не окно навигации и не кнопка
        for (var i = 0; i < allMoreWorks.length; i++) {
            allMoreWorks[i].classList.remove('work_more_active')
        } // то закрываем окно навигации, удаляя активный класс
    }
});


window.addEventListener('click', e => { // при клике в любом месте окна браузера
    const target = e.target
    if (!target.closest('.profile_container') & !target.closest('.sign_contaiener > a:nth-child(1)')) { // если этот элемент или его родительские элементы не окно навигации и не кнопка
        // то закрываем окно навигации, удаляя активный класс
        document.querySelector('.profile_container').classList.remove('profile_active');
    }
});


trashList = document.querySelectorAll('.comm_popup_foundation-block_date > svg:nth-child(3)');
for (u = 0; u < trashList.length; u++) {
    trashList[u].onclick = function () {
        this.parentElement.parentElement.remove()
    }
}

var popup = document.querySelector('.warn_popup_wrapper');
if (popup.classList.contains("warn_active")) document.body.classList.add("body--locked-scroll");
document.querySelector('.warn_popup_exit').onclick = function () {
    document.querySelector('.warn_popup_wrapper').classList.remove('warn_active');
    document.body.classList.remove("body--locked-scroll");
}


function StatusWorkHandler(dataSetType, object) {
    document.querySelector('.save_status_work').onclick = function () {
        let RadioWork = document.querySelectorAll('.form_radio input');

        for (let i = 0; i < RadioWork.length; i++) {
            if (RadioWork[i].checked) {
                object.classList.remove(object.dataset.worktype)
                object.classList.add(RadioWork[i].dataset.worktype)
                object.dataset.worktype = RadioWork[i].dataset.worktype;
                object.dataset.filterConditionValue = RadioWork[i].dataset.worktype;
                object.childNodes[0].textContent =
                    RadioWork[i].closest('.form_radio_label')
                        .querySelector(".form_radio_value")
                        .textContent;

                document.querySelector('#work_popup_wrapper').classList.remove('popup_active');
                document.body.classList.remove("body--locked-scroll");
            }
        }
        doFilter();
    }
}


SpanStatusEdit = document.querySelectorAll('.workStatus > svg');
for (let i = 0; i < SpanStatusEdit.length; i++) {
    SpanStatusEdit[i].onclick = function () {
        let dataType = SpanStatusEdit[i].parentElement.dataset.worktype;
        let RadioWork = document.querySelectorAll('.form_radio input');
        for (let i = 0; i < RadioWork.length; i++) {
            if (this.parentElement.dataset.worktype == RadioWork[i].dataset.worktype) {
                RadioWork[i].checked = true;
            }
        }
        document.querySelector('#work_popup_wrapper').classList.add('popup_active');
        document.body.classList.add("body--locked-scroll");
        StatusWorkHandler(dataType, this.parentElement)
        let gender = this.parentElement.dataset.gender;
        let noWorkTextBlock =
            document.querySelector('.work_popup_radio .form_radio:first-child .form_radio_value');
        let workTextBlock =
            document.querySelector('.work_popup_radio .form_radio:last-child .form_radio_value');
        if (gender == 'female') {
            noWorkTextBlock.textContent = "Безработная";
            workTextBlock.textContent = "Работаю, но активно ищу работу";
        } else {
            noWorkTextBlock.textContent = "Безработный";
            workTextBlock.textContent = "Работаю, но активно ищу работу";
        }
    }
}

document
    .querySelector('#work_popup_wrapper .comm_popup-textarea_btns > button:first-child')
    .onclick = function () {
        document.querySelector('#work_popup_wrapper').classList.remove('popup_active');
        document.body.classList.remove("body--locked-scroll");
    }

function addApplicantHoverHandler() {
    let addApplicants = document.querySelectorAll(".add_applicant");
    addApplicants.forEach(addApp => {
        let link = addApp.querySelector(".add_applicant__link-button");
        let icon = addApp.querySelector(".add_applicant__icon-button");

        link.addEventListener("pointerover", onPointerover);
        icon.addEventListener("pointerover", onPointerover);
        link.addEventListener("pointerleave", onPointerleave);
        icon.addEventListener("pointerleave", onPointerleave);
    });

    function onPointerover(event) {
        let btn = event.target;
        let parent = btn.closest(".add_applicant");
        parent.classList.add("__hover");
    }
    function onPointerleave(event) {
        let btn = event.target;
        let parent = btn.closest(".add_applicant");
        parent.classList.remove("__hover");
    }
}

addApplicantHoverHandler();