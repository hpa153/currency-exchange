// Fetch API data
const myHeaders = new Headers();
myHeaders.append("apikey", "4qPoxHo7Ts98HByicCoX4SXkudt5pSgh");

const requestOptions = {
  method: "GET",
  redirect: "follow",
  headers: myHeaders,
};

let data = {};

let labels = [];

// Get options for base currency selection
const curSelection = document.getElementById("base-currency");
let base = "AUD";

const renderBaseOptions = () => {
  for (let label of labels) {
    let curOption = document.createElement("option");
    curOption.innerText = label;
    if(label === base) {
      curOption.setAttribute("selected", "selected");
    }
  
    curSelection.appendChild(curOption);
  }
}

// Currencies to display in chart
let selectedCurrencies = ["USD", "EUR", "GBP"];

// Info dialog and text
const infoDialog = document.querySelector(".graph-dialog");
const infoText = document.querySelector(".graph-dialog--info");

// Display currency options for chart in sidebar
const sidebar = document.querySelector(".graph-sidebar-items");

const renderSidebarItems = () => {
  // Reset sidebar
  sidebar.innerHTML = "";
  for (let label of labels) {
    let newCur = document.createElement("div");
    newCur.classList.add("graph-sidebar--item");

    if (selectedCurrencies.includes(label)) {
      newCur.classList.add("graph-sidebar--item-active");
    }

    newCur.addEventListener("click", () => selectCurrency(label));

    newCur.innerText = label;

    sidebar.appendChild(newCur);
  }
};

// Select currency on click of currency item
const selectCurrency = (currency) => {
  if (selectedCurrencies.includes(currency)) {
    selectedCurrencies.splice(selectedCurrencies.indexOf(currency), 1);
  } else if (selectedCurrencies.length >= 5) {
    infoText.innerText =
      "You have reached the limit! Only 5 bars can be displayed!";
    showMenu();
    return;
  } else {
    selectedCurrencies.push(currency);
  }

  // Render sidebar items to display changes
  renderBars();
  renderSidebarItems();
};

// Display exchange rate based on provided currency
const displayExchangeRate = (currency) => {
  showMenu();
  infoText.innerText = `1 ${curSelection.value} = ${data["rates"][
    currency
  ].toFixed(2)} ${currency}`;
};

// Render label for a bar
const renderBarLabel = (bar, label) => {
  let barLabel = document.createElement("span");
  barLabel.innerText = label;
  barLabel.classList.add("graph--col-label");
  barLabel.addEventListener("click", () => displayExchangeRate(label));

  bar.appendChild(barLabel);
};

// Get highest exchange rate to calculate bar height
const getMaxRate = () => {
  let rates = [];

  for(let value of selectedCurrencies) {
    rates.push(data["rates"][value]);
  }

  return Math.max(...rates);
};

// Render bars based on selected currencies
const barChart = document.querySelector(".graph-chart");

const renderBars = () => {
  // Reset chart
  barChart.innerHTML = "";

  for (let currency of selectedCurrencies) {
    let bar = document.createElement("div");
    bar.classList.add("graph-col");
    const maxRate = getMaxRate();
    const expectedHeight = data["rates"][currency] / maxRate * 90;
    bar.style.height = `${expectedHeight < 10 ? 10 : expectedHeight}%`;

    renderBarLabel(bar, currency);
    barChart.appendChild(bar);
  }
};

// Close or open dialog on button press
const closeMenu = () => {
  infoDialog.classList.add("graph--hidden");

  // Reset text on close
  infoText.innerText = "";
};

const showMenu = () => {
  infoDialog.classList.remove("graph--hidden");
};

// Retrieve data from API based on selected base
const getNewBase = (currency) => {
  base = currency;
  
  fetch(
    `https://api.apilayer.com/exchangerates_data/latest?base=${base}&symbols=AUD,BGN,BRL,CAD,CHF,CNY,DKK,EUR,GBP,GGP,HKD,HRK,ILS,INR,JPY,MXN,MYR,NOK,NZD,PHP,PLN,RON,RUB,SEK,SGD,THB,TRY,USD,VND,ZAR`,
    requestOptions
  )
    .then((response) => {
      return response.json();
    })
    .then((currencyData) => {
      data = currencyData;
      labels = Object.keys(data["rates"]);
      renderBars();
      renderSidebarItems();
      renderBaseOptions();
    }
  )
  .catch((error) => console.log("error", error));
};

// Call retrieve function on page load
getNewBase("AUD");
renderSidebarItems();
