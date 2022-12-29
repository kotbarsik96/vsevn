/* 
    ВЕРНУТЬ:
    валидацию полей: отображение сообщения под незаполненным полем, а также под незаполненными группами полей;
    пропуск отправления по валидации;
    data-complete-length="min, max" (необходимая длина для заполнения поля);
*/

function documentHandlers() {
    document.addEventListener("click", closeMultiselects);

    function closeMultiselects(event) {
        let targ = event.target;
        let isMultiselect = targ.classList.contains("multiselect")
            || targ.closest(".multiselect");
        if (isMultiselect) return;

        let multiselects = findInittedInput(".multiselect", true);
        multiselects.forEach(msClass => msClass.hide());
    }
}
documentHandlers();

// группа полей
class FieldsGroup {
    constructor(node) {
        this.checkCompletion = this.checkCompletion.bind(this);

        this.rootElem = node;
        this.fields = findInittedInputByFlag("new-resume", true)
            .filter(inpClass => inpClass.rootElem.closest(".forms__fields-group") === this.rootElem);

        this.createUncompletedMessage();
        this.fields.forEach(inpClass => {
            inpClass.rootElem.addEventListener("completion-check", this.checkCompletion);
        });
    }
    createUncompletedMessage() {
        let inputsHaveMessage = Boolean(
            this.fields.find(inpClass => {
                return inpClass.rootElem.querySelector(".field__uncompleted");
            })
        );
        let fieldHasMessage = Boolean(this.rootElem.querySelector(".field__uncompleted"));
        if (inputsHaveMessage || fieldHasMessage) return;

        this.uncompletedMessage = createElement("p", "field__uncompleted");
        this.rootElem.append(this.uncompletedMessage);
        this.renderUncompletedMessage();
    }
    renderUncompletedMessage() {
        if (!this.uncompletedMessage) return;

        let message = "Пожалуйста, укажите: ";
        this.fields.forEach((inpClass, index, arr) => {
            let ariaLabel = inpClass.ariaLabel;
            if (inpClass.isCompleted || !ariaLabel) return;

            message += ariaLabel.toLowerCase();
            if (index !== arr.length - 1) message += ", ";
        });
        this.uncompletedMessage.innerHTML = message;

    }
    checkCompletion() {
        let uncompleted = this.fields.filter(inpClass => {
            if (inpClass.checkCompletion) {
                return inpClass.checkCompletion(true);
            } else return false;
        });
        if (uncompleted.length === this.fields.length) this.rootElem.classList.remove("__uncompleted");
        else this.rootElem.classList.add("__uncompleted");
        this.renderUncompletedMessage();
    }
}

// ползунок
class Range {
    // все поле
    rootElem;
    // поле с бегунком
    range;
    // подшкалы, в которых указываются границы и шаги для этих границ
    rangeSubscales;
    // шкала
    rangeScale;
    // информация о шкале бегунка
    rangeData;
    // бегунок
    toggler;
    // поле со значением в цифрах
    valueInput;
    // значение
    value;
    // название поля
    name;
    // поле со значением
    valueInput;

