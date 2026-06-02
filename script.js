const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const dateInput = document.getElementById("date");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const editingIdInput = document.getElementById("editing-id");

const localStorageTransactions = JSON.parse(
  localStorage.getItem("transactions"),
);
let transactions =
  localStorage.getItem("transactions") !== null ? localStorageTransactions : [];

document.addEventListener("DOMContentLoaded", setDefaultDate);

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

function saveTransaction(e) {
  e.preventDefault();

  if (
    text.value.trim() === "" ||
    amount.value.trim() === "" ||
    dateInput.value === ""
  ) {
    alert(
      "Please completely fill name, amount, and corresponding date parameters.",
    );
    return;
  }

  const transactionText = text.value.trim();
  const lowerCaseText = transactionText.toLowerCase();
  
  // Get the absolute numerical value so the user's manual plus/minus sign doesn't break the logic
  let enteredAmount = Math.abs(+amount.value);

  // --- INCOME OR EXPENSE CHECK ---
  // If text includes 'salary' or 'pocket money', make it positive. Otherwise, turn it negative.
  if (lowerCaseText.includes("salary") || lowerCaseText.includes("pocket money")) {
    enteredAmount = enteredAmount; // Stays positive (Income)
  } else {
    enteredAmount = -enteredAmount; // Becomes negative (Expense/Deduction)
  }

  const currentEditingId = editingIdInput.value;

  if (currentEditingId !== "") {
    transactions = transactions.map((t) => {
      if (t.id === parseInt(currentEditingId)) {
        return {
          ...t,
          text: transactionText,
          amount: enteredAmount,
          date: formatDate(dateInput.value),
        };
      }
      return t;
    });
    clearEditState();
  } else {
    const transaction = {
      id: generateId(),
      text: transactionText,
      amount: enteredAmount,
      date: formatDate(dateInput.value),
    };
    transactions.push(transaction);
  }

  updateLocalStorage();
  init();
  resetFormInputs();
}

function formatDate(dateString) {
  if (!dateString) return "";
  if (dateString.includes("/")) return dateString;
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function parseDateToISO(displayDate) {
  const [day, month, year] = displayDate.split("/");
  return `${year}-${month}-${day}`;
}

function addTransactionToDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");

  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  item.innerHTML = `
        <div>
            <strong style="display: block;">${transaction.text}</strong>
            <small style="color: var(--text-muted); font-size: 0.75rem;">${transaction.date || ""}</small>
        </div>
        <span style="font-weight: 600; margin-right: 75px;">
            ${sign}Rs ${Math.abs(transaction.amount).toFixed(2)}
        </span>
        <div class="action-panel">
            <button class="action-btn edit" onclick="startEditTransaction(${transaction.id})">✏️</button>
            <button class="action-btn delete" onclick="removeTransaction(${transaction.id})">✕</button>
        </div>
    `;

  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);
  const expense = (
    amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1
  ).toFixed(2);

  balance.innerText =
    total < 0 ? `-Rs ${Math.abs(total).toFixed(2)}` : `Rs ${total}`;
  money_plus.innerText = `+Rs ${income}`;
  money_minus.innerText = `-Rs ${expense}`;
}

function startEditTransaction(id) {
  const target = transactions.find((t) => t.id === id);
  if (!target) return;

  formTitle.innerText = "Modify Transaction Entry";
  submitBtn.innerText = "Save Changes";
  cancelBtn.style.display = "block";
  editingIdInput.value = id;

  text.value = target.text;
  
  // Show the absolute value in the input field when editing so it is cleaner to read
  amount.value = Math.abs(target.amount);
  dateInput.value = parseDateToISO(target.date);

  text.focus();
}

function clearEditState() {
  formTitle.innerText = "Add new transaction";
  submitBtn.innerText = "Add transaction";
  cancelBtn.style.display = "none";
  editingIdInput.value = "";
  resetFormInputs();
}

function removeTransaction(id) {
  if (editingIdInput.value == id) {
    clearEditState();
  }

  transactions = transactions.filter((transaction) => transaction.id !== id);
  updateLocalStorage();
  init();
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function resetFormInputs() {
  text.value = "";
  amount.value = "";
  setDefaultDate();
}

function init() {
  list.innerHTML = "";
  transactions.forEach(addTransactionToDOM);
  updateValues();
}

function generateId() {
  return Math.floor(Math.random() * 100000000);
}

form.addEventListener("submit", saveTransaction);
cancelBtn.addEventListener("click", clearEditState);

init();
