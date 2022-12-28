const forms_observingNodesKeys = [
    "input", "button", "checkbox", "selectionField", "link", "inputWrapper", "rangeBlock", "imageBlock"
];

// кнопки add-field--education, которым подбирается одинаковая высота
function justifyAddButtonsHeight() {
    doJustify();
    window.addEventListener("resize", doJustify);

    function doJustify() {
        const selectors = [".add-field--education"];
        selectors.forEach(selector => {
            const buttons = Array.from(document.querySelectorAll(selector));
            buttons.forEach(btn => btn.style.removeProperty("min-height"));
            const heights = buttons.map(btn => btn.offsetHeight);
            const maxHeight = Math.max(...heights);
            buttons.forEach(btn => btn.style.minHeight = `${maxHeight}px`);
        });
    }
}
justifyAddButtonsHeight();

// обязательно должен быть инициализирован ДО остальных классов
class AddFields {
    constructor(button) {
        this.button = button;
        this.container = button.closest(".forms__container");
        this.maxFields = parseInt(button.dataset.addMax) || 100;
        this.showAmount = parseInt(button.dataset.addShow) || 0;
        this.removeButton = createElement("button", "add-field__remove");
        this.fields = [];
        button.removeAttribute("data-add-max");
        button.removeAttribute("data-add-show");
        this.title = this.container.querySelector(".add-field__title");
        this.groups = Array.from(this.container.querySelectorAll("[data-add-group]"));
        this.fieldsAmount = 0;

        this.askConfirmation = this.askConfirmation.bind(this);
        this.groups.forEach(gr => gr.remove());
        button.addEventListener("click", () => this.addField());
        if (this.showAmount) {
            for (let i = 0; i < this.showAmount; i++) this.addField();
        }
    }
    addField() {
        if (this.fieldsAmount + 1 > this.maxFields) return;

        this.fieldsAmount++;
        const groups = this.groups.map(el => el.cloneNode(true));
        this.fields.push(groups);
        groups.forEach(group => this.addGroup(group));

        // добавить кнопку удаления блока
        if (this.fieldsAmount > this.showAmount) {
            const button = createElement("button", "add-field__remove-button icon-bin", "Удалить блок");
            button.setAttribute("title", "Удалить блок");
            groups[groups.length - 1].before(button);
            button.addEventListener("click", (event) => {
                event.preventDefault();
                this.askConfirmation(groups, button);
            });
        }

        this.container.append(this.button);
        if (this.fieldsAmount >= this.maxFields) this.button.remove();
    }
    addGroup(group) {
        if (group.dataset.addGroup) {
            const skipAmount = parseInt(group.dataset.addGroup.split(":")[1]);
            if (skipAmount) {
                if (this.fieldsAmount <= skipAmount && skipAmount > 0) return;
                if (skipAmount < 0 && this.fieldsAmount > Math.abs(skipAmount)) return;
            };
        }
        const suffix = `_${this.fieldsAmount}`;
        group.removeAttribute("data-add-group");
        const inputs = Array.from(group.querySelectorAll("input"));
        const labels = Array.from(group.querySelectorAll("label"));
        labels.forEach(label => {
            const labelFor = label.getAttribute("for");
            if (labelFor) label.setAttribute("for", labelFor + suffix);
        });
        inputs.forEach(inp => {
            const id = inp.getAttribute("id");
            const name = inp.getAttribute("name");

            if (id) inp.setAttribute("id", id + suffix);
            if (name) inp.setAttribute("name", name + suffix);
        });

        this.container.append(group);
    }
    askConfirmation(groups, button) {
        confirmCallback = confirmCallback.bind(this);
        modal.createBasicModal(
            "Удалить блок?",
            "Будет удален выбранный блок",
            { text: "Удалить", confirmCallback },
            { text: "Не удалять" });
        modal.getModalBody().classList.add("modal__body--small");

        function confirmCallback() {
            button.remove();
            this.removeField(groups);
        }
    }
    removeField(field) {
        const index = this.fields.findIndex(f => f === field);
        if (index >= 0) {
            const field = this.fields[index];
            field.forEach(group => group.remove());
            this.fields.splice(index, 1);
            this.fieldsAmount--;
        }
        if (this.fieldsAmount < this.maxFields) this.container.append(this.button);
    }
}
class AddFieldsCheckbox {
    constructor(cb) {
        this.checkbox = cb;
        this.addGroupName = cb.dataset.addGroupCheckbox;
        this.group = cb.closest(".forms__fields-group");
        this.addFields = Array.from(this.group.querySelectorAll(`[data-add-group="${this.addGroupName}"]`));

        this.toggleGroups();
        this.checkbox.addEventListener("change", () => this.toggleGroups());
    }
    toggleGroups() {
        const checked = this.checkbox.checked;
        checked ? this.addGroup() : this.removeGroup();
    }
    addGroup() {
        const reversed = this.addFields.map(el => el).reverse();
        reversed.forEach(fd => {
            if (!fd.closest("body")) this.checkbox.parentNode.after(fd);
            fd.removeAttribute("data-add-group");
        });
    }
    removeGroup() {
        this.addFields.forEach(fd => fd.remove());
    }
}

// группы полей
class InputGroup {
    // группа
    group;
    // поля (объекты от Input)
    inputParams;
    // <p>...</p> с сообщением о незаполненных полях
    uncompleteParagraph;

    constructor(group, inputParams) {
        this.group = group;
        const hasUncomplParagraph = this.group.querySelector(".forms__fields-uncompleted:not(.__mobile)");
        if (!hasUncomplParagraph) {
            this.uncompleteParagraph = createElement("p", "forms__fields-uncompleted __desktop");
            this.group.append(this.uncompleteParagraph);
        }

        const inputNames = Array.from(group.querySelectorAll("input"))
            .map(inp => inp.name);
        this.inputParams = inputParams.filter(inpParam => inputNames.includes(inpParam.name));

        this.inputParams.forEach(inpParam => {
            if (inpParam.inputs) {
                inpParam.inputs.forEach(inp => {
                    inp.addEventListener("change", this.checkCompletion.bind(this));
                    document.querySelector("#form").addEventListener("submit", this.checkCompletion.bind(this));
                });
            } else if (inpParam.input) {
                inpParam.input.addEventListener("blur", this.checkCompletion.bind(this));
            }
        });
    }
    checkCompletion() {
        setTimeout(() => {
            const uncompleted = this.inputParams.filter(param => !param.isCompleted);
            const hasUncompleted = Boolean(uncompleted.length > 0);
            if (hasUncompleted) {
                this.group.classList.add("__uncomplete");
                this.createUncompleteMessage(uncompleted);
            } else this.group.classList.remove("__uncomplete");
        }, 0);
    }
    createUncompleteMessage(uncompleted) {
        if (this.uncompleteParagraph) {
            let labelsText = "";
            const labels = uncompleted.map(inpParams => {
                return inpParams.ariaLabel;
            });

            if (labels[0]) {
                labels.forEach((label, index) => {
                    label = label.toLowerCase();
                    if (index == 0) labelsText += " " + label;
                    else labelsText += ", " + label;
                });
                if (labelsText) {
                    labelsText += ".";
                    this.uncompleteParagraph.textContent = "Пожалуйста, укажите: " + labelsText;
                }
            }
        }
    }
}

