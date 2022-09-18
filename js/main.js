class Message {
  constructor(icon, name, created, cathegory, content, dates, status = "active") {
    this._icon = icon;
    this._name = name;
    this._created = created;
    this._cathegory = cathegory;
    this._content = content;
    this._dates = dates;
    this._status = status;  // active or archived

    refreshStatistics("add", cathegory);
  }

  set icon(icon) { this._icon = icon; }
  get icon() { return this._icon; }

  set name(name) { this._name = name; }
  get name() { return this._name; }

  set cathegory(cathegory) { 
    changeCathegory(this._cathegory, cathegory, this._status);
    //refreshStatistics("update", cathegory);
    this._cathegory = cathegory; 
  }
  get cathegory() { return this._cathegory; }

  set content(content) { this._content = content; }
  get content() { return this._content; }

  set dates(dates) { this._dates = dates; }
  get dates() { return this._dates; }
}

class Category {
  constructor(icon, name) {
    this.icon = icon;
    this.name = name;
  }
}

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

const activeMessages = new Map();
const archiveMessages = new Map();

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

const categories = new Map();
categories.set("task", new Category("../images/task.png", "Task"));
categories.set("randth", new Category("../images/random_thought.png", "Random Thought"));
categories.set("idea", new Category("../images/idea.png", "Idea"));
categories.set("quote", new Category("../images/quote.png", "Quote"));


const frmInputs = new Map();
inputsToMap(frmInputs)

frmInputs.forEach(item => {
  item.addEventListener('blur', event => {
    if (event.currentTarget.value === "") {
      setInputError(event.currentTarget);
    } else {
      unsetInputError(event.currentTarget);
    }
  });
});

const selCategory = frmInputs.get("note-category");
selCategory.insertAdjacentHTML("beforeend", ` <option value="empty">-- Select category --</option>`);
categories.forEach((category, key) => {
  selCategory.insertAdjacentHTML("beforeend", ` <option value="${key}">${category.name}</option>`);
});

const addRecordToMap = record => {

};

const addRecordToTable = record => {
  const row = `
    <tr>
      <td><img class="tbl-icon" src="${categories.get(record.categoryKey).icon}" alt="Category"/></td>
      <td>${record.name}</td>
      <td class="text-center">${record.created.toLocaleDateString()}</td>
      <td>${record.category}</td>
      <td>${record.content}</td>
      <td class="text-center">${record.dates}</td>
      <td class="text-center"><img class="tbl-icon" src="../images/edit.png" alt="Edit"/></td>
      <td class="text-center"><img class="tbl-icon" src="../images/archive.png" alt="Archive"/></td>
      <td class="text-center"><img class="tbl-icon" src="../images/delete.png" alt="Delete"/></td>
    </tr>`;
  console.log(categories.get(record.category));
  //console.log(record.category_name);
  document.querySelector("#active-records tbody").insertAdjacentHTML("afterbegin", row);
};

const addNoteRecord = record => {
  addRecordToMap(record);
  addRecordToTable(record);
};

document.querySelector("#frm-note").addEventListener("submit", event => {
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
});
/*
All form fields must be filled in!
*/