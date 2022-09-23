class Message {
  #uuid;
  #name;
  #created;
  #category;
  #content;
  #status;
  constructor(name, category, content, uuid = crypto.randomUUID()) {
    this.#uuid = uuid;
    this.#name = name;
    this.#created = new Date();
    this.#category = category;
    this.#content = content;
    this.#status = "active";  // active or archived
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
    /*  Need realise */
  }

  set status(status) {
    this.#status = status; 
  }
  get status() { return this.#status; }

  get rowHTMLTable() {
    return `
      <tr>
        <td><img class="tbl-icon" src="${this.category.icon}" alt="Category"/></td>
        <td>${this.name}</td>
        <td class="text-center">${record.created.toLocaleDateString()}</td>
        <td>${this.category.name}</td>
        <td>${this.content}</td>
        <td class="text-center">${this.dates}</td>
        <td class="text-center"><button value="${this.uuid}" name="note-edit"><img class="tbl-icon" src="../images/edit.png" alt="Edit"/></button></td>
        <td class="text-center"><button value="${this.uuid}" name="note-arch"><img class="tbl-icon" src="../images/archive.png" alt="Archive"/><button></td>
        <td class="text-center"><button value="${this.uuid}" name="note-delete"><img class="tbl-icon" src="../images/delete.png" alt="Delete"/><button></td>
      </tr>`;
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
  constructor(block, form, inpMessageName, inpMessageCategory, inpMessageContent, btnClose, errElement, categoriesMap) {
    this.#block = block;
    this.#form = form;
    this.#inpMessageName = inpMessageName;
    this.#inpMessageCategory = inpMessageCategory;
    this.#inpMessageContent = inpMessageContent;
    this.#btnClose = btnClose;
    this.#errElement = errElement;

    this.#fillCategories(categoriesMap);

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

  #fillCategories(categoriesMap) {
    this.#inpMessageCategory.insertAdjacentHTML("beforeend", ` <option value="empty">-- Select category --</option>`);
    categoriesMap.forEach((category, key) => {
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

  isValid() {
    let valid = true;
    if (!this.#checkName()) {
      valid = false;
      MessageHTMLForm.#setInputError(this.#inpMessageName)
    } else {
      MessageHTMLForm.#unsetInputError(this.#inpMessageName)
    }
  
    if (!this.#checkCategory()) {
      valid = false;
      MessageHTMLForm.#setInputError(this.#inpMessageCategory)
    } else {
      MessageHTMLForm.#unsetInputError(this.#inpMessageCategory)
    }

    if (!this.#checkContent()) {
      valid = false;
      MessageHTMLForm.#setInputError(this.#inpMessageContent)
    } else {
      MessageHTMLForm.#unsetInputError(this.#inpMessageContent)
    }
    return valid; 
  }

  static #validateIsEmpty(element) {
    if (element.value === "") {
      MessageHTMLForm.#setInputError(element);
      return true;
    } 
    MessageHTMLForm.#unsetInputError(element);
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
        (noteForm.form.id.includes("create"))? statistics.createNote(noteObj) : statistics.editNote(noteObj);
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

  static #setInputError = (element) => {
    element.classList.remove("input-success");
    element.classList.add("input-error");
  }
  
  static #unsetInputError = (element) => {
    element.classList.add("input-success");
    element.classList.remove("input-error");
  }

  showForm() {
    MessageHTMLForm.activeForm = this;
    this.#block.classList.add(MessageHTMLForm.MODAL_ACTIVE_CLASS_NAME);
  }

  closeForm(event) {
    MessageHTMLForm.activeForm.block.classList.remove(MessageHTMLForm.MODAL_ACTIVE_CLASS_NAME);
    //MessageHTMLForm.activeForm.resetInputElementsStyles(MessageHTMLForm.activeForm);
    //MessageHTMLForm.resetInputElementsStyles();
    MessageHTMLForm.activeForm = null;
  }

  resetInputElementsStyles() {
    if (MessageHTMLForm !== null) {
      MessageHTMLForm.unsetInputError(MessageHTMLForm.activeForm.inpMessageName);
      MessageHTMLForm.unsetInputError(MessageHTMLForm.activeForm.inpMessageCategory);
      MessageHTMLForm.unsetInputError(MessageHTMLForm.activeForm.inpMessageContent);
    }
  }
}

//---------------------- 

const mapCategories = new Map();
mapCategories.set("task", new Category("../images/task.png", "Task"));
mapCategories.set("randth", new Category("../images/random_thought.png", "Random Thought"));
mapCategories.set("idea", new Category("../images/idea.png", "Idea"));
mapCategories.set("quote", new Category("../images/quote.png", "Quote"));

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
  },
  mapCategories,
  //closeCreateNoteModal
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
  },
  mapCategories,
  //closeEditNoteModal
));

