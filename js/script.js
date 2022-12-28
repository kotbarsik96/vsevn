// определить браузер
function getBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    let browser = [
        userAgent.match(/chrome/),
        userAgent.match(/opera/),
        userAgent.match(/safari/),
        userAgent.match(/firefox/)
    ].find(br => br);
    if (browser) browser = browser[0];

    return browser;
}
const browser = getBrowser();

function browsersFix() {
    if (browser !== "firefox" && browser !== "safari") {
        let translate1px = [];
        translate1px = translate1px
            .concat(Array.from(document.querySelectorAll(`[data-table-search-item="added-by"]`)));

        translate1px.forEach(block => {
            block.style.transform = "translate(0, 1px)";
        });
    }
    if (browser === "firefox") {
        let addMozfixClass = [];
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".fav-blacklist_container-child")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".selectBox_value-text")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".calendarouts_text")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".foundation-clear_filter")));

        addMozfixClass.forEach(el => {
            el.classList.add("__moz-fix");
        });
        document.querySelectorAll(".comm_popup-textarea_btns")
            .forEach(textareaBtns => {
                textareaBtns.querySelectorAll("button")
                    .forEach(btn => btn.classList.add("__moz-fix"));
            });
    }
}
browsersFix();

let bodyOverflow;
let bodyOverflowObserver = new MutationObserver(() => {
    let wrapper = document.querySelector(".wrapper");

    if (document.body.classList.contains("body--locked-scroll")) {
        let scrollWidth = getScrollWidth();
        wrapper.style.paddingRight = `${scrollWidth}px`;
    } else {
        wrapper.style.removeProperty("padding-right");
    }
});

bodyOverflowObserver.observe(document.body, { attributes: true });

function getScrollWidth() {
    let block = document.createElement("div");
    block.style.cssText = `
        width: 100px; height: 100px; z-index: -1; position: absolute; bottom: -150vh; overflow: scroll;
    `;
    document.body.append(block);
    let scrollWidth = block.offsetWidth - block.clientWidth;
    block.remove();
    return scrollWidth;
}

function createElement(tagName, className, htmlContent) {
    let block = document.createElement(tagName);
    block.className = className || "";
    if (htmlContent) block.insertAdjacentHTML("afterbegin", htmlContent);
    return block;
}

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


