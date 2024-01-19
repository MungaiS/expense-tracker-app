const balance = document.getElementById("balance")
const moneyPlus = document.getElementById("income")
const moneyMinus = document.getElementById("expense")
const list = document.getElementById("list")
const form = document.getElementById("form")
const text = document.getElementById("text")
const amount = document.getElementById("amount")

let transactions = [];

function addTransactionDOM(transaction) {
  // Get sign
  const sign = transaction.amount > 0 ? "+" : "-";

  const icon = transaction.amount > 0 ? "up" : "down";

  const item = document.createElement("li");

  item.classList.add(transaction.amount > 0 ? "plus" : "minus");

  item.innerHTML = `<h4>${transaction.text}</h4> <span>${sign}$${Math.abs(transaction.amount)}<i class="fa-solid fa-caret-${icon}"></i>
  <i class="fa-solid fa-trash-can" onclick="removeItem(${transaction.id})"></i></span>`;

  list.appendChild(item);
}

function updateValue(){
  const amount = transactions.map(item => item.amount)

  const total = amount
  .reduce((a, b) => (a += b), 0)
  .toFixed(2);

  const income = amount
  .filter(item => item > 0)
  .reduce ((a, b) => (a += b), 0)
  .toFixed(2);

  const expense = amount
  .filter(item => item < 0)
  .reduce ((a, b) => (a += b), 0)
  .toFixed(2);

  balance.innerHTML = `$${total}`;

  moneyPlus.innerHTML = `$${income} <i class="fas fa-caret-up"></i>`;

  moneyMinus.innerHTML = `$${Math.abs(expense).toFixed(2)} <i class="fas fa-caret-down"></i>`;
}

function randomId() {
  return Math.floor((Math.random() * 1000))
}

form.addEventListener("submit", (e) =>{
  e.preventDefault()

  if (text.ariaValueMax.trim() === '' || amount.value.trim() === '') {
    alert("Please fill your data first");
  } else {
    const transaction = {
      id:randomId(), 
      text:text.value, 
      amount:parseInt(amount.value)
    };
    transactions.push(transaction);

    addTransactionDOM(transaction);

    updateValue();

    text.value = "";
    amount.value = "";

  }
});

function removeItem(id) {
  transactions = transactions.filter(transaction => transaction.id !== id)

  init()
}

// init 

function init(){
  list.innerHTML = ''

  transactions.forEach(addTransactionDOM);
  updateValue();
}
init();