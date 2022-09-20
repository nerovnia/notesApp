class Message {
  constructor(name, created, cathegory, content, dates) {
    this.#uuid = crypto.randomUUID();
    this.#name = name;
    this.#created = created;
    this.#cathegory = cathegory;
    this.#content = content;
    this.#dates = dates;
  }

  get uuid() { return this.#uuid; }

  set name(name) { this.#name = name; }
  get name() { return this.#name; }

  set cathegory(cathegory) { 
    changeCathegory(this.#cathegory, cathegory, this.#status);
    //refreshStatistics("update", cathegory);
    this.#cathegory = cathegory; 
  }
  get cathegory() { return this.#cathegory; }

  set content(content) { this.#content = content; }
  get content() { return this.#content; }

  set dates(dates) { this.#dates = dates; }
  get dates() { return this.#dates; }
}

class MessageVisual extends Message {
  constructor(name, created, cathegory, content, dates) {
    super(name, created, cathegory, content, dates);
    this.#status = "active";  // active or archived
  }

  get rowHTMLTable() {
    return `
      <tr>
        <td><img class="tbl-icon" src="${this.#cathegory.icon}" alt="Category"/></td>
        <td>${this.#name}</td>
        <td class="text-center">${record.created.toLocaleDateString()}</td>
        <td>${this.#category.name}</td>
        <td>${this.#content}</td>
        <td class="text-center">${this.#dates}</td>
        <td class="text-center"><button value="${this.#uuid}" name="note-edit"><img class="tbl-icon" src="../images/edit.png" alt="Edit"/></button></td>
        <td class="text-center"><button value="${this.#uuid}" name="note-arch"><img class="tbl-icon" src="../images/archive.png" alt="Archive"/><button></td>
        <td class="text-center"><button value="${this.#uuid}" name="note-delete"><img class="tbl-icon" src="../images/delete.png" alt="Delete"/><button></td>
      </tr>`;
  }

  set status(status) {
    this.#status = status; 
  }

  get status() { return this.#status; }

  get icon() { return this.#cathegory.icon; }

}

class Category {
  constructor(icon, name) {
    this.#icon = icon;
    this.#name = name;
  }

  get icon() { return this.#icon; }

  get name() { return this.#name; }
}

class MessageHTMLForm {
  /*
  #form;
  #inpMessageName;
  #inpMessageCategory;
  #inpMessageContent;
  #errElement;*/
  constructor(form, inpMessageName, inpMessageCategory, inpMessageContent, inpMessageDates, errElement, mapCategories) {
    this.#form = form;
    this.#inpMessageName = inpMessageName;
    this.#inpMessageCategory = inpMessageCategory;
    this.#inpMessageContent = inpMessageContent;
    this.#errElement = errElement;

    this.#form.addEventListener('submit', this.addSubmitEventListener);
    this.#inpMessageName.addEventListener('blur', this.addBlurEventListener);
    this.#inpMessageCategory.addEventListener('blur', this.addBlurEventListener);
    this.#inpMessageContent.addEventListener('blur', this.addBlurEventListener);
  }

  get form() { return this.#form; }
  get inpMessageName() { return this.#inpMessageName; }
  get inpMessageCategory() { return this.#inpMessageCategory; }
  get inpMessageContent() { return this.#inpMessageContent; }
  
  get #allElements() { return [this.#inpMessageName, this.#inpMessageCategory, this.#inpMessageContent];}

  #checkName() {
    return this.#inpMessageName.value !== "";
  }

  #checkCategory() {
    return ((this.#inpCategory.options.length > 0)&&(this.#inpCategory.selectedIndex !== 0));
    //return this.#inpCategory.options[this.#inpCategory.selectedIndex].text !== "";
  }

  #checkContent() {
    return this.#inpMessageName.value !== "";
  }

  #printError(err) {
    this.#errElement.textContent = err;
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
    let messageForm = globalThis.MessageHTMLForms.filter(messageHTMLForm => (messageHTMLForm.form.id === event.currentTarget.id));
    if (!messageForm.isEmpty) {
      if (messageForm[0].isValid()) {
        alert('Data in form is valid!')
      }
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
  
}

const mapCategories = new Map();
mapCategories.set("task", new Category("../images/task.png", "Task"));
mapCategories.set("randth", new Category("../images/random_thought.png", "Random Thought"));
mapCategories.set("idea", new Category("../images/idea.png", "Idea"));
mapCategories.set("quote", new Category("../images/quote.png", "Quote"));

const selCategory = document.querySelector("#note-category__create");
selCategory.insertAdjacentHTML("beforeend", ` <option value="empty">-- Select category --</option>`);
mapCategories.forEach((category, key) => {
  console.log(category, key);
  selCategory.insertAdjacentHTML("beforeend", ` <option value="${key}">${category.name}</option>`);
});

//const frmCreateMessage = new MessageHTMLForm(
globalThis.MessageHTMLForms = [];
globalThis.MessageHTMLForms.push(new MessageHTMLForm(
  document.querySelector("#frm-note-create"), 
  document.querySelector("#note-name__create"), 
  document.querySelector("#note-category__create"), 
  document.querySelector("#note-content__create"), 
  document.querySelector("#note-dates__create"), 
  document.querySelector("#note-dates__create"), 
  document.querySelector("#note-err__create")
));

const statistics = {
  activeNotes: [],
  archivesNotes: [],

  createNote: function(note_data) {
    const note = new MessageVisual(note_data.name, note_data.created, note_data.cathegory, note_data.content, note_data.dates);
    this.activeNotes.push(note);
    this.refresh(note.cathegory, note.status);
  },

  deleteNote: function(uuid) {
    const node = "";
    //const cathegory = 
  },

  archiveNote: function(note) {

  },

  activateNote: function(note) {

  },

  refresh(cathegory, status) {
    
  }
}



/*
// action: add, remove, update
const refreshStatistics = (action, cathegory, changedField = "") => {
  switch (action) {
    case "add":
      break;
    case "remove":
      break;
    case "update":
      break;
  }
};
*/
//const activeMessages = new Map();
//const archiveMessages = new Map();


/*
const setInputError = (element) => {
  element.classList.remove("input-success");
  element.classList.add("input-error");
}

const unsetInputError = (element) => {
  element.classList.add("input-success");
  element.classList.remove("input-error");
}

const inputsToMap = (map) => {
  let inp = document.querySelector("#note-name");;
  map.set(inp.id, inp);
  inp = document.querySelector("#note-category");
  map.set(inp.id, inp);
  inp = document.querySelector("#note-content");
  map.set(inp.id, inp);
  inp = document.querySelector("#note-dates");
  map.set(inp.id, inp);
};
*/

/*

const frmInputs = new Map();
inputsToMap(frmInputs)

frmInputs.forEach(item => {
  //console.log(item);
  item.addEventListener('blur', event => {
    if (event.currentTarget.value === "") {
      setInputError(event.currentTarget);
    } else {
      unsetInputError(event.currentTarget);
    }
  });
});

*/
/*
const addRecordToMap = record => {

};
*/
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
const addNoteRecord = record => {
  addRecordToMap(record);
  addRecordToTable(record);
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




/*
document.querySelector("#frm-note-create").addEventListener("submit", event => {
  event.preventDefault();
  let inputsIsFull = true;
  for (const input of frmInputs.entries()) {
    if ((input[1].value === "") || (input[1].value === "empty")) inputsIsFull = false;
  }
  if (inputsIsFull)
    statistics.createNote({
      name: frmInputs.get("note-name").value,
      created: new Date(),
      categoryKey: frmInputs.get("note-category").value,
      category: frmInputs.get("note-category").options[frmInputs.get("note-category").selectedIndex].text,
      content: frmInputs.get("note-content").value,
      dates: frmInputs.get("note-dates").value
    });
  event.currentTarget.reset();
});
*/
/*
All form fields must be filled in!
*/