document.querySelector('.header > nav > img').addEventListener('click', e => {
    let headerWrapper = document.querySelector('.header_wrapper');
    headerWrapper.classList.toggle('menu_active');
    headerWrapper.classList.contains('menu_active')
        ? document.body.classList.add('body--locked-scroll')
        : document.body.classList.remove('body--locked-scroll');
});
document.querySelector('.exit_menu').addEventListener('click', e => {
    document.querySelector('.header_wrapper').classList.remove('menu_active');
    document.body.classList.remove('body--locked-scroll');
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



loginList = document.querySelectorAll('.header-nav_wrapper > ul:nth-child(2) > li a');
for (u = 0; u < loginList.length; u++) {
    loginList[u].onclick = function () {
        document.querySelector('.header-nav_wrapper').classList.add('header_log');
    }
}

document.querySelector('.sign_contaiener > a:nth-child(2)').onclick = function () {
    document.querySelector('.header-nav_wrapper').classList.remove('header_log');
}

document.querySelector('.sign_contaiener > a:nth-child(1)').onclick = function () {
    document.querySelector('.profile_container').classList.toggle('profile_active');
}

window.addEventListener('click', e => { // при клике в любом месте окна браузера
    const target = e.target
    if (!target.closest('.profile_container') & !target.closest('.sign_contaiener > a:nth-child(1)')) { // если этот элемент или его родительские элементы не окно навигации и не кнопка
        // то закрываем окно навигации, удаляя активный класс
        document.querySelector('.profile_container').classList.remove('profile_active');
    }
});

document.querySelector('.profile-exit').onclick = function () {
    document.querySelector('.profile_container').classList.remove('profile_active');
    document.querySelector('.header-nav_wrapper').classList.remove('header_log');
}


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

// найдет ближайший элемент по отношению к node
function findClosest(node, selector) {
    let element = node.querySelector(selector);
    if (!element) {
        do {
            element = node.parentNode.querySelector(selector);
            node = node.parentNode;
        } while (!element)
    }
    return element;
}

addApplicantHoverHandler();

class FullImagePopup {
    constructor(node) {
        this.onImgClick = this.onImgClick.bind(this);
        this.setImgSize = this.setImgSize.bind(this);
        this.closePopup = this.closePopup.bind(this);

        this.rootElem = node;
        this.src = this.rootElem.getAttribute("src");
        this.alt = this.rootElem.getAttribute("alt") || "";
        // процент большей стороны от ширины экрана
        this.biggestSidePercent = 80;

        this.rootElem.addEventListener("click", this.onImgClick);
    }
    createPopup() {
        let popupWrapper = createElement("div", "full-image");
        let popupInner = `
        <div class="full-image__body">
            <div class="popup_exit" id="popup_exit1">
                <div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
        `;
        popupWrapper.insertAdjacentHTML("afterbegin", popupInner);
        popupWrapper.querySelector(".popup_exit").addEventListener("click", this.closePopup)
        this.popupWrapper = popupWrapper;

        let img = new Image();
        img.src = this.src;
        img.onload = () => {
            this.img = img;
            this.iWidth = img.width;
            this.iHeight = img.height;
            let fullImageBody = this.popupWrapper.querySelector(".full-image__body");
            fullImageBody.prepend(img);
            this.setImgSize();
            window.addEventListener("resize", this.setImgSize);
        }
    }
    onImgClick() {
        this.createPopup();
        document.body.append(this.popupWrapper);
        document.body.classList.add("body--locked-scroll");
    }
    setImgSize() {
        let windowWidth = document.documentElement.clientWidth;
        let windowHeight = document.documentElement.clientHeight;

        let ratio = this.iWidth / this.iHeight;
        let maxWidth = Math.round(windowWidth * (this.biggestSidePercent / 100));
        let maxHeight = Math.round(windowHeight * (this.biggestSidePercent / 100));
        if (ratio === 1) {
            let size = Math.min(maxWidth, maxHeight);
            if (size > this.iWidth) size = this.iWidth;

            this.img.width = this.img.height = size;
        } else {
            let width, height;

            if (this.iWidth > this.iHeight) {
                height = maxHeight > this.iHeight ? this.iHeight : maxHeight;
                width = ratio * height;
                if (width > maxWidth) {
                    width = maxWidth;
                    height = width / ratio;
                }
            }
            if (this.iHeight > this.iWidth) {
                width = maxWidth > this.iWidth ? this.iWidth : maxWidth;
                height = width / ratio;
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * ratio;
                }
            }

            this.img.width = width;
            this.img.height = height;
        }
    }
    closePopup() {
        this.popupWrapper.remove();
        document.body.classList.remove("body--locked-scroll");
        window.removeEventListener("resize", this.setImgSize);
        this.iWidth = 0;
        this.iHeight = 0;
    }
}

// динамический адаптив: на указанном медиа-запросе (max-width=${query}px) перемещает блоки из одного места в другое посредством замены другого элемента
/* Чтобы работало, нужно: 
    1) создать элемент-"якорь", который будет заменен при адаптиве (достижении медиа-запроса max-width) и указать ему класс, id или любой другой селектор;
    2) элементу, который перемещается при адаптиве, задать атрибут data-dynamic-adaptive="query, selector", где query - значение медиа-запроса (max-width=${query}px), а selector - селектор заменяемого элемента (из шага 1)
*/
class DynamicAdaptive {
    constructor(node) {
        this.onMediaChange = this.onMediaChange.bind(this);

        this.rootElem = node;
        let data = this.rootElem.dataset.dynamicAdaptive.split(", ");
        this.mediaValue = data[0];
        this.mediaQuery = window.matchMedia(`(max-width: ${this.mediaValue}px)`);
        this.adaptiveSelector = data[1];
        this.adaptiveNode = findClosest(this.rootElem, this.adaptiveSelector);
        this.backAnchor = createElement("div");

        this.onMediaChange();
        this.mediaQuery.addEventListener("change", this.onMediaChange);
    }
    onMediaChange() {
        if (this.mediaQuery.matches) {
            this.rootElem.replaceWith(this.backAnchor);
            this.adaptiveNode.replaceWith(this.rootElem);
            this.isReplaced = true;
        } else if (this.isReplaced) {
            this.rootElem.replaceWith(this.adaptiveNode);
            this.backAnchor.replaceWith(this.rootElem);
        }
    }
}

class PopupCommEdit {
    constructor(node) {
        this.onBtnClick = this.onBtnClick.bind(this);
        this.onBtnControlClick = this.onBtnControlClick.bind(this);
        this.onInputEnter = this.onInputEnter.bind(this);

        this.rootElem = node;
        this.maxPageLength = 1500;
        this.popupWrapper = document.querySelector("#comm_popup_wrapper");
        this.commentsContainer = this.popupWrapper.querySelector(".comm_popup_foundation_wrapper");
        this.currentPage = 1;

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick(event) {
        let targ = event.target;
        this.currentTable = targ.closest(".table_body");

        this.renderPageControls();
        this.setPageArrowsHandlers();

        let workStatus = this.currentTable.querySelector('[data-worktype]').dataset.worktype;
        let PopupCheck = document.querySelectorAll('.comm_popup-textarea_name input');
        for (let u = 0; u < PopupCheck.length; u++) {
            if (PopupCheck[u].dataset.worktype == workStatus) {
                PopupCheck[u].checked = true;
            }
        }
        let gender = this.currentTable.querySelector("[data-gender]").dataset.gender;
        genderHandler(gender);
        document.querySelector('#comm_popup_wrapper').classList.add('ch_comm');
        document.querySelector('#comm_popup_wrapper').classList.add('popup_active');
        document.body.classList.add("body--locked-scroll");

        ppEx(targ);

        // отобразить редактируемый комментарий
        this.commBlockWrap = targ.closest(".comm_block_wrap");
        let comment = this.commBlockWrap.querySelector(".comm_block_text")
            .textContent.replace(/\s\s/g, "").trim();
        let textarea = document.querySelector(".comm_popup").querySelector("textarea");
        textarea.value = comment;

        let tableItems = Array.from(
            document.querySelector(".table").querySelectorAll(".table_body")
        );
        let tableIndex = tableItems.findIndex(table => table === this.currentTable);
        this.popupWrapper.dataset.tableIndex = tableIndex;

        // сохранить id редактируемого комментария (для обработки последующего нажатия на кнопку сохранения)
        this.popupWrapper.dataset.editCommIndex = this.commBlockWrap.dataset.commIndex;

        // отобразить остальные комментарии в popup'е
        this.renderPopupCommsPages();

        // сменить статус работника по нажатию на "Сохранить"
        let saveBtn = this.popupWrapper.querySelector(".popup_save_new-comm");
        saveBtn.addEventListener("click", onSaveBtnClick);

        function onSaveBtnClick() {
            PopupStatusHandler(targ);
            saveBtn.removeEventListener("click", onSaveBtnClick);
        }
    }
    renderPopupCommsPages() {
        setFoundationBlockHandlers = setFoundationBlockHandlers.bind(this);

        // создать блоки комментариев
        let otherComms = Array.from(this.currentTable.querySelectorAll(".comm_block_wrap"))
            .filter(otherComm => otherComm !== this.commBlockWrap);
        let popupFoundation = this.popupWrapper.querySelector(".comm_popup_foundation_wrapper");
        popupFoundation.innerHTML = "";
        this.popupComms = otherComms.map(comm => {
            let content = comm.querySelector(".comm_block_text").textContent;
            let date = comm.querySelector(".comm_block_text_date").textContent;
            let commIndex = comm.dataset.commIndex;
            let block = createPopupFoundationBlock(content, date, commIndex);
            return block;
        });

        // распределить созданные комментарии по страницам
        this.commsPages = [];
        let popupCommsClone = [...this.popupComms];
        let commSelector = ".comm_popup_foundation-block_text";
        popupCommsClone.forEach((comm, index, array) => {
            if (!comm) return;

            let textBlock = comm.querySelector(commSelector);
            let text = textBlock.textContent;
            if (text.length > this.maxPageLength) this.commsPages.push([comm]);
            else {
                let page = [];
                page.push(comm);
                while (getTotalLength(page) < this.maxPageLength) {
                    let nextComm = array[index + 1];
                    if (!nextComm) break;

                    page.push(nextComm);
                    array.splice(array.indexOf(nextComm), 1);
                }

                this.commsPages.push(page);
            }
        });
        this.setPage(this.currentPage);

        function createPopupFoundationBlock(content, date, commIndex) {
            let blockInner = `
            <div class="comm_popup_foundation-block_date">
                <span>${date}</span>
                <svg style="fill: #0088d2;" class="comm_popup_foundation-block_edit">
                    <use xlink:href="#pencil"></use>
                </svg>
                <svg class="comm_popup_foundation-block_remove">
                    <use xlink:href="#trash"></use>
                </svg>
            </div>
            <div class="comm_popup_foundation-block_text">
                ${content}
            </div>
            `;
            let block = createElement("div", "comm_popup_foundation-block", blockInner);
            block.dataset.popupCommIndex = commIndex;
            setFoundationBlockHandlers.call(this, block);
            return block;
        }
        function setFoundationBlockHandlers(block) {
            let editBtn = block.querySelector(".comm_popup_foundation-block_edit");
            let removeBtn = block.querySelector(".comm_popup_foundation-block_remove");

            editBtn.addEventListener("click", (event) => {
                callFoundationBlockHandler(event, onEditBtnClick);
            });
            removeBtn.addEventListener("click", (event) => {
                callFoundationBlockHandler(event, removeComm);
                this.renderPopupCommsPages();
            });
        }
        function callFoundationBlockHandler(event, handler) {
            let targ = event.target;
            let foundationBlock = targ.closest("[data-popup-comm-index]");
            let commIndex = parseInt(foundationBlock.dataset.popupCommIndex);
            let tableIndex = parseInt(commPopupWrapper.dataset.tableIndex);

            let table = document.querySelectorAll(".table .table_body")[tableIndex];
            let comm = table.querySelectorAll(".comm_block_wrap")[commIndex];

            handler(comm);
        }
        function onEditBtnClick(comm) {
            let otherCommEditBtn = comm.querySelector(".popup_edit");
            otherCommEditBtn.dispatchEvent(new Event("click"));
        }
        function getTotalLength(page) {
            let totalLength = 0;
            page.forEach(comm => {
                let text = comm.querySelector(commSelector).textContent;
                totalLength += text.length;
            });
            return totalLength;
        }
    }
    renderCurrentPage() {
        if (this.commsPages.length < 1) return;

        let page = this.commsPages[this.currentPage - 1];
        this.commentsContainer.innerHTML = "";
        page.forEach(comm => this.commentsContainer.append(comm));
    }
    renderPageControls() {
        let foundation = this.popupWrapper.querySelector(".comm_popup_foundation");
        let existingButtons = foundation.querySelector(".comm_popup_buttons");
        if (existingButtons) existingButtons.remove();

        let newControls = `
        <div class="comm_popup_buttons">
            <div class="comm_popup_buttons_wrapper">
                <div class="comm_popup_buttons_pag">
                    <button class="popup_button_prev">
                        <svg>
                            <use xlink:href='#arrow'></use>
                        </svg>
                    </button>
                    <button class="popup_button_next popup_button_active">
                        <svg>
                            <use xlink:href='#arrow'></use>
                        </svg>
                    </button>
                    <span>
                        <span class="comm_popup_page-start"></span>
                        <span>ИЗ</span>
                        <span class="comm_popup_page-end"></span>
                    </span>
                    <button class="popup_button_last popup_button_active">
                        <svg>
                            <use xlink:href='#arrow'></use>
                        </svg>
                    </button>
                </div>
                <div class="comm_popup_buttons_pag_inp">
                    <span>Перейти на страницу</span>
                    <input class="comm_popup_input" type="number" value="1">
                    <button class="comm_popup_input_enter">OK</button>
                </div>
            </div>
        </div>
        `;
        foundation.insertAdjacentHTML("beforeend", newControls);
    }
    setPageArrowsHandlers() {
        this.controlsBlock = this.popupWrapper.querySelector(".comm_popup_buttons_wrapper");
        this.btnPrev = this.controlsBlock.querySelector(".popup_button_prev");
        this.btnNext = this.controlsBlock.querySelector(".popup_button_next");
        this.btnLast = this.controlsBlock.querySelector(".popup_button_last");
        this.startTxtSpan = this.controlsBlock.querySelector(".comm_popup_page-start");
        this.endTxtSpan = this.controlsBlock.querySelector(".comm_popup_page-end");
        this.pageNumInput = this.controlsBlock.querySelector(".comm_popup_input");
        this.pageNumEnter = this.controlsBlock.querySelector(".comm_popup_input_enter");

        this.btnPrev.addEventListener("click", this.onBtnControlClick);
        this.btnNext.addEventListener("click", this.onBtnControlClick);
        this.btnLast.addEventListener("click", this.onBtnControlClick);

        this.pageNumInput.addEventListener("input", onInput);
        this.pageNumEnter.addEventListener("click", this.onInputEnter);

        function onInput(event) {
            let inp = event.target;
            let val = inp.value;
            inp.value = val.replace(/\D/g, "");
            while (inp.value.length > 2) {
                inp.value = inp.value.slice(-2)
            };
        }
    }
    onBtnControlClick(event) {
        let btn = event.target;
        if (btn.tagName !== "BUTTON") btn = event.target.closest("button");
        if (btn.getAttribute("disabled")) return;

        if (btn === this.btnPrev) this.setPage("prev");
        if (btn === this.btnNext) this.setPage("next");
        if (btn === this.btnLast) this.setPage("last");
    }
    onInputEnter() {
        let number = parseInt(this.pageNumInput.value);
        this.setPage(number || 1);
    }
    setPage(page) {
        let lastPage = this.commsPages.length || 1;

        if (!this.currentPage) this.currentPage = 1;
        if (this.currentPage > lastPage) this.currentPage = lastPage;

        let pageNumber = parseInt(page);
        if (pageNumber && pageNumber <= lastPage && pageNumber > 0) {
            this.currentPage = this.currentPage = pageNumber;
        } else if (typeof page === "string") {
            switch (page) {
                case "prev": this.currentPage--;
                    break;
                case "next": this.currentPage++;
                    break;
                case "last": this.currentPage = lastPage;
                default:
                    break;
            }
        } else this.currentPage = 1;

        if (this.currentPage === 1) {
            this.btnNext.removeAttribute("disabled");
            this.btnPrev.setAttribute("disabled", "");
            this.btnLast.removeAttribute("disabled");
        }
        if (this.currentPage === lastPage) {
            this.btnNext.setAttribute("disabled", "");
            this.btnPrev.removeAttribute("disabled");
            this.btnLast.setAttribute("disabled", "");
        }
        if (this.currentPage > 1 && this.currentPage < lastPage) {
            this.btnNext.removeAttribute("disabled");
            this.btnPrev.removeAttribute("disabled");
            this.btnLast.removeAttribute("disabled");
        }
        if (this.currentPage === 1 && lastPage === 1) {
            this.btnNext.setAttribute("disabled", "");
            this.btnPrev.setAttribute("disabled", "");
            this.btnLast.setAttribute("disabled", "");
        }

        this.startTxtSpan.innerHTML = this.currentPage;
        this.endTxtSpan.innerHTML = lastPage;
        this.renderCurrentPage();
    }
}

class PopupCommAdd {
    constructor(node) {
        this.onBtnClick = this.onBtnClick.bind(this);

        this.rootElem = node;

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick(event) {
        let popupWrapper = document.querySelector('#comm_popup_wrapper');
        let currentTable = event.target.closest(".table_body");

        let workStatus = event.target.closest(".table_body")
            .querySelector('[data-worktype]')
            .dataset.worktype;
        let PopupCheck = document.querySelectorAll('.comm_popup-textarea_name input');
        for (let u = 0; u < PopupCheck.length; u++) {
            if (PopupCheck[u].dataset.worktype == workStatus) {
                PopupCheck[u].checked = true;
            }
        }
        let gender = event.target.closest(".table_body").querySelector('[data-gender]').dataset.gender
        genderHandler(gender);
        popupWrapper.classList.add('add_comm');
        popupWrapper.classList.add('popup_active');

        let tableItems = Array.from(
            document.querySelector(".table").querySelectorAll(".table_body")
        );
        let tableIndex = tableItems.findIndex(table => table === currentTable);
        popupWrapper.dataset.tableIndex = tableIndex;
        document.body.classList.add("body--locked-scroll");
        ppEx(event.target);
    }
}

class PopupCommDelete {
    constructor(node) {
        this.onBtnClick = this.onBtnClick.bind(this);

        this.rootElem = node;

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick() {
        let tableIndex = this.rootElem.closest("[data-table-index]").dataset.tableIndex;
        let table = document.querySelectorAll(".table_body")[tableIndex];
        let commIndex = this.rootElem.closest("[data-edit-comm-index]").dataset.editCommIndex;
        let comm = table.querySelector(`[data-comm-index="${commIndex}"]`);

        removeComm(comm);
        closeCommPopup();
    }
}

class PopupConfirm {
    constructor(node, params = {}) {
        // params === { agreeBtnSelector: "", <optional> exitBtnSelector: "", popupInner: `` }
        this.onBtnClick = this.onBtnClick.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.agreeBtnHandler = this.agreeBtnHandler.bind(this);

        this.rootElem = node;
        this.popupInner = params.popupInner || "";
        this.popupWrapper = createElement("div", "", this.popupInner);
        this.agreeBtn = this.popupWrapper.querySelector(params.agreeBtnSelector);
        this.exitBtn = this.popupWrapper.querySelector(params.exitBtnSelector)
            || this.popupWrapper.querySelector(".popup_exit");

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick() {
        this.createPopup();
    }
    createPopup() {
        document.body.append(this.popupWrapper);
        document.body.classList.add("body--locked-scroll");
        this.setPopupHandlers();
    }
    setPopupHandlers() {
        this.exitBtn.addEventListener("click", this.closePopup);
        this.agreeBtn.addEventListener("click", this.agreeBtnHandler);
    }
    closePopup() {
        this.popupWrapper.remove();
        document.body.classList.remove("body--locked-scroll");
    }
    agreeBtnHandler() {
        this.closePopup();
    }
}

class DiedButton extends PopupConfirm {
    constructor(node) {
        super(node, {
            popupInner: `
            <div class="confirm_popup">
                <div class="confirm_popup__body">
                    <div class="confirm_popup__title">
                        Удалить безвозвратно резюме?
                    </div>
                    <div class="confirm_popup__textarea-btns">
                        <button class="confirm_popup__delete-resume">Да</button>
                    </div>
                    <div class="popup_exit">
                        <div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
            `,
            agreeBtnSelector: ".confirm_popup__delete-resume"
        });

        this.rootElem = node;

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick() {
        super.onBtnClick();
        this.resumeTable = this.rootElem.closest(".table_body");
    }
    agreeBtnHandler() {
        super.agreeBtnHandler();
        this.resumeTable.remove();
    }
}

class CommBlockRemove extends PopupConfirm {
    constructor(node) {
        super(node, {
            popupInner: `
            <div class="confirm_popup">
                <div class="confirm_popup__body">
                    <div class="confirm_popup__title">
                        Удалить комментарий?
                    </div>
                    <div class="confirm_popup__comm"></div>
                    <div class="confirm_popup__textarea-btns">
                        <button class="confirm_popup__delete-resume">Да</button>
                    </div>
                    <div class="popup_exit">
                        <div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
            `,
            agreeBtnSelector: ".confirm_popup__delete-resume"
        });

        this.rootElem = node;
        this.comm = this.rootElem.closest("[data-comm-index]");
        this.popupCommBlock = this.popupWrapper.querySelector(".confirm_popup__comm");

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick() {
        super.onBtnClick();

        this.commText = this.comm.querySelector(".comm_block_text").textContent;
        this.popupCommBlock.innerHTML = "";
        this.popupCommBlock.insertAdjacentHTML("afterbegin", this.commText);
    }
    agreeBtnHandler() {
        super.agreeBtnHandler();
        removeComm(this.comm);
    }
}

class Spoiler {
    constructor(node) {
        this.toggle = this.toggle.bind(this);

        this.rootElem = node;
        this.spoilerButton = this.rootElem.querySelector(".spoiler__button");
        this.spoilerHideable = this.rootElem.querySelector(".spoiler__hideable");

        this.spoilerButton.addEventListener("click", this.toggle);
        if(this.rootElem.classList.contains("spoiler--shown")) this.show();
        else this.hide();
    }
    toggle() {
        this.rootElem.classList.contains("spoiler--shown")
            ? this.hide()
            : this.show();
    }
    show() {
        let height = this.getHeight();
        this.spoilerHideable.style.cssText = `
            max-height: ${height}px;
            opacity: 1;
        `;
        this.spoilerHideable.style.removeProperty("padding");
        this.spoilerHideable.style.removeProperty("margin");
        this.rootElem.classList.add("spoiler--shown");
    }
    hide() {
        this.spoilerHideable.style.cssText = `
            padding: 0;
            margin: 0;
            opacity: 0;
            max-height: 0px;
        `;
        this.rootElem.classList.remove("spoiler--shown");
    }
    getHeight() {
        let clone = this.spoilerHideable.cloneNode(true);
        clone.style.cssText = "position: absolute; z-index: -99; top: -100vh; left: -100vw;";
        document.body.append(clone);
        let height = clone.offsetHeight;
        clone.remove();
        return height + 10;
    }
}

let inittingSelectors = [
    { selector: "[data-popup-fullimage]", classInstance: FullImagePopup },
    { selector: "[data-dynamic-adaptive]", classInstance: DynamicAdaptive },
    { selector: ".popup_edit", classInstance: PopupCommEdit },
    { selector: ".comm_block_text_edit", classInstance: PopupCommEdit },
    { selector: ".popup_add", classInstance: PopupCommAdd },
    { selector: ".popup_delete_comm", classInstance: PopupCommDelete },
    { selector: ".died", classInstance: DiedButton },
    { selector: ".comm_block_remove", classInstance: CommBlockRemove },
    { selector: ".spoiler", classInstance: Spoiler },
];
let inittedInputs = [];
initInputs();
function initInputs() {
    inittingSelectors.forEach(seldata => {
        let nodes = Array.from(document.querySelectorAll(`${seldata.selector}`));
        nodes.forEach(node => {
            let isAlreadyInitted = Boolean(
                inittedInputs.find(inpParams => {
                    return inpParams.rootElem === node
                        && inpParams instanceof seldata.classInstance
                })
            );
            if (isAlreadyInitted) return;

            inittedInputs.push(new seldata.classInstance(node));
        });
    });
}

let inputElementsObserver = new MutationObserver((mutlist) => {
    initInputs();
});
inputElementsObserver.observe(document.body, { childList: true, subtree: true });