// общий класс для полей - текстовых, checkbox, radio...
class Input {
    // группа полей, к которой относится это поле
    fieldGroup;
    // имя поля/полей
    name;
    // метка поля из aria-label
    ariaLabel;

    constructor(input) {
        this.fieldGroup = input.closest(".forms__fields-group");
    }
}
// текстовые поля
class TextInput extends Input {
    // само поле input
    input;
    // сам input или его родитель
    inputWrapper;
    // группа input'ов, под которыми появляется общий текст о незаполнении
    inputGroup;
    // условия, при которых input считается заполненным. Это объект с полями minLength, maxLength (проверяют длину value) и match (массив со строками, одна из которых должна соответствовать value)
    completeCondition;
    // может отсутствовать. Указывает на маску заполнения поля
    mask;
    // может отсутствовать. Содержит список возможных опций (массив)
    options;

    constructor(input) {
        super(input);
        this.input = input;
        this.name = input.name;
        this.ariaLabel = input.getAttribute("aria-label");
        this.inputGroup = this.input.closest(".forms__fields-group");

        if (this.input.classList.contains("field__wrapper")) this.inputWrapper = this.input;
        else this.inputWrapper = this.input.closest(".field__wrapper");

        if (input.dataset.mask) this.createMask();
        this.getCompleteConditions();
        this.getOptions();
        // обработчики
        this.input.addEventListener("focus", this.onFocus.bind(this));
        this.input.addEventListener("blur", this.onBlur.bind(this));
        this.input.addEventListener("change", this.onBlur.bind(this));
        if (this.input.hasAttribute("data-numbers-only"))
            this.input.addEventListener("input", this.typeNumberOnly.bind(this));
    }
    // получить условия, при которых input считается корректно заполненным
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
    // получить опции и, если есть, повесить обработчики
    getOptions() {
        this.options = Array.from(this.inputWrapper.closest(".field").querySelectorAll(".field__options-item"));
        this.options.forEach(opt => {
            opt.addEventListener("pointerdown", () => {
                this.input.focus();
                this.input.value = opt.textContent || opt.innerText;
            });
        });
    }
    onFocus() {
        this.inputWrapper.classList.add("__focus");
    }
    onBlur() {
        this.checkCompletion();
        this.inputWrapper.classList.remove("__focus");
    }
    typeNumberOnly(event) {
        const inputtedValue = event.data;
        if (parseInt(inputtedValue) >= 0) return;
        event.target.value = event.target.value.replace(inputtedValue, "_");
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
    tabBetweenInputs(event) {
        const input = event.target;
        const valueLength = input.getAttribute("maxlength");
        if (input.value.length == valueLength || input.value.length == 0) {
            const parent = input.parentNode;
            const otherInputs = Array.from(parent.childNodes)
                .filter(node => node.classList.contains("field__input"));
            const currentIndex = otherInputs.findIndex(el => el == input);
            // при очистке - вернуться на предыдущий
            if (!event.data && input.value.length == 0) {
                const prevInput = otherInputs[currentIndex - 1];
                if (prevInput) prevInput.focus();
            } else { // при заполнении - перейти к следующему
                const nextInput = otherInputs[currentIndex + 1];
                if (nextInput) nextInput.focus();
            }
        }
    }
    // проверять, правильно ли заполнен input. Если нет - вывести соответствующий текст
    checkCompletion() {
        const conditions = this.completeCondition;
        let value = this.input.value;
        // проверка на совпадение с data-complete-match
        if (conditions.match) {
            if (conditions.match.includes(value)) this.isCompleted = true;
            else this.isCompleted = false;
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

            this.isCompleted = isRightNumber;
        }

        this.setCompletedState();
    }
    setCompletedState() {
        switch (this.isCompleted) {
            case true:
                this.inputWrapper.classList.remove("__uncomplete");
                break;
            case false:
            default:
                this.inputWrapper.classList.add("__uncomplete");
                break;
        }
    }
}
class TextSelect extends TextInput {
    constructor(input) {
        super(input);
        this.optionsUl = this.inputWrapper.querySelector(".text-select__options");
        this.optionItems = this.inputWrapper.querySelectorAll(".text-select__option-item");
        this.setItemsHandler();
    }
    setItemsHandler() {
        this.optionItems.forEach(item => {
            item.addEventListener("pointerdown", (event) => {
                this.input.value = event.target.textContent || event.target.innerText;
                this.input.dispatchEvent(new Event("change"));
            });
        });
    }
}
class TextSelectWorkYear extends TextSelect {
    constructor(input) {
        super(input);
        this.maxYears = 30;
        this.setValues();
        this.input.addEventListener("change", this.checkCompletion.bind(this));
    }
    setValues() {
        this.currentYear = new Date().getFullYear();
        this.oldestYear = this.currentYear - this.maxYears;
        this.optionsUl.innerHTML = "";
        this.optionItems = [];
        for (let i = 1; i <= this.maxYears; i++) {
            const li = createElement("li", "text-select__option-item", this.currentYear - i);
            this.optionsUl.append(li);
            this.optionItems.push(li);
        }

        this.setItemsHandler();
    }
    checkCompletion() {
        const val = parseInt(this.input.value) || 0;
        if (val > this.currentYear || val < this.oldestYear) {
            this.isCompleted = false;
            this.input.closest(".field__input").classList.add("__uncomplete");
        } else {
            this.isCompleted = true;
            this.input.closest(".field__input").classList.remove("__uncomplete");
        }

        super.setCompletedState();
    }
}
class TextInputMulti extends TextInput {
    constructor(inputWrapper) {
        super(inputWrapper);
        this.inputWrapper = inputWrapper;
        if (!this.inputWrapper.querySelector("input[type='hidden']")) {
            this.input = createElement("input");
            this.input.setAttribute("type", "hidden");
            this.input.setAttribute("name", inputWrapper.dataset.name);
            this.name = this.input.name;
            this.inputWrapper.append(this.input);
            this.existed = false;
        } else {
            this.input = this.inputWrapper.querySelector("input[type='hidden']");
            this.name = this.input.name;
            this.existed = true;
        }
        this.fieldNameBlock = this.inputWrapper.closest(".field").querySelector(".field__name");
        if (this.fieldNameBlock) this.ariaLabel = this.fieldNameBlock.textContent;
        this.inputs = Array.from(this.inputWrapper.querySelectorAll("input[type='text']"));

        this.inputs.forEach(input => {
            if (input.hasAttribute("data-numbers-only"))
                input.addEventListener("input", this.typeNumberOnly.bind(this));
            input.addEventListener("input", this.setValue.bind(this));
            input.style.textAlign = "center";
        });
    }
    typeNumberOnly(event) {
        super.typeNumberOnly(event);
    }
    checkCompletion() {
        super.checkCompletion();
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
class TextInputTags extends TextInput {
    addButton;
    tags;
    list;

    constructor(input) {
        super(input);
        this.tags = [];
        this.addButton = this.inputWrapper.querySelector(".field-tags__add-icon");
        this.addButton.addEventListener("click", this.addTag.bind(this));
        input.addEventListener("keydown", (event) => {

            if (event.keyCode == 13) {
                this.addTag();
            }
        });
    }
    addTag() {
        if (!this.list) this.list = createElement("ul", "tags-list");
        const tagItem = createElement("li", "tags-list__item");
        const value = this.input.value.trim();
        if (!value || this.tags.find(tg => tg.querySelector("input").value === value))
            return;
        if (!this.list.closest("body")) this.inputWrapper.parentNode.append(this.list);

        const button = createElement("button", "tags-list__item-remove icon-close");
        button.addEventListener("click", (event) => {
            if (event.pointerType) this.removeTag(tagItem);
        });

        tagItem.insertAdjacentHTML("afterbegin", `<input name="${this.name}" type="hidden" disabled value="${value}">`);

        tagItem.insertAdjacentHTML("afterbegin", `<span class="tags-list__item-text">${value}</span>`);
        tagItem.append(button);
        tagItem.setAttribute("title", value);

        this.list.append(tagItem);
        this.tags.push(tagItem);
        this.handleTagItemWidth(tagItem);
        this.input.value = "";
        this.checkCompletion();
    }
    handleTagItemWidth(tagItem) {
        onResize = onResize.bind(this);
        const tagText = tagItem.querySelector(".tags-list__item-text");
        const tagBtn = tagItem.querySelector(".tags-list__item-remove");

        window.addEventListener("resize", onResize);
        onResize();

        function onResize() {
            if (!tagItem.closest("body")) return window.removeEventListener("resize", onResize);

            if (!this.rootContainer) this.rootContainer = document.querySelector(".container");
            const maxWidth = this.rootContainer.clientWidth - tagBtn.offsetWidth - 10;
            const clone = tagItem.cloneNode(true);
            clone.style.cssText = "position: absolute; z-index: -999; opacity: 0";
            this.rootContainer.append(clone);
            tagText.textContent = cutValue(tagText.textContent, clone, maxWidth, 85);
            if (tagItem.offsetWidth > maxWidth - 10) tagItem.style.marginRight = "0px";
            clone.remove();
        }
        function cutValue(value, clone, maxWidth, valueMaxlength) {
            let valueCut = value.length > valueMaxlength
                ? value.substring(0, valueMaxlength - 3) + "..."
                : value;
            clone.querySelector(".tags-list__item-text").textContent = valueCut;
            if (clone.offsetWidth > maxWidth)
                return cutValue(valueCut, clone, maxWidth, valueMaxlength - 1);

            return valueCut;
        }
    }
    removeTag(tagItem) {
        const index = this.tags.indexOf(tagItem);
        this.tags.splice(index, 1);
        tagItem.remove();
        if (this.tags.length < 1) this.list.remove();
    }
    checkCompletion() {
        if (!this.input.closest("body")) return this.isCompleted = true;
        this.isCompleted = this.tags.length > 0;
        this.setCompletedState();
    }
}
// отдельный класс для поля дат
class TextInputDate extends TextInputMulti {
    constructor(input) {
        super(input);
        this.currentYear = new Date().getFullYear();
        input.addEventListener("change", this.checkCompletion.bind(this));
        this.inputs.forEach((inp, index) => {
            inp.addEventListener("input", this.checkCompletion.bind(this));
            inp.addEventListener("blur", this.checkCompletion.bind(this));
            if (index == this.inputs.length - 1) inp.addEventListener("input", this.moveValueToLeft.bind(this));
            else inp.addEventListener("input", this.replaceNextSubvalue.bind(this));
        });
        this.inputsLength = this.inputs.map(input => {
            const maxlength = input.getAttribute("maxlength");
            input.removeAttribute("maxlength");
            return { input, maxlength }
        });
    }
    setValue(event) {
        const targInput = event.target;

        let value = "";
        this.inputs.forEach(inp => value += inp.value);
        this.input.value = value;
        const maxlength = this.inputsLength.find(inpData => inpData.input == targInput).maxlength;

        if (targInput.value.length >= maxlength) {
            const currentIndex = this.inputs.indexOf(targInput);
            const nextInput = this.inputs[currentIndex + 1];
            if (nextInput) nextInput.focus();
        }
    }
    moveValueToLeft(event) {
        if (!event.data) return;

        const lastInput = this.inputs[this.inputs.length - 1];
        const lastInputMaxlength = this.inputsLength[this.inputsLength.length - 1].maxlength;
        if (event.target !== lastInput) return;

        let totalMaxlength = 0;
        let totalValueLength = 0;
        this.inputsLength.forEach(inpData => {
            totalMaxlength += parseInt(inpData.maxlength || 0);
            const spaces = inpData.input.value.match(/\s/g);
            const spacesLength = spaces ? spaces.length : 0;
            totalValueLength += inpData.input.value.length - spacesLength;
        });

        if (
            totalValueLength < totalMaxlength
            && lastInput.value.length > lastInputMaxlength
        ) {
            let totalValue = "";
            this.inputs.forEach(inp => {
                const maxlength = this.inputsLength.find(inpData => inpData.input == inp).maxlength;
                let value = inp.value;
                if (value.length < maxlength) {
                    const dif = maxlength - value.length;
                    // for (let i = 0; i < dif; i++) value += " ";
                }
                totalValue += value;
            });
            const lastInputLength = lastInputMaxlength;
            const selectPosition = lastInput.selectionStart;
            lastInput.selectionEnd = selectPosition;

            let start = totalValue.split("").slice(0, totalValue.length - lastInputLength - 1);
            let end = lastInput.value.split("");
            let endStart = end.slice(0, selectPosition);
            let endEnd = end.slice(selectPosition);
            end = endStart.concat(endEnd);

            let newTotalValue = start.concat(end);
            const inputEvent = new Event("input");
            this.inputs.map(inp => inp)
                .reverse()
                .forEach(inp => {
                    const length = this.inputsLength.find(inpData => inpData.input == inp).maxlength;
                    inp.value = newTotalValue.slice(length * -1).join("");
                    newTotalValue.splice(newTotalValue.length - length);
                    inp.dispatchEvent(inputEvent);
                });
            lastInput.focus();
        }
        if (lastInput.value.length > lastInputMaxlength) {
            lastInput.selectionStart -= 1;
            lastInput.selectionEnd = lastInput.selectionStart + 1;
            lastInput.setRangeText("");
            lastInput.focus();
        }
    }
    replaceNextSubvalue(event) {
        if ((!event.data && event.inputType !== "insertFromPaste") || !event.isTrusted) return;

        const input = event ? event.target : null;
        if (input) {
            const maxlength = this.inputsLength.find(inpData => inpData.input == input).maxlength;
            if (event.inputType === "insertFromPaste") {
                const val = input.value.split("");
                val.splice(maxlength);
                input.value = val.join("");
                return;
            }
            if (input.value.length > maxlength) {
                const dataLength = event.data.length > maxlength ? maxlength : event.data.length;
                input.selectionEnd = input.selectionStart + dataLength;
                input.setRangeText("");
                if (input.selectionEnd < maxlength) input.focus();
            }
            if (input.value.length > maxlength) {
                input.selectionStart -= 1;
                input.selectionEnd = input.selectionStart + 1;
                input.setRangeText("");
            }
        }
    }
    checkCompletion() {
        this.validate();
        this.isCompleted = this.isValid ? true : false;
        super.setCompletedState();
    }
    validate() {
        const value = this.input.value;
        const numbers = value.split("").filter(str => parseInt(str) >= 0).join("");
        if (!parseInt(numbers)) return;
        const day = Number(numbers[0] + numbers[1]);
        const month = Number(numbers[2] + numbers[3]);
        const year = Number(numbers.slice(-4));
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;

        const invalidDay = day < 1 || day >= 32 || (day > 29 && month == "2") || (day > 30 && (month == "4" || month == "6" || month == "9" || month == "11"));
        const invalidMonth = month < 1 || month > 12;
        const invalidYear = age < 10 || age >= 100;

        if (invalidDay || invalidMonth) return this.isValid = false;

        this.isValid = true;
        return { day, month, year, currentYear, age, invalidYear };
    }
}
class TextInputBirthDate extends TextInputDate {
    // знаки зодиака
    zodiacSigngs;

    constructor(input) {
        super(input);
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
        this.uncompletedText = this.input.closest(".field").querySelector(".forms__fields-uncompleted");

        this.minYearSpan = this.uncompletedText.querySelector(".birthdate-min-year");
        this.maxYearSpan = this.uncompletedText.querySelector(".birthdate-max-year");
        this.minYear = this.currentYear - 99;
        this.maxYear = this.currentYear - 10;
        this.minYearSpan.textContent = this.minYear.toString();
        this.maxYearSpan.textContent = this.maxYear.toString();

        if (this.existed) this.checkCompletion();
    }
    validate() {
        const dateValues = super.validate();
        if (!dateValues) return;
        if (dateValues.invalidYear) return this.isValid = false;
        const zodiac = this.zodiacSigngs
            .filter(zs => zs.startMonth == dateValues.month || zs.startMonth + 1 == dateValues.month)
            .find((zs, index, array) => {
                const nextZs = array[index + 1];
                if (nextZs) {
                    if (dateValues.day >= zs.startDay && dateValues.day <= nextZs.endDay) return true;
                    if (dateValues.day < zs.startDay) return true;
                } else return true;
            });
        const zodiacValue = zodiac ? zodiac.name : "";


        const ageInput = document.querySelector("input[name='age']");
        const zodiacInput = document.querySelector("input[name='zodiac']");
        const changeEvent = new Event("change");
        if (ageInput) {
            ageInput.value = dateValues.age;
            ageInput.dispatchEvent(changeEvent);
        }
        if (zodiacInput) {
            // const zodiacIcon = createElement("span", `zodiac-icon icon-${zodiac.iconName || ""}`);
            const zodiacIconInner = `<svg><use xlink:href="#${zodiac.iconName}"></use></svg>`;
            const zodiacIcon = createElement("span", "zodiac-icon", zodiacIconInner);
            
            const oldZodiacIcons = zodiacInput.parentNode.querySelectorAll(".zodiac-icon");
            oldZodiacIcons.forEach(zi => zi ? zi.remove() : false);
            zodiacInput.before(zodiacIcon);
            zodiacInput.value = zodiacValue;
            zodiacInput.dispatchEvent(changeEvent);
        }
    }
}
// checkbox, radio
class SelectionInput extends Input {
    // блок с кнопками 
    selectionField;
    // массив самих кнопок (checkbox, radio)
    inputs;
    // выбранный input / массив выбранных input
    input;
    // вычисляется по первому найденному input ("checkbox"|"radio")
    type;
    // становится true, если выбрано хотя бы одно значение
    isCompleted;

    constructor(selectionField) {
        super(selectionField);
        this.selectionField = selectionField;
        this.inputs = Array.from(selectionField.querySelectorAll("input"));
        this.ariaLabel = this.inputs[0].getAttribute("aria-label");
        this.type = this.inputs[0].type;
        this.name = this.inputs[0].name;

        if (this.type === "checkbox") {
            this.inputs = Array.from(
                document.querySelectorAll(`[name=${this.name}]`)
            )
            this.inputs.forEach(inp => inp.addEventListener("change", () => {
                this.selectionField.dispatchEvent(new Event("change"));
            }));
        };

        this.selectionField.addEventListener("change", this.checkCompletion.bind(this));
    }
    checkCompletion() {
        this.setInput();
        const isCompleted = this.type == "checkbox"
            ? Boolean(this.input.length > 0)
            : Boolean(this.input);
        if (!isCompleted) this.selectionField.classList.add("__uncomplete");
        else this.selectionField.classList.remove("__uncomplete");
        this.isCompleted = isCompleted;
    }
    setInput() {
        if (this.type === "checkbox") this.input = this.inputs.filter(inp => inp.checked);
        if (this.type === "radio") this.input = this.inputs.find(inp => inp.checked) || this.inputs[0];
    }
}
class CheckEndWorkYear extends SelectionInput {
    constructor(cb) {
        super(cb);
        this.field = this.inputs[0].closest(".field");
        this.formsContainer = this.inputs[0].closest(".forms__container");
        this.unrequired = Array.from(this.field.querySelectorAll(".endyear-not-checkbox")).reverse();
        this.otherCheckboxes = Array.from(this.formsContainer.querySelectorAll(".endyear-checkbox"));
        this.checkCompletion();
        cb.addEventListener("change", this.onChange.bind(this));
    }
    checkCompletion() {
        this.isCompleted = true;
        return;
    }
    onChange() {
        if (this.inputs[0].checked) {
            this.unrequired = this.unrequired.map(el => {
                if (el) {
                    el.remove();
                    return el.cloneNode(true);
                }
            });
            this.formsContainer.querySelectorAll(".endyear-checkbox")
                .forEach(checkbox => {
                    if (this.inputs[0].closest(".checkbox") !== checkbox)
                        checkbox.style.display = "none";
                });
        } else {
            this.unrequired.forEach(el => {
                if (el && !el.closest("body")) this.inputs[0].parentNode.after(el);
                this.formsContainer.querySelectorAll(".endyear-checkbox")
                    .forEach(checkbox => checkbox.style.removeProperty("display"));
            });
        }
    }
}
// select (построен на radio)
class Select extends SelectionInput {
    selectionField;
    inputs;
    isShown;

    constructor(selectionField) {
        super(selectionField);
        this.selectionField = selectionField;
        this.value = selectionField.querySelector(".select__value");
        this.inputs = Array.from(selectionField.querySelectorAll("input[type='radio']"));
        this.isShown = this.selectionField.classList.contains("__shown");
        this.toggle = this.toggle.bind(this);
        this.closeByDocument = this.closeByDocument.bind(this);

        this.setValues();
        this.initOptions();
        this.selectionField.addEventListener("click", this.toggle);
        document.addEventListener("click", this.closeByDocument);
    }
    closeByDocument(event) {
        if (event.target !== this.selectionField && event.target !== this.value) {
            if (this.isShown) this.hide();
        }
    }
    setValues() {
        this.inputs.forEach(input => {
            const parent = input.parentNode;
            const value = input.value;
            if (!parent.textContent.includes(value)) parent.insertAdjacentHTML("beforeend", value);
        });
    }
    initOptions() {
        this.inputs.forEach(input => {
            input.addEventListener("change", () => {
                this.value.textContent = input.value;
            });
        });
    }
    toggle() {
        if (this.selectionField.classList.contains("__shown")) this.hide();
        else this.show();
    }
    show() {
        this.isShown = true;
        this.selectionField.classList.add("__shown");
    }
    hide() {
        this.isShown = false;
        this.selectionField.classList.remove("__shown");
    }
    onDestroy() {
        this.selectionField.removeEventListener("click", this.toggle);
        document.removeEventListener("click", this.closeByDocument);
    }
}
class SelectChildren extends Select {
    constructor(selectionField) {
        super(selectionField);
        this.addButton = this.fieldGroup.querySelector(".add-field");
        if (this.addButton) this.addButton.style.display = "none";
        this.formsContainer = this.fieldGroup.closest(".forms__container");
        this.inputs.forEach(input => {
            input.addEventListener("change", () => this.onChange(input));
        });

        this.fieldGroup.addEventListener("change", () => this.checkCompletion());
        this.addButton.addEventListener("click", this.onBtnClick.bind(this));
    }
    onBtnClick(event) {
        event.preventDefault();
        const childrenInputs = this.formsContainer.querySelectorAll(".children-group");
        childrenInputs.forEach(inp => inp.addEventListener("change", this.checkCompletion.bind(this)));
    }
    onChange(input) {
        if (this.addButton) {
            if (input.value === "Есть") this.addButton.style.removeProperty("display");
            if (input.value === "Нет") {
                this.addButton.style.display = "none";
                const groups = Array.from(this.formsContainer.querySelectorAll(".children-group"));
                if (groups) groups.forEach(el => el.remove());
            }
        }
    }
    checkCompletion() {
        const checked = this.inputs.find(inp => inp.checked);
        if (checked && checked.value === "Есть") {
            const selects = Array.from(this.formsContainer.querySelectorAll(".children-group"));
            if (selects.length > 0) {
                let hasRequiredChecked = true;
                for (let sel of selects) {
                    if (!sel.querySelector("input:checked")) return hasRequiredChecked = false;
                }
                this.isCompleted = hasRequiredChecked;
                if (hasRequiredChecked) {
                    const uncompleteClass = this.selectionField.closest(".__uncomplete");
                    this.selectionField.classList.remove("__uncomplete");
                    if (uncompleteClass) uncompleteClass.classList.remove("__uncomplete");
                }
            }
            else this.isCompleted = false;
        } else super.checkCompletion();
    }
}
// ползунок
class Range {
    // все поле
    rangeBlock;
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
        this.rangeBlock = rangeBlock;
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
            this.rangeSubscales = Array.from(this.rangeBlock.querySelectorAll(".range__subscale"))
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
        this.rangeBlock.addEventListener("click", () => this.valueInput.focus());
        this.valueInput.addEventListener("focus", () => this.rangeBlock.classList.add("__focus"));
        this.valueInput.addEventListener("blur", () => this.rangeBlock.classList.remove("__focus"));
    }
}
// загрузка фото
class LoadImage {
    constructor(block) {
        this.imageBlock = block;
        this.input = block.querySelector("input[type='file']");
        this.loadButton = block.querySelector(".load-image__button");
        this.contentBlock = block.querySelector(".load-image__content");
        this.img = block.querySelector("#load-image__preview");
        this.cutSquare = block.querySelector(".cut-square");
        this.cutCircle = block.querySelector(".cut-circle");
        this.closeButton = block.querySelector(".load-image__close");
        this.format = block.querySelector("#load-image__format");
        this.size = block.querySelector("#load-image__size");
        this.resolution = block.querySelector("#load-image__resolution");
        this.info = block.querySelector(".load-image__info");

        this.format.addEventListener("change", this.onInputChange.bind(this));
        this.size.addEventListener("change", this.onInputChange.bind(this));
        this.resolution.addEventListener("change", this.onInputChange.bind(this));

        this.cutSquareParams = new CutImage(this.cutSquare, 85);
        this.cutCircleParams = new CutImage(this.cutCircle, 85, true);

        this.img.addEventListener("click", () => modal.createImageModal(this.img.src));

        this.info.classList.add("__removed");
        this.input.addEventListener("change", this.loadImage.bind(this));
        this.closeButton.addEventListener("click", this.remove.bind(this));

        this.hideContent();
    }
    onInputChange(event) {
        const input = event.target;
        const value = input.value;
        input.style.width = `${value.length / 1.5}em`;
    }
    loadImage() {
        const file = this.input.files[0];
        const reader = new FileReader();

        if (file) {
            reader.readAsDataURL(file);
            reader.onload = () => {
                const src = reader.result;
                this.img.src = src;
                const image = new Image();
                image.src = src;
                image.onload = () => {
                    this.setImgDataValues(file, image);
                    this.origSizes = { width: image.width, height: image.height };
                    this.checkCompletion();
                    this.showContent();
                    this.cutSquareParams.init(image);
                    this.cutCircleParams.init(image);
                }
            }
        }
    }
    hideContent() {
        this.contentBlock.classList.add("__removed");
        this.loadButton.classList.remove("__removed");
        this.info.classList.add("__removed");
    }
    showContent() {
        this.contentBlock.classList.remove("__removed");
        this.loadButton.classList.add("__removed");
        this.info.classList.remove("__removed");
    }
    remove() {
        this.input.value = "";
        this.hideContent();
        this.checkCompletion();
    }
    setImgDataValues(file, image) {
        const changeEvent = new Event("change");
        const splitName = file.name.split(".");
        this.format.value = splitName[splitName.length - 1];
        this.format.dispatchEvent(changeEvent);

        this.size.value = calcSize(file.size);
        this.size.dispatchEvent(changeEvent);

        this.resolution.value = image.naturalWidth.toString() + "x" + image.naturalHeight.toString();
        this.resolution.dispatchEvent(changeEvent);
    }
    checkCompletion() {
        if (this.input.files[0]) {
            this.isCompleted = true;
            this.imageBlock.classList.remove("__uncomplete");
        }
        else {
            this.isCompleted = false;
            this.imageBlock.classList.add("__uncomplete");
        }
    }
}
// обрезка фото
class CutImage {
    constructor(block, previewSize, isCircle = false) {
        this.block = block;
        // !при изменении this.previewSize менять размеры в стилях .load-image__circle, .load-image__square!
        this.isCircle = isCircle;
        this.previewSize = previewSize;
        this.img = block.querySelector(".load-image__small-img");
        this.scaleModalCoef = 5;
        this.cutButton = block.querySelector(".load-image__apply-edit");
        this.refreshButton = block.querySelector(".load-image__refresh-edit");
        this.downloadButton = block.querySelector(".load-image__download-edit");
        this.moveXButtonsBlock = block.querySelector(".load-image__move-x-buttons");
        this.moveYButtonsBlock = block.querySelector(".load-image__move-y-buttons");
        this.scaleButtonsBlock = block.querySelector(".load-image__scale-buttons");
        this.initDataTexts();

        this.img.ondragstart = () => false;
        this.img.addEventListener("pointerdown", (event) => {
            const onUp = (upEvent) => {
                if (upEvent.clientX === x || upEvent.clientY === y) this.createFullSize(true);
                this.img.removeEventListener("pointerup", onUp);
            }

            this.onPointerdown(event);
            const x = event.clientX;
            const y = event.clientY;
            this.img.addEventListener("pointerup", onUp);
        });

        this.cutButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.cut();
        });
        this.refreshButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.refresh();
        });
        this.downloadButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.downloadCut();
        });

        this.downloadButton.classList.add("__removed");

        if (this.scaleButtonsBlock && this.moveYButtonsBlock && this.moveXButtonsBlock)
            this.initControlsButtons();
    }
    initDataTexts(format = null, size = null, resolution = null) {
        this.datablock = this.block.querySelector(".load-image__small-data");

        if (this.datablock) {
            this.format = this.datablock.querySelector(".load-image__small-data-format");
            this.size = this.datablock.querySelector(".load-image__small-data-size");
            this.resolution = this.datablock.querySelector(".load-image__small-data-resolution");

            if (!format && !size && !resolution) this.toggleDetails("hide");
            else {
                this.toggleDetails("show");
                this.format.textContent = format;
                this.size.textContent = size;
                this.resolution.textContent = resolution;
            }
        }
    }
    toggleDetails(action = "hide") {
        if (this.datablock) {
            if (action === "hide") this.datablock.classList.add("__removed");
            if (action === "show") this.datablock.classList.remove("__removed");
        }
    }
    downloadCut() {
        download = download.bind(this);
        downloadByRadio = downloadByRadio.bind(this);

        const content = `
            <div class="radiobuttons">
                <label class="radiobuttons__item">
                    <input type="radio" name="modal-window_download-type" value="origin" class="radiobuttons__input">
                    <svg width="20" height="20" viewBox="0 0 23 23">
                        <circle cx="10" cy="10" r="9"></circle>
                        <path
                            d="M10,7 C8.34314575,7 7,8.34314575 7,10 C7,11.6568542 8.34314575,13 10,13 C11.6568542,13 13,11.6568542 13,10 C13,8.34314575 11.6568542,7 10,7 Z"
                            class="radiobuttons__item-inner"></path>
                        <path
                            d="M10,1 L10,1 L10,1 C14.9705627,1 19,5.02943725 19,10 L19,10 L19,10 C19,14.9705627 14.9705627,19 10,19 L10,19 L10,19 C5.02943725,19 1,14.9705627 1,10 L1,10 L1,10 C1,5.02943725 5.02943725,1 10,1 L10,1 Z"
                            class="radiobuttons__item-outer"></path>
                    </svg>
                    Сохранить оригинальный размер
                </label>
                <label class="radiobuttons__item">
                    <input type="radio" name="modal-window_download-type" value="cut" class="radiobuttons__input">
                    <svg width="20" height="20" viewBox="0 0 23 23">
                        <circle cx="10" cy="10" r="9"></circle>
                        <path
                            d="M10,7 C8.34314575,7 7,8.34314575 7,10 C7,11.6568542 8.34314575,13 10,13 C11.6568542,13 13,11.6568542 13,10 C13,8.34314575 11.6568542,7 10,7 Z"
                            class="radiobuttons__item-inner"></path>
                        <path
                            d="M10,1 L10,1 L10,1 C14.9705627,1 19,5.02943725 19,10 L19,10 L19,10 C19,14.9705627 14.9705627,19 10,19 L10,19 L10,19 C5.02943725,19 1,14.9705627 1,10 L1,10 L1,10 C1,5.02943725 5.02943725,1 10,1 L10,1 Z"
                            class="radiobuttons__item-outer"></path>
                    </svg>
                    Сохранить уменьшенный размер
                </label>
            </div>
        `;
        modal.createBasicModal(
            "Скачать изображение",
            content,
            { text: "Скачать", confirmCallback: downloadByRadio },
            { text: "Отмена" }
        );
        const modalBody = modal.getModalBody();
        modalBody.classList.add("modal__body--small");

        function downloadByRadio() {
            const buttons = Array.from(modalBody.querySelectorAll("input[name='modal-window_download-type']"));
            const checked = buttons.find(btn => btn.checked) || { value: "cut" };
            const fullSizeData = this.createFullSize();
            const origFullSizeData = { width: this.origSizes.width, height: this.origSizes.height };

            let origImg;
            if (checked.value === "origin" || checked.value === "both")
                origImg = createOrigImg.call(this);

            switch (checked.value) {
                case "origin": download(origImg, origFullSizeData);
                    break;
                case "cut": download(fullSizeData.src, fullSizeData);
                    break;
            }
        }

        function createOrigImg() {
            const canvas = createElement("canvas");
            canvas.width = this.origSizes.width;
            canvas.height = this.origSizes.height;
            canvas.style.cssText = "position: absolute; z-index: -999;";

            const ctx = canvas.getContext("2d");
            ctx.drawImage(this.origImg, 0, 0);

            return canvas.toDataURL("image/png");
        }
        function download(src, fullSizeData = this.createFullSize()) {
            let downloadsData = localStorage.getItem("vsevn_users_downloads");
            if (!downloadsData) {
                localStorage.setItem("vsevn_users_downloads", {});
                downloadsData = localStorage.getItem("vsevn_users_downloads");
            }
            const userFullName = getFullUserName();
            const downloadsNumber = downloadsData[userFullName] || 1;
            const name = `
                ${userFullName}_${fullSizeData.width}x${fullSizeData.height}_000000000${downloadsNumber}
            `.trim();

            const link = createElement("a");
            link.download = name;
            link.href = src;
            link.click();

            downloadsData[userFullName] = downloadsNumber + 1;
            localStorage.setItem("vsevn_users_downloads", downloadsData);
        }
        function getFullUserName() {
            const userName = document.querySelector("input[name='name']").value || "Имя";
            const userSurname = document.querySelector("input[name='surname']").value || "Фамилия";
            const userPatronymic = document.querySelector("input[name='patronymic']").value || "";

            if (userPatronymic) return `${userName}-${userSurname}-${userPatronymic}`;
            else return `${userName}-${userSurname}`;
        }
    }
    init(origImg) {
        this.origImg = origImg;
        this.origSizes = { width: origImg.width, height: origImg.height };
        this.img.src = origImg.src;
        this.setImg(origImg.width, origImg.height);
        this.cutButton.classList.add("__removed");
        this.refresh();
    }
    setImg(imageWidth, imageHeight) {
        const coef = imageWidth / imageHeight;
        if (imageWidth !== imageHeight) {
            let width = coef * this.previewSize;
            let height = this.previewSize;
            if (width < 85) {
                const scaleVal = this.previewSize / width;
                width = width * scaleVal;
                height = height * scaleVal;
            }
            if (height < 85) {
                const scaleVal = this.previewSize / height;
                width = width * scaleVal;
                height = height * scaleVal;
            }
            this.img.width = width;
            this.img.height = height;
        }
        else if (imageWidth === imageHeight) {
            this.img.width = this.img.height = this.previewSize;
        }

        this.origSizesScaled = { width: this.img.width, height: this.img.height };

        this.movedX = 0;
        this.movedY = 0;
        this.scaled = 1;
        this.setTransform();
    }
    setTransform() {
        this.cutButton.classList.remove("__removed");
        this.img.style.transform =
            `translate(${this.movedX || 0}px, ${this.movedY || 0}px)`;
        this.img.width = this.origSizesScaled.width * this.scaled;
        this.img.height = this.origSizesScaled.height * this.scaled;
    }
    cut() {
        this.cutButton.classList.add("__removed");
        this.scaleMin = this.scaled;
        this.lastCutWidth = this.img.width;
        this.lastCutHeight = this.img.height;
        this.fixatedX = Math.abs(this.movedX);
        this.fixatedY = Math.abs(this.movedY);
        this.downloadButton.classList.remove("__removed");

        const canvasData = this.createFullSize(false);
        const size = calcSize(canvasData.src.length);
        const resolution = `${canvasData.width}x${canvasData.height}`;
        this.initDataTexts(canvasData.format, size, resolution);
    }
    refresh() {
        this.scaleMin = 1;
        this.scaled = 1;
        this.movedY = 0;
        this.movedX = 0;
        this.setTransform();
        this.lastCutWidth = 0;
        this.lastCutHeight = 0;
        this.fixatedX = 100;
        this.fixatedY = 100;
        this.scaleModal = this.scaleModalCoef / this.scaled;
        this.downloadButton.classList.add("__removed");
        this.toggleDetails("hide");
    }
    initControlsButtons() {
        const moveXButtons = this.moveXButtonsBlock.querySelectorAll("[class*='move-x-']");
        const moveYButtons = this.moveYButtonsBlock.querySelectorAll("[class*='move-y-']");
        const scaleButtons = this.scaleButtonsBlock.querySelectorAll("[class*='scale-']");

        moveXButtons.forEach(btn => btn.addEventListener("click", this.moveX.bind(this)));
        moveYButtons.forEach(btn => btn.addEventListener("click", this.moveY.bind(this)));
        scaleButtons.forEach(btn => btn.addEventListener("click", this.scale.bind(this)));
    }
    moveX(event) {
        const btn = event.target;
        if (btn.classList.contains("move-x-right")) this.moveTo("X", "-", 5);
        if (btn.classList.contains("move-x-left")) this.moveTo("X", "+", 5);
    }
    moveY(event) {
        const btn = event.target;
        if (btn.classList.contains("move-y-bottom")) this.moveTo("Y", "-", 5);
        if (btn.classList.contains("move-y-top")) this.moveTo("Y", "+", 5);
    }
    scale(event) {
        const btn = event.target;
        if (!this.scaleMin) this.scaleMin = 1;

        if (btn.classList.contains("scale-minus")) {
            if (this.scaled - 0.1 >= this.scaleMin) this.scaled -= 0.1;
            else return;
            this.movedY = this.movedX = 0;
            this.fixatedX = 100;
            this.fixatedY = 100;
            this.lastCutWidth = 0;
            this.lastCutHeight = 0;
        }
        if (btn.classList.contains("scale-plus")) {
            if (this.scaled + 0.1 <= 5) this.scaled += 0.1;
        }
        this.scaleModal = this.scaleModalCoef / this.scaled;
        this.setTransform();
    }
    onPointerdown(event) {
        let xOld = event.clientX;
        let yOld = event.clientY;

        const onMove = (moveEvent) => {
            let x = moveEvent.clientX;
            let y = moveEvent.clientY;

            if (x > xOld) this.moveTo("X", "+");
            if (x < xOld) this.moveTo("X", "-");

            if (y > yOld) this.moveTo("Y", "+");
            if (y < yOld) this.moveTo("Y", "-");

            xOld = x;
            yOld = y;
        }
        const onUp = () => {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
        }

        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
    }
    moveTo(coord, sign, step = 1) {
        const imgCoords = getCoords(this.img);
        const wrapperCoords = getCoords(this.img.parentNode);
        let nextMoved = this[`moved${coord}`]; // this[movedX,movedY]

        const widthCoef = this.img.width - this.lastCutWidth;
        const heightCoef = this.img.height - this.lastCutHeight;

        switch (sign) {
            case "+": nextMoved += step;
                break;
            case "-": nextMoved -= step;
                break;
        }
        if (sign === "-") step = step * (-1);

        if (coord === "Y") {
            const isInWrapper =
                imgCoords.top + step <= wrapperCoords.top
                && imgCoords.bottom + step >= wrapperCoords.bottom;
            const isInCutBorders =
                nextMoved <= this.fixatedY + heightCoef
                && nextMoved >= this.fixatedY - heightCoef;
            if (isInWrapper && isInCutBorders) this[`moved${coord}`] = nextMoved;
        }
        if (coord === "X") {
            const isInWrapper =
                imgCoords.left + step <= wrapperCoords.left
                && imgCoords.right + step >= wrapperCoords.right;
            const isInCutBorders =
                nextMoved <= this.fixatedX + widthCoef
                && nextMoved >= this.fixatedX - widthCoef;
            if (isInWrapper && isInCutBorders) this[`moved${coord}`] = nextMoved;
        }

        this.setTransform();
    }
    createFullSize(doShow = false) {
        const imgCoords = getCoords(this.img);
        const imgWrapperCoords = getCoords(this.img.parentNode);

        // нарисовать все изображение
        const canvasOrig = createElement("canvas");
        canvasOrig.width = document.documentElement.clientWidth || window.innerWidth;
        canvasOrig.height = document.documentElement.clientHeight || window.innerHeight;
        canvasOrig.style.cssText = "position: absolute; z-index: -99; opacity: 0";
        document.body.append(canvasOrig);
        const ctxOrig = canvasOrig.getContext("2d");
        ctxOrig.drawImage(this.origImg, 0, 0, this.img.width * this.scaleModal, this.img.height * this.scaleModal);

        // из всего изображения найти только выделенный квадрат/круг
        const ctxSize = this.previewSize * this.scaleModal;
        const canvasCut = createElement("canvas");
        canvasCut.width = this.previewSize * this.scaleModal;
        canvasCut.height = this.previewSize * this.scaleModal;
        canvasCut.style.cssText = "position: absolute; z-index: -99; opacity: 0";
        document.body.append(canvasCut);
        const ctxCut = canvasCut.getContext("2d");
        const sx = (imgWrapperCoords.left - imgCoords.left) * this.scaleModal;
        const sy = (imgWrapperCoords.top - imgCoords.top) * this.scaleModal;
        if (this.isCircle) {
            const x = canvasCut.width / 2;
            const y = canvasCut.height / 2;
            const radius = Math.min(x, y);

            ctxCut.beginPath();
            ctxCut.arc(x, y, radius, 0, 2 * Math.PI);
            ctxCut.closePath();
            ctxCut.fill();
            ctxCut.globalCompositeOperation = "source-in";
            ctxCut.drawImage(canvasOrig, sx, sy, ctxSize, ctxSize, 0, 0, ctxSize, ctxSize);
        } else {
            ctxCut.drawImage(canvasOrig, sx, sy, ctxSize, ctxSize, 0, 0, ctxSize, ctxSize);
        }

        const src = canvasCut.toDataURL("image/png");
        if (doShow) modal.createImageModal(src);

        canvasOrig.remove();
        canvasCut.remove();
        return { src, width: canvasCut.width, height: canvasCut.height, format: "PNG" };
    }
}