    constructor(rangeBlock) {
        if (!rangeBlock.querySelector("[data-range-limits]")) return;
        this.rootElem = rangeBlock;
        this.range = rangeBlock.querySelector(".range");
        this.rangeScale = rangeBlock.querySelector(".range__scale");
        this.toggler = rangeBlock.querySelector(".range__toggler");
        this.valueInput = rangeBlock.querySelector(".range-block__value");
        this.name = this.valueInput.name;
        this.toggler.style.transform = "translate(-50%, 0)";

        this.getData();
        window.addEventListener("resize", this.getData.bind(this));

        this.setTogglerHandlers();
        this.setFocusHandler();
        this.valueInput.addEventListener("change", this.checkInputValue.bind(this));
        this.setValue(this.rangeData.minValue);
    }
    getData() {
        if (!this.rangeData) {
            this.rangeSubscales = Array.from(this.rootElem.querySelectorAll(".range__subscale"))
                .map(subscale => {
                    const limits = subscale.dataset.rangeLimits.split(", ");
                    const step = parseInt(subscale.dataset.rangeStep);

                    if (limits.length < 2)
                        throw new Error("Неверно указаны значения data-range-limits в range");

                    const minValue = parseInt(limits[0]);
                    const maxValue = parseInt(limits[1]);
                    subscale.remove();
                    return { step, minValue, maxValue: maxValue || minValue };
                });
        }

        const width = this.range.offsetWidth - this.toggler.offsetWidth / 1.2;
        const minValue = this.rangeSubscales[0].minValue;
        const maxValue = this.rangeSubscales[this.rangeSubscales.length - 1].maxValue;
        const totalValue = maxValue - minValue;
        this.rangeData = {
            width,
            minValue,
            maxValue,
            totalValue,
            step: totalValue / width
        }
        this.setValue(this.rangeData.minValue);
        this.toggler.style.transform = "translate(-50%, 0)";
        this.moveToggler(0);
    }
    setTogglerHandlers() {
        onMove = onMove.bind(this);
        onUp = onUp.bind(this);

        const toggler = this.toggler;
        const range = this.range;
        const maxRangeWidth = this.rangeData.width;
        let shift = getCoords(this.range).left + toggler.offsetWidth / 2;
        toggler.addEventListener("pointerdown", onDown.bind(this));
        range.addEventListener("pointerdown", onDown.bind(this));
        toggler.ondragstart = () => false;
        range.ondragstart = () => false;
        this.rangeScale.style.width = getComputedStyle(toggler).left;

        function onDown(event) {
            event.preventDefault();
            shift = getCoords(this.range).left + toggler.offsetWidth / 2;

            // курсор на бегунке
            if (event.target === toggler) {
                document.addEventListener("pointermove", onMove);
                document.addEventListener("pointerup", onUp);
                toggler.classList.add("__moving");
            }
            // курсор на шкале
            else {
                const x = event.clientX - shift;
                if (x >= 0 && x <= maxRangeWidth) {
                    toggler.style.left = `${x}px`;
                    toggler.dispatchEvent(new Event("pointerdown"));
                }
            }
        }
        function onMove(event) {
            let x = event.clientX - shift;

            if (x < 0) x = 0;
            else if (x > maxRangeWidth) x = maxRangeWidth;

            let newValue = Math.round(this.rangeData.step * x) + this.rangeData.minValue;
            const reqStep = this.rangeSubscales.find(sbsc => {
                return newValue >= sbsc.minValue && newValue <= sbsc.maxValue;
            }).step;
            const n = parseInt(newValue / reqStep);
            newValue = (n * reqStep - this.rangeData.minValue);
            x = newValue / this.rangeData.step;


            this.moveToggler(x);
            this.valueInput.value =
                Math.round(this.rangeData.step * x) + this.rangeData.minValue;
            this.valueInput.dispatchEvent(new Event("change"));
        }
        function onUp() {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            toggler.classList.remove("__moving");
        }
    }
    checkInputValue(event) {
        const input = this.valueInput;
        let value = parseInt(input.value.replace(/\D/g, ""));
        if (value > this.rangeData.maxValue) value = this.rangeData.maxValue;
        if (value < this.rangeData.minValue) value = this.rangeData.minValue;
        input.value = value.toLocaleString() + " рублей";

        // при введении пользователем числа
        if (event.isTrusted) {
            const x = (value - this.rangeData.minValue) / this.rangeData.step;
            this.moveToggler(x);
        }
    }
    setValue(val) {
        this.valueInput.value = val;
        this.valueInput.dispatchEvent(new Event("change"));
    }
    moveToggler(x) {
        this.toggler.style.left = `${x}px`;
        this.rangeScale.style.width = `${x}px`;
        this.togglerLeft = x;

        const xtrunc = parseInt(x);
        if (xtrunc === 0) this.toggler.style.cssText += "transform: translate(-50%, 0%)";
        if (xtrunc >= parseInt(this.rangeData.width)) {
            this.toggler.style.cssText += "transform: translate(50%, 0%)";
            this.rangeScale.style.width = `${x + this.toggler.offsetWidth}px`;
        }
        if (xtrunc !== 0 && xtrunc !== parseInt(this.rangeData.width)) {
            this.toggler.style.removeProperty("transform");
        }
    }
    setFocusHandler() {
        this.rootElem.addEventListener("click", () => this.valueInput.focus());
        this.valueInput.addEventListener("focus", () => this.rootElem.classList.add("__focus"));
        this.valueInput.addEventListener("blur", () => this.rootElem.classList.remove("__focus"));
    }
}

