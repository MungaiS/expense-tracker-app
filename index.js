
document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const balance = document.getElementById("balance");
  const moneyPlus = document.getElementById("income");
  const moneyMinus = document.getElementById("expense");
  const list = document.getElementById("list");
  const form = document.getElementById("form");
  const text = document.getElementById("text");
  const amountInput = document.getElementById("amount");
  const convertToLocalCurrencyButton = document.getElementById("convertToLocalCurrency");
  const convertToUSDButton = document.getElementById("convertToUSD");
  const autoConvertButton = document.getElementById("autoConvert");

  // Retrieve transactions from local storage or initialize an empty array
  const localStorageTransactions = JSON.parse(localStorage.getItem("transactions"));
  const transactions = localStorageTransactions !== null ? localStorageTransactions : [];

  // Function to add a transaction to the DOM
  function addTransactionDOM(transaction) {
    const sign = transaction.amount > 0 ? "+" : "-";
    const icon = transaction.amount > 0 ? "up" : "down";

    const item = document.createElement("li");
    item.classList.add(transaction.amount > 0 ? "plus" : "minus");

    item.innerHTML = `<h4>${transaction.text}</h4><span>${sign}$${Math.abs(
      transaction.amount
    )}<i class="fa-solid fa-caret-${icon}"></i><i class="fa-solid fa-trash-can" data-id="${transaction.id}"></i></span>`;

    list.appendChild(item);
  }

  // Function to update the displayed values (balance, income, expense)
  function updateValue() {
    const amounts = transactions.map((item) => item.amount);
    const total = amounts.reduce((a, b) => a + b, 0).toFixed(2);
    const income = amounts.filter((item) => item > 0).reduce((a, b) => a + b, 0).toFixed(2);
    const expense = amounts.filter((item) => item < 0).reduce((a, b) => a + b, 0).toFixed(2);

    balance.innerHTML = `$${total}`;
    moneyPlus.innerHTML = `$${income} <i class="fa-solid fa-caret-up"></i>`;
    moneyMinus.innerHTML = `$${Math.abs(expense)} <i class="fa-solid fa-caret-down"></i>`;
  }

  // Generate a random transaction ID
  function randomId() {
    return Math.floor(Math.random() * 1000);
  }

  // Event listener for the form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (text.value.trim() === "" || amountInput.value.trim() === "") {
      alert("Please fill in both text and amount fields.");
    } else {
      const transaction = {
        id: randomId(),
        text: text.value,
        amount: parseInt(amountInput.value),
      };

      transactions.push(transaction);
      addTransactionDOM(transaction);
      updateValue();
      updateLocalStorage();

      text.value = "";
      amountInput.value = "";
    }
  });

  // Fetch exchange rates from Open Exchange Rates API
  async function fetchExchangeRates(targetCurrency) {
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/USD?apikey=YOUR_API_KEY`);
      const data = await response.json();
      const exchangeRate = data.rates[targetCurrency];
      return exchangeRate;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return null;
    }
  }

  // Function to convert currency
  async function convertCurrency(targetCurrency, amountInUSD) {
    const exchangeRate = await fetchExchangeRates(targetCurrency);

    if (exchangeRate !== null) {
      const convertedAmount = amountInUSD * exchangeRate;
      console.log(`Converted amount to ${targetCurrency}: ${convertedAmount}`);
      // Update your UI or perform further actions with the converted amount
    }
  }

  // Event listeners for currency conversion buttons
  convertToLocalCurrencyButton.addEventListener("click", async function () {
    const targetCurrency = 'KES'; // Replace with your desired currency code
    const amountInUSD = getAmountInput();

    if (amountInUSD !== null) {
      await convertCurrency(targetCurrency, amountInUSD);
    }
  });

  convertToUSDButton.addEventListener("click", async function () {
    const defaultCurrency = 'USD';
    const amountInUSD = getAmountInput();

    if (amountInUSD !== null) {
      await convertCurrency(defaultCurrency, amountInUSD);
    }
  });

  autoConvertButton.addEventListener("click", async function () {
    // Use Geolocation API to get user's coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async function (position) {
        const { latitude, longitude } = position.coords;

        // Use reverse geocoding to get user's location details
        const locationResponse = await fetch(`https://geocode.xyz/${latitude},${longitude}?json=1`);
        const locationData = await locationResponse.json();

        // Extract local currency code from location details
        const localCurrencyCode = locationData.currency.code;
        const amountInUSD = getAmountInput();

        if (amountInUSD !== null) {
          await convertCurrency(localCurrencyCode, amountInUSD);
        }
      }, function (error) {
        console.error('Error getting user location:', error.message);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  });

  // Event listener for the transaction removal (delete) icon
  list.addEventListener("click", function (e) {
    if (e.target.classList.contains("fa-trash-can")) {
      const transactionId = parseInt(e.target.getAttribute("data-id"));
      removeItem(transactionId);
    }
  });

  // Event listener for the "Enter" key press in the text input
  text.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      amountInput.focus();
    }
  });

  // Event listener for the "Enter" key press in the amount input
  amountInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });

  // Function to remove a transaction by ID
  function removeItem(id) {
    transactions = transactions.filter((transaction) => transaction.id !== id);
    init();
  }

  // Function to update local storage with the current transactions
  function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  // Function to get the numeric amount from the input and perform validation
  function getAmountInput() {
    const amountInUSD = parseFloat(amountInput.value);

    if (isNaN(amountInUSD)) {
      alert("Please enter a valid numeric amount.");
      return null;
    }

    return amountInUSD;
  }

  // Initialization function to render existing transactions and update values
  function init() {
    list.innerHTML = "";
    transactions.forEach(addTransactionDOM);
    updateValue();
  }

  // Initial rendering of transactions on page load
  init();
});
