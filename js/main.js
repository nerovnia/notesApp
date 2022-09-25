class Message {
  #uuid;
  #name;
  #created;
  #category;
  #content;
  #status;
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
    mapCategories.set("task", new Category("./images/task.png", "Task"));
    mapCategories.set("randth", new Category("./images/random_thought.png", "Random Thought"));
    mapCategories.set("idea", new Category("./images/idea.png", "Idea"));
    mapCategories.set("quote", new Category("./images/quote.png", "Quote"));
    return mapCategories;
  }

  get uuid() { return this.#uuid; }

  set name(name) { this.#name = name; }
  get name() { return this.#name; }

  get created() { return this.#created; }

  set category(category) { 
    //this.#changeCathegory(this.#cathegory, cathegory, this.#status);
    //refreshStatistics("update", cathegory);
    this.#category = category; 
  }
  get category() { return this.#category; }

  get icon() { return this.category.icon; }

  set content(content) { this.#content = content; }
  get content() { return this.#content; }

  get dates() { 
    //const re = /\d{1,2}\/d{1,2}\/d{2,4}/g;
    const re = /(0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2])[^\w\d\r\n:](\d{4}|\d{2})/g;
    return this.content.match(re)?.join();
   //   Need realise 
  }

  set status(status) {
    this.#status = status; 
  }
  get status() { return this.#status; }

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
        <td class="text-center"><button value="${this.uuid}" name="note-arch"><img class="tbl-icon" src="./images/archive.png" alt="Archive"/><button></td>
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
      const rowButtons = row.getElementsByTagName("button");
      for(let i=0; i<rowButtons.length; i++) {
        let button = rowButtons[i];
      //(row.getElementsByTagName("button")).forEach(button => {
      //(row.getElementsByTagName("button")).forEach(button => {
        switch(button.name) {
          case 'note-edit':
            button.addEventListener("click", (event) => {
              //console.dir();
            });
            break;
          case 'note-arch':
            button.addEventListener("click", (event) => {

            });
            break;  
          case 'note-delete':
            button.addEventListener("click", (event) => {
              globalThis.messagesTable.deleteMessage(event.currentTarget.parentElement.parentElement.id);
              event.currentTarget.parentElement.parentElement.remove();
            });
            break;
        }
      };
      //console.dir(row);
      //console.dir(document.querySelector(`#${MessagesTable.activeGrid.id} tr#${message.uuid}`));
      //this.showRow(null, mess);
    }
  }

  modifyMessage(mess) {
    if(mess) {
      if (this.#notes.has(mess.uuid)) {
        const message = this.#notes.get(mess.uuid);
        message.name = mess.name;
        message.category = mess.category;
        message.content = mess.content;
        this.showRow(old_mess, this.#notes.get(mess.uuid));
      }
    }
  }

  deleteMessage(uuid) {
    if (this.#notes.has(uuid)) {
      this.#notes.delete(uuid);
      console.dir(this.#notes);
    }
  }

  showRow(old_mess, new_mess) {
    //if((old_mess.uuid !== new_mess.uuid)&&(new_mess !== null))
    MessagesTable.activeGrid.insertAdjacentHTML("afterbegin", row);
  }
}

class Category {
  #icon;
  #name;
  constructor(icon, name) {
    this.#icon = icon;
    this.#name = name;
  }

  get icon() { return this.#icon; }

  get name() { return this.#name; }
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

    this.#form.addEventListener('submit', this.addSubmitEventListener);
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

  addSubmitEventListener(event) {
    event.preventDefault();
    let noteForms = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === event.currentTarget.id));
    if (!noteForms.isEmpty) {
      let noteForm = noteForms[0];
      if (noteForm.isValid()) {
        noteForm.hideError();
        let noteObj = { 
          name: noteForm.inpMessageName.value, 
          category: noteForm.inpMessageCategory.options[noteForm.inpMessageCategory.selectedIndex].value, 
          content: noteForm.inpMessageContent.value 
        };
        (noteForm.form.id.includes("create"))? globalThis.messagesTable.addMessage(noteObj) : globalThis.messagesTable.modifyMessage(noteObj);
        //(noteForm.form.id.includes("create"))? statistics.createNote(noteObj) : statistics.editNote(noteObj);
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

  showForm() {
    MessageHTMLForm.activeForm = this;
    this.#block.classList.add(MessageHTMLForm.MODAL_ACTIVE_CLASS_NAME);
  }

  closeForm(event) {
    MessageHTMLForm.activeForm.block.classList.remove(MessageHTMLForm.MODAL_ACTIVE_CLASS_NAME);
    MessageHTMLForm.unsetInputError(MessageHTMLForm.activeForm.inpMessageName);
    MessageHTMLForm.unsetInputError(MessageHTMLForm.activeForm.inpMessageCategory);
    MessageHTMLForm.unsetInputError(MessageHTMLForm.activeForm.inpMessageContent);
    MessageHTMLForm.activeForm.resetCategory();
    MessageHTMLForm.activeForm.hideError();
    MessageHTMLForm.activeForm = null;
  }

}

//---------------------- 

MessagesTable.activeGrid = document.querySelector("table#active-records tbody");
MessagesTable.archiveGrid = document.querySelector("table#archive-records tbody");
globalThis.messagesTable = new MessagesTable();

const statistics = {
  catTask: {
    active: 0,
    archived: 0
  },
  catRandomThoughts: {
    active: 0,
    archived: 0
  },
  catIdea: {
    active: 0,
    archived: 0
  },
  catQuote: {
    active: 0,
    archived: 0
  },
  notesMap: new Map(),

  createNote(note_data) {
    let mess = new Message(
      note_data.name, 
      note_data.category, 
      note_data.content
      );
    this.notesMap.set(mess.uuid, mess);
    switch(mess.category) {
      case 'task':
        this.catTask.active++;
        break;
      case 'randth':
        this.catRandomThoughts.active++;
        break;
      case 'idea':
        this.catIdea.active++;
        break;
      case 'quote':
        this.catQuote.active++;
        break;
    }
    console.log(note_data);
  },

  editNote(note_data) {
    console.log(note_data)
    /* Need realise */
    //throw error;
  },

  deleteNote(uuid) {
    if (!this.notesMap.has(uuid)) {
      return;
    }
    let mess = this.notesMap.get(uuid);
    switch(mess.category) {
      case 'task':
        (mess.status === 'active') ? this.catTask.active--: this.catTask.archived--;
        break;
      case 'randth':
        (mess.status === 'active') ? this.catRandomThoughts.active--: this.catRandomThoughts.archived--;
        break;
      case 'idea':
        (mess.status === 'active') ? this.catIdea.active--: this.catIdea.archived--;
        break;
      case 'quote':
        (mess.status === 'active') ? this.catQuote.active--: this.catQuote.archived--;
        break;
    };
    this.notesMap.delete(uuid);
  },

  archiveNote(uuid) {
    if (!this.notesMap.has(uuid)) {
      return;
    }
    let mess = this.notesMap.get(uuid);
    if (mess.status === 'active') {
      switch(mess.category) {
        case 'task':
          this.catTask.active--; 
          this.catTask.archived++;
          break;
        case 'randth':
          this.catRandomThoughts.active--; 
          this.catRandomThoughts.archived++;
          break;
        case 'idea':
          this.catIdea.active--; 
          this.catIdea.archived++;
          break;
        case 'quote':
          this.catQuote.active--; 
          this.catQuote.archived++;
          break;
      };
    } 
  },

  activateNote(uuid) {
    if (!this.notesMap.has(uuid)) {
      return;
    }
    let mess = this.notesMap.get(uuid);
    if (mess.status === 'archived') {
      switch(mess.category) {
        case 'task':
          this.catTask.active++; 
          this.catTask.archived--;
          break;
        case 'randth':
          this.catRandomThoughts.active++; 
          this.catRandomThoughts.archived--;
          break;
        case 'idea':
          this.catIdea.active++; 
          this.catIdea.archived--;
          break;
        case 'quote':
          this.catQuote.active++; 
          this.catQuote.archived--;
          break;
      };
    } 
  },
/*
  refresh(note) {
     //Need realise 
    throw error;
  }
*/  
}




/*
globalThis.grids = {
  active: document.querySelector("table#active-records tbody"),
  statistic: document.querySelector("table#statistic tbody"),
  archiv: document.querySelector("table#archive-records tbody"),
}
*/


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

//---------------------- 


const buttonCreateNote = document.querySelector("#btn-create-note"); 

const formCreateNote = document.querySelector("#form-modal-note-create"); 
const formEditNote = document.querySelector("#form-modal-note-edit"); 

const btnCloseFormCreate = document.querySelector("#btn-close-form-create"); 
const btnCloseFormEdit = document.querySelector("#btn-close-form-edit"); 

buttonCreateNote.addEventListener("click", event => {
  let noteForm = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === "frm-note-create"));
  noteForm[0].showForm();
})


/*
const addRecordToTable = record => {
  const row = `
    <tr>
      <td><img class="tbl-icon" src="${categories.get(record.categoryKey).icon}" alt="Category"/></td>
      <td>${record.name}</td>
      <td class="text-center">${record.created.toLocaleDateString()}</td>
      <td>${record.category}</td>
      <td>${record.content}</td>
      <td class="text-center">${record.dates}</td>
      <td class="text-center"><button><img class="tbl-icon" src="../images/edit.png" alt="Edit"/></button></td>
      <td class="text-center"><button><img class="tbl-icon" src="../images/archive.png" alt="Archive"/><button></td>
      <td class="text-center"><button><img class="tbl-icon" src="../images/delete.png" alt="Delete"/><button></td>
    </tr>`;
  console.log(categories.get(record.category));
  //console.log(record.category_name);
  document.querySelector("#active-records tbody").insertAdjacentHTML("afterbegin", row);
};
*/