// селект
class Multiselect {
    constructor(node) {
        this.toggle = this.toggle.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onChange = this.onChange.bind(this);
        this.clear = this.clear.bind(this);

        this.rootElem = node;
        this.selectBox = this.rootElem.querySelector(".selectBox");
        this.uncompleteMessage = this.rootElem.querySelector(".field__uncompleted");
        this.selectBoxValueText = this.selectBox.querySelector(".selectBox_value-text");
        this.placeholder = this.selectBoxValueText.textContent;
        this.optionLabels = Array.from(this.rootElem.querySelectorAll(".multiselect__label"));
        this.options = this.optionLabels.map(label => label.querySelector("input"));
        this.closeBtn = this.rootElem.querySelector(".selctexit_btn");

        this.selectBox.addEventListener("click", this.toggle);
        this.options.forEach(opt => opt.addEventListener("change", this.onChange));
        this.closeBtn.addEventListener("click", this.clear);
    }
    show() {
        this.rootElem.classList.add("select_active");
    }
    hide() {
        this.rootElem.classList.remove("select_active");
    }
    toggle(event = null) {
        let otherSelects = findInittedInput(".multiselect", true)
            .filter(msClass => msClass.rootElem !== this.rootElem);
        otherSelects.forEach(msClass => msClass.hide());

        if (event) {
            let targ = event.target;
            let isException = targ === this.closeBtn
                || targ.closest(".selctexit_btn") === this.closeBtn;

            if (isException) return;
        };

        this.rootElem.classList.contains("select_active")
            ? this.hide()
            : this.show();
    }
    onChange(event) {
        let checked = event.target;
        this.selectBox.classList.add("selbActive");
        this.selectBoxValueText.innerHTML = checked.dataset.mselectValue;
        this.hide();
        this.checkCompletion();
    }
    clear() {
        this.options.forEach(opt => {
            if (opt.checked) {
                opt.checked = false;
                opt.dispatchEvent(new Event("change"));
            }
        });
        this.selectBox.classList.remove("selbActive");
        this.selectBoxValueText.innerHTML = this.placeholder;
    }
    checkCompletion(preventEvent) {
        let checkedInput = this.options.find(opt => opt.checked);
        if (checkedInput) this.rootElem.classList.remove("__uncompleted");
        else this.rootElem.classList.add("__uncompleted");

        let isCompleted = Boolean(checkedInput);
        this.isCompleted = isCompleted;

        if (!preventEvent) this.rootElem.dispatchEvent(new CustomEvent("completion-check"));
        return isCompleted;
    }
}