// инициализация формы
class Form {
    constructor(form) {
        this.submit = this.submit.bind(this);

        this.form = form;
        this.formSelector = "." + this.form.className.split(" ")[0];
        this.submitButton = this.form.querySelector(".forms__submit");

        this.form.addEventListener("submit", this.submit);
        const observer = new MutationObserver(mutlist => {
            forms_doInit();
        });
        observer.observe(this.form, { childList: true });
    }
    submit(event) {
        const formElements = inputParams.filter(inpParam => {
            let isFormElement = false;
            if (inpParam.input && inpParam.input.closest)
                isFormElement = inpParam.input.closest(this.formSelector) === this.form;
            if (!isFormElement && inpParam.inputs) {
                inpParam.inputs.forEach(i => {
                    if (i && i.closest) isFormElement = i.closest(this.formSelector) === this.form;
                });
            }
            return isFormElement;
        });
        const invalids = [];
        formElements.forEach(inpParam => {
            inpParam.checkCompletion();
            if (!inpParam.isCompleted) invalids.push(inpParam);
        });
        if (invalids.length > 0) event.preventDefault();
        else {
            event.preventDefault();
            const hrefTo = this.form.dataset.formsHref;
            console.log(hrefTo);
            window.location.href = window.location.origin + "/profile/forms/send.html";
        }
    }
}
const form = new Form(document.querySelector(".forms"));

