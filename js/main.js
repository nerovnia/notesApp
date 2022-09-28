class Broker {
  constructor() {
    this.subscribers = {};
  }

  on(event, func) {
    if (!this.subscribers[event])
      this.subscribers[event] = [];
    this.subscribers[event].push(func);
  }

  messageEvents(event, data) {
    if (this.subscribers[event])
      this.subscribers[event].forEach(l => l(data));
  }
}

let broker = new Broker();

class Message {
  #uuid;
  #name;
  #created;
  #category;
  #content;
  #status;
  #pointToRow;
  constructor(name, category, content, uuid = 't' + crypto.randomUUID()) {
    this.#uuid = uuid;
    this.#name = name;
    this.#created = new Date();
    this.#category = Message.mapCategories.get(category);
    this.#content = content;
    this.#status = "active";  // active or archived
  }

  static get mapCategories() { 
    const mapCategories = new Map();
    mapCategories.set("task", new Category("./images/task.png", "Task", "task"));
    mapCategories.set("randth", new Category("./images/random_thought.png", "Random Thought", "randth"));
    mapCategories.set("idea", new Category("./images/idea.png", "Idea", "idea"));
    mapCategories.set("quote", new Category("./images/quote.png", "Quote", "quote"));
    return mapCategories;
  }

  get uuid() { return this.#uuid; }
  set name(name) { this.#name = name; }
  get name() { return this.#name; }
  get created() { return this.#created; }
  set category(category) { 
    this.#category = category; 
  }
  get category() { return this.#category; }
  get icon() { return this.category.icon; }
  set content(content) { this.#content = content; }
  get content() { return this.#content; }
  get dates() { 
    const re = /(0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2])[^\w\d\r\n:](\d{4}|\d{2})/g;
    return this.content.match(re)?.join();
  }

  set status(status) {
    this.#status = status; 
  }
  get status() { return this.#status; }

  set pointToRow(row) { this.#pointToRow = row; }
  get pointToRow() { return this.#pointToRow; }

  changeMessage(message) {
    let cells = this.#pointToRow.querySelectorAll("td");
    cells[0].querySelector("img").setAttribute("src", message.category.icon)
    cells[1].textContent = message.name;
    cells[3].textContent = message.category.name;
    cells[4].textContent = message.content;
  } 

  get changeStatus() {
    let status = this.#status;
    return {
      status: status[0].toUpperCase(),
      picture: (status === 'active') ? 'archive.png' : 'active.png',
    }
  }
  
  get rowHTMLTable() {
    return `
      <tr id="${this.uuid}">
        <td><img class="tbl-icon" src="${this.#category.icon}" alt="Category"/></td>
        <td>${this.name}</td>
        <td class="text-center">${this.created.toLocaleDateString()}</td>
        <td>${this.category.name}</td>
        <td>${this.content}</td>
        <td class="text-center">${(this.dates) ?? ""}</td>
        <td class="text-center"><button value="${this.uuid}" name="note-edit"><img class="tbl-icon" src="./images/edit.png" alt="Edit"/></button></td>
        <td class="text-center"><button value="${this.uuid}" name="note-arch"><img class="tbl-icon" src="./images/${this.changeStatus.picture}" alt="${this.changeStatus.status}"/><button></td>
        <td class="text-center"><button value="${this.uuid}" name="note-delete"><img class="tbl-icon" src="./images/delete.png" alt="Delete"/><button></td>
      </tr>`;
  }  
  
}

class MessagesTable {
  #notes;
  constructor() {
    //this.#activeGrid = activeGrid;
    //this.#archiveGrid = archiveGrid;
    this.#notes = new Map();
  }
  
  addMessage(mess) {
    if(mess) {
      const message = new Message(mess.name, mess.category, mess.content);
      this.#notes.set(message.uuid, message);
      MessagesTable.activeGrid.insertAdjacentHTML("afterbegin", this.#notes.get(message.uuid).rowHTMLTable);
      const row = document.querySelector(`#${message.uuid}`);
      message.pointToRow = row;
      MessagesTable.setButtonsEventListeners(row);
      broker.messageEvents('mess-new',{category: mess.category})
    }
  }
  modifyMessage(mess) {
    if(mess) {
      if (this.#notes.has(mess.uuid)) {
        const m_message = this.#notes.get(mess.uuid);
        let old_category = m_message.category;
        m_message.name = mess.name;
        m_message.category = Message.mapCategories.get(mess.category);//mess.category;
        m_message.content = mess.content;
        m_message.changeMessage( {
          name: mess.name,
          category: Message.mapCategories.get(mess.category),
          content: mess.content
        });
        broker.messageEvents('mess-modify',{old_category: old_category, new_category: m_message.category, status: m_message.status});
      }
    }
  }

  getMessage(uuid) {
    return this.#notes.get(uuid);
  } 

  static setButtonsEventListeners(row) {
    const rowButtons = row.getElementsByTagName("button");
    for(let i=0; i<rowButtons.length; i++) {
      let button = rowButtons[i];
      switch(button.name) {
        case 'note-edit':
          button.addEventListener("click", MessageHTMLForm.addShowEventListener);
          break;
        case 'note-arch':
          button.addEventListener("click", (event) => {
            globalThis.messagesTable.archMessage(event.currentTarget.parentElement.parentElement.id);
          });
          break;  
        case 'note-delete':
          button.addEventListener("click", (event) => {
            globalThis.messagesTable.deleteMessage(event.currentTarget.parentElement.parentElement.id);
          });
          break;
      }
    }
  }  

  archMessage(uuid) {
    if (this.#notes.has(uuid)) {
      let note = this.#notes.get(uuid);
      if (note.status === 'active') {
        note.status = 'archived';
        note.pointToRow.remove();
        MessagesTable.archiveGrid.insertAdjacentHTML("afterbegin", note.rowHTMLTable);
        let row = document.querySelector(`#${note.uuid}`);
        note.pointToRow = row;
        MessagesTable.setButtonsEventListeners(row);
      } else {
        note.status = 'active';
        note.pointToRow.remove();
        MessagesTable.activeGrid.insertAdjacentHTML("afterbegin", note.rowHTMLTable);
        let row = document.querySelector(`#${note.uuid}`);
        note.pointToRow = row;
        MessagesTable.setButtonsEventListeners(row);
      }
      broker.messageEvents('mess-status-change',{category: note.category, new_status: note.status})
    }
  }

  deleteMessage(uuid) {
    if (this.#notes.has(uuid)) {
      let category = this.#notes.get(uuid).category.item;
      let status = this.#notes.get(uuid).status;
      this.#notes.get(uuid).pointToRow.remove();
      this.#notes.delete(uuid);
      broker.messageEvents('mess-delete',{category: category, status: status})
    }
  }
}

class Category {
  #icon;
  #name;
  #item;
  constructor(icon, name, item) {
    this.#icon = icon;
    this.#name = name;
    this.#item = item;
  }

  get icon() { return this.#icon; }

  get name() { return this.#name; }

  get item() { return this.#item; }
}

class MessageHTMLForm {
  #block;
  #form;
  #inpMessageName;
  #inpMessageCategory;
  #inpMessageContent;
  #btnClose;
  #errElement;
  static activeForm = null;
  static mess_uuid = null;
  static MODAL_ACTIVE_CLASS_NAME = 'modal-active';
  constructor(block, form, inpMessageName, inpMessageCategory, inpMessageContent, btnClose, errElement) {
    this.#block = block;
    this.#form = form;
    this.#inpMessageName = inpMessageName;
    this.#inpMessageCategory = inpMessageCategory;
    this.#inpMessageContent = inpMessageContent;
    this.#btnClose = btnClose;
    this.#errElement = errElement;

    this.#fillCategories();

    this.#form.addEventListener('submit', MessageHTMLForm.addSubmitEventListener);
    this.#inpMessageName.addEventListener('blur', this.addBlurEventListener);
    this.#inpMessageCategory.addEventListener('blur', this.addBlurEventListener);
    this.#inpMessageContent.addEventListener('blur', this.addBlurEventListener);
    this.#btnClose.addEventListener('click', this.closeForm);
  }

  get block() { return this.#block; }
  get form() { return this.#form; }
  get btnClose() { return this.#btnClose; }
  get inpMessageName() { return this.#inpMessageName; }
  get inpMessageCategory() { return this.#inpMessageCategory; }
  get inpMessageContent() { return this.#inpMessageContent; }

  #fillCategories() {
    this.#inpMessageCategory.insertAdjacentHTML("beforeend", ` <option value="empty">-- Select category --</option>`);
    Message.mapCategories.forEach((category, key) => {
      this.#inpMessageCategory.insertAdjacentHTML("beforeend", ` <option value="${key}">${category.name}</option>`);
    });
  }

  #checkName() {
    return this.#inpMessageName.value !== "";
  }

  #checkCategory() {
    return ((this.#inpMessageCategory.options.length > 0)&&(this.#inpMessageCategory.options[this.#inpMessageCategory.selectedIndex].value !== "empty"));
  }

  #checkContent() {
    return this.#inpMessageContent.value !== "";
  }

  showError(err) {
    this.#errElement.block.classList.remove("hide");
    this.#errElement.label.textContent = err;
  }

  hideError() {
    this.#errElement.block.classList.add("hide");
    this.#errElement.label.textContent = "";
  }

  resetCategory() {
    this.#inpMessageCategory.selectedIndex = 0;
  }

  isValid() {
    let valid = true;
    if (!this.#checkName()) {
      valid = false;
      MessageHTMLForm.setInputError(this.#inpMessageName)
    } else {
      MessageHTMLForm.unsetInputError(this.#inpMessageName)
    }
  
    if (!this.#checkCategory()) {
      valid = false;
      MessageHTMLForm.setInputError(this.#inpMessageCategory)
    } else {
      MessageHTMLForm.unsetInputError(this.#inpMessageCategory)
    }

    if (!this.#checkContent()) {
      valid = false;
      MessageHTMLForm.setInputError(this.#inpMessageContent)
    } else {
      MessageHTMLForm.unsetInputError(this.#inpMessageContent)
    }
    return valid; 
  }

  static #validateIsEmpty(element) {
    if (element.value === "") {
      MessageHTMLForm.setInputError(element);
      return true;
    } 
    MessageHTMLForm.unsetInputError(element);
    return false;
  }

  static addShowEventListener(event) {
    if(event.currentTarget.id === "btn-create-note") {
      let noteForm = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === "frm-note-create"));
      noteForm[0].showForm(event);
    } else {
      let noteForm = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === "frm-note-edit"));
      noteForm[0].showForm(event);
    }
  }

  static addSubmitEventListener(event) {
    event.preventDefault();
    let noteForms = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === event.currentTarget.id));
    if (!noteForms.isEmpty) {
      let noteForm = noteForms[0];
      if (noteForm.isValid()) {
        noteForm.hideError();
        let noteObj = { 
          uuid: MessageHTMLForm.mess_uuid,
          name: noteForm.inpMessageName.value, 
          category: noteForm.inpMessageCategory.options[noteForm.inpMessageCategory.selectedIndex].value, 
          content: noteForm.inpMessageContent.value 
        };
        noteForm.form.removeAttribute("value");
        (noteForm.form.id.includes("create"))? globalThis.messagesTable.addMessage(noteObj) : globalThis.messagesTable.modifyMessage(noteObj);
        event.currentTarget.reset();
        noteForm.closeForm();
        return;
      }
      noteForm.showError("All form's fields must be filled in!");
    }
  }

  addBlurEventListener(event) {
    MessageHTMLForm.#validateIsEmpty(event.currentTarget)
  }

  static setInputError = (element) => {
    element.classList.remove("input-success");
    element.classList.add("input-error");
  }
  
  static unsetInputError = (element) => {
    element.classList.add("input-success");
    element.classList.remove("input-error");
  }

  showForm(event) {
    MessageHTMLForm.activeForm = this;
    if(event.currentTarget.getAttribute("name") === "note-edit") {
      const edit_message = globalThis.messagesTable.getMessage(event.currentTarget.getAttribute("value"));
      MessageHTMLForm.mess_uuid =  event.currentTarget.getAttribute("value");
      this.inpMessageName.value = edit_message.name;
      for (let i=0; i < this.inpMessageCategory.options.length; i++) {
        if(this.inpMessageCategory.options[i].value === edit_message.category.item) {
          this.inpMessageCategory.selectedIndex = i;
          break;
        }
      }
      this.inpMessageContent.value = edit_message.content;
    }
    this.#block.classList.add(MessageHTMLForm.MODAL_ACTIVE_CLASS_NAME);
  }

  closeForm(event) {
    MessageHTMLForm.activeForm.block.classList.remove(MessageHTMLForm.MODAL_ACTIVE_CLASS_NAME);
    MessageHTMLForm.unsetInputError(MessageHTMLForm.activeForm.inpMessageName);
    MessageHTMLForm.unsetInputError(MessageHTMLForm.activeForm.inpMessageCategory);
    MessageHTMLForm.unsetInputError(MessageHTMLForm.activeForm.inpMessageContent);
    MessageHTMLForm.activeForm.resetCategory();
    MessageHTMLForm.activeForm.hideError();
    MessageHTMLForm.mess_uuid = null;
    MessageHTMLForm.activeForm = null;
  }
}

class CategoryForStatistics {
  constructor(name) {
    this._name = name;
    this._active = 0;
    this._archived = 0;
  }

  get name() { return this._name; }
  get active() { return this._active; }
  get archived() { return this._archived; }

  set active(active) { this._active = active; }
  set archived(archived) { this._archived = archived; }
}

class CategoryForStatisticsHTML extends CategoryForStatistics {
  #rowHTML;
  #startCellHTML;
  #endCellHTML;
  #categoryCellHTML;
  #activeCellHTML;
  #archivedCellHTML;
  constructor(name, htmlStatisticTable) { 
    super(name);
    this.#rowHTML = document.createElement('tr');
    this.#rowHTML.hidden = true;

    this.#startCellHTML = document.createElement('td');
    this.#endCellHTML = document.createElement('td');
    this.#categoryCellHTML = document.createElement('td');
    this.#activeCellHTML = document.createElement('td');
    this.#archivedCellHTML = document.createElement('td');
    
    htmlStatisticTable.insertAdjacentElement('beforeend', this.#rowHTML);

    this.#rowHTML.insertAdjacentElement('beforeend', this.#startCellHTML);
    this.#rowHTML.insertAdjacentElement('beforeend', this.#categoryCellHTML);
    this.#rowHTML.insertAdjacentElement('beforeend', this.#activeCellHTML);
    this.#rowHTML.insertAdjacentElement('beforeend', this.#archivedCellHTML);
    this.#rowHTML.insertAdjacentElement('beforeend', this.#endCellHTML);
    
    this.#startCellHTML.innerHTML = `<img class="tbl-icon" src="${Message.mapCategories.get(this.name).icon}" alt="Category" />`;

    this.#categoryCellHTML.classList.add("text-center");
    this.#activeCellHTML.classList.add("text-center");
    this.#archivedCellHTML.classList.add("text-center");

    this.#categoryCellHTML.innerText = Message.mapCategories.get(this.name).name;
    this.#activeCellHTML.innerText = this.active;
    this.#archivedCellHTML.innerText = this.archived;
  }

  set textActive(textActive) { this.#activeCellHTML.innerText = textActive; }
  set textArchived(textArchived) { this.#archivedCellHTML.innerText = textArchived; }

  set active(active) { 
    super.active = active;
    this.#activeCellHTML.innerText = super.active;
    this.#checkShowOrHideHTMLRow();
  }
  set archived(archived) { 
    super.archived = archived; 
    this.#archivedCellHTML.innerText = super.archived;
    this.#checkShowOrHideHTMLRow();
  }

  get active() { return super.active }
  get archived() { return super.archived }
  
  #show() {
    this.#rowHTML.hidden = false;
  }

  #hide() {
    this.#rowHTML.hidden = true;
  }

  #checkShowOrHideHTMLRow() {
    if ((this._active === 0) && (this._archived === 0)) {
      this.#hide();
    } else {
      this.#show();
    }
  }

}

class Statisics {
  #statisticHTMLTable;
  constructor(statisticHTMLTable) {
    this.#statisticHTMLTable = statisticHTMLTable;
    this.statisticCategories = new Map();
    Message.mapCategories.forEach((val,key) => {
      this.statisticCategories.set(key, new CategoryForStatisticsHTML(key, this.#statisticHTMLTable));
    })

    broker.on('mess-new', data => this.new(data));
    broker.on('mess-modify', data => this.modify(data));
    broker.on('mess-delete', data => this.delete(data));
    broker.on('mess-status-change', data => this.statusChange(data));
  }

  new(data) {
    this.statisticCategories.get(data.category).active+=1;
  }

  modify(data) {
    if (data.status === 'active') {
      this.statisticCategories.get(data.old_category.item).active--;
      this.statisticCategories.get(data.new_category.item).active++;
    } else {
      this.statisticCategories.get(data.old_category.item).archived--;
      this.statisticCategories.get(data.new_category.item).archived++;
    }
  }

  delete(data) {
    if (data.status === 'active') {
      this.statisticCategories.get(data.category).active--;
    } else {
      this.statisticCategories.get(data.category).archived--;
    }
  }

  statusChange(data) {
    if (data.new_status === 'active') {
      this.statisticCategories.get(data.category.item).active++;
      this.statisticCategories.get(data.category.item).archived--;
    } else {
      this.statisticCategories.get(data.category.item).active--;
      this.statisticCategories.get(data.category.item).archived++;
    }
  }
}

MessagesTable.activeGrid = document.querySelector("table#active-records tbody");
MessagesTable.archiveGrid = document.querySelector("table#archive-records tbody");
globalThis.messagesTable = new MessagesTable();
let statistica = new Statisics(document.querySelector("table#statistic tbody"));

globalThis.MessageHTMLForms = [];
globalThis.MessageHTMLForms.push(new MessageHTMLForm(
  document.querySelector("#form-modal-note-create"), 
  document.querySelector("#frm-note-create"), 
  document.querySelector("#note-name__create"), 
  document.querySelector("#note-category__create"), 
  document.querySelector("#note-content__create"),
  document.querySelector("#btn-close-form-create"),
  {
    block: document.querySelector("#modal-form-err-create"),
    label: document.querySelector("#modal-form-err__create")
  }
));

globalThis.MessageHTMLForms.push(new MessageHTMLForm(
  document.querySelector("#form-modal-note-edit"), 
  document.querySelector("#frm-note-edit"), 
  document.querySelector("#note-name__edit"), 
  document.querySelector("#note-category__edit"), 
  document.querySelector("#note-content__edit"),
  document.querySelector("#btn-close-form-edit"),
  {
    block: document.querySelector("#modal-form-err-edit"),
    label: document.querySelector("#modal-form-err__edit")
  }
));


const buttonCreateNote = document.querySelector("#btn-create-note"); 

const formCreateNote = document.querySelector("#form-modal-note-create"); 
const formEditNote = document.querySelector("#form-modal-note-edit"); 

const btnCloseFormCreate = document.querySelector("#btn-close-form-create"); 
const btnCloseFormEdit = document.querySelector("#btn-close-form-edit"); 

buttonCreateNote.addEventListener("click", MessageHTMLForm.addShowEventListener);