// поле для ввода текста
class TextField {
    constructor(node) {
        this.onChange = this.onChange.bind(this);
        this.typeNumberOnly = this.typeNumberOnly.bind(this);

        this.rootElem = node;
        this.input = this.rootElem.querySelector(".text-field__input");
        this.ariaLabel = this.input.getAttribute("aria-label");

        if (this.input.dataset.mask) this.createMask();
        this.getCompleteConditions();
        this.input.addEventListener("change", this.onChange);
        this.input.addEventListener("blur", this.onChange);
        if (this.input.hasAttribute("data-numbers-only"))
            this.input.addEventListener("input", this.typeNumberOnly);
    }
    getCompleteConditions() {
        const mask = this.mask;
        const completeLength = this.input.dataset.completeLength;
        const hasCompleteMatch = this.input.hasAttribute("data-complete-match");

        if (mask) {
            let maxLength;
            let minLength = mask.length;
            this.completeCondition = { minLength, maxLength };
        } else if (completeLength) {
            const values = completeLength.split(", ");
            this.completeCondition = { minLength: values[0], maxLength: values[1] };
        } else if (hasCompleteMatch) {
            let completeMatch = this.input.dataset.completeMatch;
            let values = [];
            // если не указаны в атрибуте, искать в .field__options-item элементах
            if (!completeMatch) {
                values = Array.from(document.querySelectorAll(".field__options-item"))
                    .map(item => item.textContent || item.innerText);
            }
            // если указаны в атрибуте в формате Значение1|Значение2, взять оттуда
            else {
                values = completeMatch.split("|");
            }
            this.completeCondition = { match: values };
        }
        // если не указаны никакие условия
        else this.completeCondition = { minLength: 0 };
    }
    // если у поля есть маска заполнения
    createMask() {
        const mask = this.input.dataset.mask;
        if (!mask) return;

        this.mask = mask;
        this.input.removeAttribute("data-mask");
        checkInputMask = checkInputMask.bind(this);
        this.mask = mask;
        const input = this.input;
        if (!input.hasAttribute("placeholder")) input.setAttribute("placeholder", mask);

        input.addEventListener("focus", checkInputMask);
        input.addEventListener("pointerdown", checkInputMask);
        input.addEventListener("input", checkInputMask);
        function checkInputMask(event) {
            const positions = mask.split("");
            let valueNew = "";

            if (event.type === "input") {
                if (event.data) {
                    const val = input.value.split("");
                    const spliced = val.splice(input.selectionStart - 1, 1);
                    input.value = val.join("") + spliced;
                }
            }
            for (let i = 0; i < positions.length; i++) {
                if (positions[i] === "_") {
                    if (input.value[i]) {
                        valueNew += input.value[i];
                        continue;
                    } else break;
                }
                valueNew += positions[i];
            }
            input.value = valueNew;
        }
    }
    onChange() {
        this.checkCompletion();
    }
    checkCompletion(preventEvent = false) {
        const conditions = this.completeCondition;
        let value = this.input.value;
        let isCompleted = false;
        // проверка на совпадение с data-complete-match
        if (conditions.match) {
            if (conditions.match.includes(value)) isCompleted = true;
            else isCompleted = false;
        }
        // проверка на длину из data-mask или data-complete-length
        else if (conditions.minLength >= 0) {
            let isRightNumber = false;
            // если указан верхний порог
            if (conditions.maxLength) {
                isRightNumber = value.length >= conditions.minLength && value.length <= conditions.maxLength;
            }
            // если верхнего порога нет
            else isRightNumber = value.length >= conditions.minLength;

            // если в input с data-mask есть незаполненные места
            if (this.input.value.includes("_")) isRightNumber = false;

            isCompleted = isRightNumber;
        }

        if (isCompleted) this.rootElem.classList.remove("__uncompleted");
        else this.rootElem.classList.add("__uncompleted");

        if (!preventEvent) this.rootElem.dispatchEvent(new CustomEvent("completion-check"));

        this.isCompleted = isCompleted;
        return isCompleted;
    }
    typeNumberOnly(event) {
        const inputtedValue = event.data;
        if (parseInt(inputtedValue) >= 0) return;
        event.target.value = event.target.value.replace(inputtedValue, "_");
    }
}

// поле для ввода текста, содержащее несколько input
class TextFieldMulti extends TextField {
    constructor(node) {
        super(node);
        this.typeNumberOnly = this.typeNumberOnly.bind(this);
        this.setValue = this.setValue.bind(this);

        this.inputs = Array.from(this.rootElem.querySelectorAll(".text-field__input-subfield"));

        this.inputs.forEach(input => {
            if (input.hasAttribute("data-numbers-only"))
                input.addEventListener("input", this.typeNumberOnly);
            input.addEventListener("input", this.setValue);
            input.addEventListener("change", this.onChange);
            input.addEventListener("blur", this.onChange);

            let maxlength = input.getAttribute("maxlength");
            if (maxlength) {
                input.style.width = `${maxlength - (maxlength * 0.3)}em`;
            }
        });
    }
    setValue(event) {
        const targInput = event.target;

        let value = "";
        this.inputs.forEach(inp => value += inp.value);
        this.input.value = value;

        if (targInput.value.length >= targInput.getAttribute("maxlength")) {
            const currentIndex = this.inputs.indexOf(targInput);
            const nextInput = this.inputs[currentIndex + 1];
            if (nextInput) nextInput.focus();
        }
    }
}