// инициализация полей 
let inputParams = [];
// инициализация групп полей
const groupsParams = [];

const forms_inputSelectors = [
    { selector: ".add-field", classInstance: AddFields },
    { selector: "[data-add-group-checkbox]", classInstance: AddFieldsCheckbox },
    { selector: ".field__input[type='text']:not([class*='field-init'])", classInstance: TextInput },
    { selector: ".field__input-multi:not([class*='field-init'])", classInstance: TextInputMulti },
    { selector: ".field__input-multi.field-init--date", classInstance: TextInputDate },
    { selector: ".field__input-multi.field-init--birthdate", classInstance: TextInputBirthDate },
    { selector: ".field-tags__input", classInstance: TextInputTags },
    { selector: ".text-select__input:not([class*='field-init'])", classInstance: TextSelect },
    { selector: ".field-init--workyear", classInstance: TextSelectWorkYear },
    { selector: ".field__selection", classInstance: SelectionInput },
    { selector: ".select:not([class*='field-init'])", classInstance: Select },
    { selector: ".field-init--select-children", classInstance: SelectChildren },
    { selector: ".checkbox:not([class*='field-init'])", classInstance: SelectionInput },
    { selector: ".field-init--check-end-workyear", classInstance: CheckEndWorkYear },
    { selector: ".load-image", classInstance: LoadImage },
    { selector: ".range-block", classInstance: Range }
];

