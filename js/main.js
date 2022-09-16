class Message {
  constructor(t_icon, t_name, t_created, t_cathegory, t_content, t_dates) {
    this.t_icon = t_icon;
    this.t_name = t_name;
    this.t_created = t_created;
    this.t_cathegory = t_cathegory;
    this.t_content = t_content;
    this.t_dates = t_dates;
  }
}

class Category {
  constructor(icon, name) {
    this.icon = icon;
    this.name = name;
  }
}

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

const addNoteRecord = record => {

};


document.querySelector("#frm-note").addEventListener("submit", event => {
  event.preventDefault();
  let inputsIsFull = true;
  for (const input of frmInputs.entries()) {
    if ((input[1].value === "") || (input[1].value === "empty")) inputsIsFull = false; 
  }
  if(inputsIsFull)
    addNoteRecord({
      name: frmInputs.get("note-name").value,
      category: frmInputs.get("note-category").value,
      content: frmInputs.get("note-content").value,
      dates: frmInputs.get("note-dates").value
    });
});
/*
All form fields must be filled in!
*/