class TextFieldDate extends TextFieldMulti {
    constructor(node) {
        super(node);
        this.inputDay = this.inputs[0];
        this.inputMonth = this.inputs[1];
        this.inputYear = this.inputs[2];
        this.fieldsGroup = this.rootElem.closest(".forms__fields-group");
        this.inputs.forEach(inp => inp.addEventListener("input", this.onChange));
    }
    validate() {
        let biggestMonths = [1, 3, 5, 7, 8, 10, 12];

        let day = parseInt(this.inputDay.value);
        let month = parseInt(this.inputMonth.value);
        let year = parseInt(this.inputYear.value);

        let isCorrectDay = day >= 1 && day <= 31;
        let isCorrectMonth = month >= 1 && month <= 12;
        let isCorrectYear = year >= 1900;

        if (month === 2 && year % 4 === 0) {
            if (year % 4 === 0) isCorrectDay = day >= 1 && day <= 29;
            if (year % 4 !== 0) isCorrectDay = day >= 1 && day <= 28;
        } else if (!biggestMonths.includes(month)) isCorrectDay = day >= 1 && day <= 30;

        let isValidDate = isCorrectDay && isCorrectMonth && isCorrectYear;
        let age = this.currentYear - year;

        return { day, month, year, age, isValidDate, isCorrectDay, isCorrectMonth, isCorrectYear };
    }
    checkCompletion(preventEvent = false) {

    }
}

class TextFieldBirthDate extends TextFieldDate {
    constructor(node) {
        super(node);

        this.zodiacSigngs = [
            { name: "Водолей", startMonth: 1, startDay: 21, endDay: 18, iconName: "aquarius" },
            { name: "Рыбы", startMonth: 2, startDay: 19, endDay: 20, iconName: "pisces" },
            { name: "Овен", startMonth: 3, startDay: 21, endDay: 19, iconName: "aries" },
            { name: "Телец", startMonth: 4, startDay: 20, endDay: 20, iconName: "taurus" },
            { name: "Близнецы", startMonth: 5, startDay: 21, endDay: 20, iconName: "gemini" },
            { name: "Рак", startMonth: 6, startDay: 21, endDay: 22, iconName: "cancer" },
            { name: "Лев", startMonth: 7, startDay: 23, endDay: 22, iconName: "leo" },
            { name: "Дева", startMonth: 8, startDay: 23, endDay: 22, iconName: "virgo" },
            { name: "Весы", startMonth: 9, startDay: 23, endDay: 22, iconName: "libra" },
            { name: "Скорпион", startMonth: 10, startDay: 23, endDay: 21, iconName: "scorpio" },
            { name: "Стрелец", startMonth: 11, startDay: 22, endDay: 21, iconName: "sagittarius" },
            { name: "Козерог", startMonth: 12, startDay: 22, endDay: 20, iconName: "capricorn" },
        ];
        this.uncompletedText = this.rootElem.closest(".forms__fields-group")
            .querySelector(".field__uncompleted");
        this.currentYear = new Date().getFullYear();

        this.minYearSpan = this.uncompletedText.querySelector(".birthdate-min-year");
        this.maxYearSpan = this.uncompletedText.querySelector(".birthdate-max-year");
        this.minYear = this.currentYear - 99;
        this.maxYear = this.currentYear - 10;
        this.minYearSpan.textContent = this.minYear.toString();
        this.maxYearSpan.textContent = this.maxYear.toString();
    }
    checkCompletion() {

    }
    validate() {

    }
}

class Forms {
    constructor(node) {
        this.onSubmit = this.onSubmit.bind(this);

        this.rootElem = node;
        this.inputs = findInittedInputByFlag("new-resume", true);

        this.rootElem.addEventListener("submit", this.onSubmit);
    }
    onSubmit(event) {
        event.preventDefault();
        this.checkCompletion();
    }
    checkCompletion() {
        let uncompleted = this.inputs.filter(inpClass => {
            // проверяет, есть ли метод checkCompletion
            if (!inpClass.checkCompletion) return;

            // проверяет, заполнено ли поле верно
            let isUncompleted = !inpClass.checkCompletion();
            return isUncompleted;
        });
    }
}

let inittingNewResumeSelectors = [
    { selector: ".range-block", classInstance: Range },
    { selector: ".multiselect", classInstance: Multiselect, instanceFlag: "new-resume" },
    { selector: ".text-field--standard", classInstance: TextField, instanceFlag: "new-resume" },
    { selector: ".text-field--multi", classInstance: TextFieldMulti, instanceFlag: "new-resume" },
    { selector: ".text-field--date", classInstance: TextFieldDate, instanceFlag: "new-resume" },
    { selector: ".text-field--birthdate", classInstance: TextFieldBirthDate, instanceFlag: "new-resume" },
    { selector: ".forms__fields-group", classInstance: FieldsGroup, instanceFlag: "new-resume" },
    { selector: ".forms", classInstance: Forms },
];

inittingSelectors = inittingSelectors.concat(inittingNewResumeSelectors);