function forms_doInit() {
    setTimeout(() => {
        inputParams = inputParams.filter(inpParam => {
            let keepInArray = false;
            forms_observingNodesKeys.forEach(key => {
                if (inpParam[key] && inpParam[key].closest && inpParam[key].closest("body"))
                    keepInArray = true;
            });

            return keepInArray;
        });

        // инициализация всех полей, объявленных в forms_inputSelectors
        forms_inputSelectors.forEach(data => {
            const elems = Array.from(document.querySelectorAll(data.selector));
            elems.forEach(elem => {
                const alreadyInitted = inputParams.find(inpParam => {
                    let isFindingElem = false;
                    forms_observingNodesKeys.forEach(key => {
                        if (inpParam[key] === elem) isFindingElem = true;
                    });
                    return isFindingElem;
                });
                if (alreadyInitted) return;

                inputParams.push(new data.classInstance(elem));
            });
        });

        // инициализация групп полей
        Array.from(document.querySelectorAll(".forms__fields-group"))
            .forEach(group => {
                const alreadyHasParam = groupsParams.find(par => {
                    if (par) return Object.values(par).includes(group);
                    return false;
                });
                if (!alreadyHasParam) groupsParams.push(new InputGroup(group, inputParams));
            });
    }, 0);
}
forms_doInit();

// отлавливать изменения документа
function observeDocumentBodyOnInputs() {
    const observer = new MutationObserver((mutlist) => {
        // isException - предотвращает создание бесконечного цикла вызова forms_DoInit()
        const isException = mutlist.find(mut => mut.target.classList.contains("text-select__options"));

        if (isException) return;
        setTimeout(() => forms_doInit(), 0);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
observeDocumentBodyOnInputs();