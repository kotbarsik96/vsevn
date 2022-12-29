// получить координаты элемента
function getCoords(el) {
    const box = el.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        bottom: box.bottom + window.pageYOffset,
        left: box.left + window.pageXOffset,
        right: box.right + window.pageXOffset
    };
}

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
        if (this.rootElem.classList.contains("spoiler--shown")) this.show();
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

// в отдельных файлах (например, new-resume.js) создаются такие же массивы, которые затем через .concat "сращиваются" с inittingSelectors, что позволяет инициализировать их в inittedInputs
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

            let inputClass = new seldata.classInstance(node);
            inputClass.instanceFlag = seldata.instanceFlag;
            inittedInputs.push(inputClass);
        });
    });
}

let inputElementsObserver = new MutationObserver((mutlist) => {
    initInputs();
});
inputElementsObserver.observe(document.body, { childList: true, subtree: true });

function findInittedInput(selector, isAll = false, instanceFlag = null) {
    // isAll == true: вернет array, isAll == false: вернет первый найденный по селектору элемент
    const selectorNodes = Array.from(document.querySelectorAll(selector));
    if (!isAll) {
        const input = inittedInputs.find(arrayHandler);
        return input || null;
    } else {
        const inputs = inittedInputs.filter(arrayHandler);
        return inputs || null;
    }

    function arrayHandler(inpClass) {
        let matches = selectorNodes.includes(inpClass.rootElem);
        if (instanceFlag) matches = matches && inpClass.instanceFlag === instanceFlag;
        return matches;
    }
}
function findInittedInputByFlag(instanceFlag, isAll = false) {
    // isAll == true: вернет array, isAll == false: вернет первый найденный по флагу элемент
    if (isAll) {
        const inputs = inittedInputs.filter(arrayHandler);
        return inputs;
    } else {
        const input = inittedInputs.find(arrayHandler);
        return input;
    }

    function arrayHandler(inpClass){
        let matches = inpClass.instanceFlag === instanceFlag;
        return matches;
    }
}