//---------------------- 


const buttonCreateNote = document.querySelector("#btn-create-note"); 

const formCreateNote = document.querySelector("#form-modal-note-create"); 
const formEditNote = document.querySelector("#form-modal-note-edit"); 

const btnCloseFormCreate = document.querySelector("#btn-close-form-create"); 
const btnCloseFormEdit = document.querySelector("#btn-close-form-edit"); 

buttonCreateNote.addEventListener("click", event => {
//  let noteForm = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === "frm-note-create"));
  let noteForm = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === "frm-note-create"));
  noteForm[0].showForm();
//  console.log(globalThis.MessageHTMLForms[0]);
//  console.log(noteForm[0]);
//  noteForm[0].showForm();

  //openCreateNoteModal();
})
/*
btnCloseFormCreate.addEventListener("click", event => {
  //closeCreateNoteModal(event);

  formCreateNote.classList.remove(MODAL_ACTIVE_CLASS_NAME);
  let noteForm = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === event.currentTarget.id));
  console.log("=------------------------------");
  console.log(noteForm);
  //noteForm.resetInputElementsStyles();



})
*/

/*
const openCreateNoteModal = () => {
  formCreateNote.classList.add(MessageHTMLForm.MODAL_ACTIVE_CLASS_NAME);
};

const openEditNoteModal = () => {
  formEditNote.classList.add(MessageHTMLForm.MODAL_ACTIVE_CLASS_NAME);
};

*/

/*
const closeCreateNoteModal = (event) => {
  formCreateNote.classList.remove(MODAL_ACTIVE_CLASS_NAME);
  let noteForm = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === event.currentTarget.id));
  console.log(noteForm);
  //formCreateNote.resetInputElementsStyles();
}

//formEditNote.addEventListener("click", event => {
//  openEditNoteModal();
//})

btnCloseFormEdit.addEventListener("click", event => {
  closeEditNoteModal();
})


const closeEditNoteModal = () => {
  formEditNote.classList.remove(MODAL_ACTIVE_CLASS_NAME);
  formEditNote.resetInputElementsStyles();
}
*/







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
    //console.log(this.notesMap);
    //this.active++;  
    //this.refresh(note);
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
/*
document.querySelector("#frm-note-create").addEventListener("submit", event => {
  event.preventDefault();
  let inputsIsFull = true;
  for (const input of frmInputs.entries()) {
    if ((input[1].value === "") || (input[1].value === "empty")) inputsIsFull = false;
  }
  if (inputsIsFull)
    addNoteRecord({
      name: frmInputs.get("note-name").value,
      created: new Date(),
      //category_name: frmInputs.get("note-category").id,
      categoryKey: frmInputs.get("note-category").value,
      category: frmInputs.get("note-category").options[frmInputs.get("note-category").selectedIndex].text,
      content: frmInputs.get("note-content").value,
      dates: frmInputs.get("note-dates").value
    });
  event.currentTarget.reset();
});*/
