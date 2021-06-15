function _clearErrorState() {
  document.querySelector(".warningText").textContent = "";
  document.querySelector(".fa").textContent = " Calculate";
  document.querySelector(".selectedStock").value = "";
  document.querySelector(".stockPrice").value = "";
  document.querySelector(".numberStocks").value = "";
  document.querySelector(".selectedStock").classList.remove("errorState");
  document.querySelector(".stockPrice").classList.remove("errorState");
  document.querySelector(".numberStocks").classList.remove("errorState");

  document.querySelector("#errorMessage1").style.display = "none";
  document.querySelector("#errorMessage2").style.display = "none";
  document.querySelector("#errorMessage3").style.display = "none";
}

function _setErrorState() {
  document.querySelector(".warningText").textContent =
    "Error occured. Click refresh.";
  document.querySelector(".fa").textContent = " Refresh";
  if (document.querySelector(".selectedStock").value === "") {
    document.querySelector(".selectedStock").classList.add("errorState");
    document.querySelector("#errorMessage1").style.display = "contents";
  }
  if (document.querySelector(".stockPrice").value === "") {
    document.querySelector(".stockPrice").classList.add("errorState");
    document.querySelector("#errorMessage2").style.display = "contents";
  }
  if (document.querySelector(".numberStocks").value === "") {
    document.querySelector(".numberStocks").classList.add("errorState");
    document.querySelector("#errorMessage3").style.display = "contents";
  }
}

function calculateStockPrice() {
  _clearErrorState();
  var budget = parseFloat(document.querySelector(".budget").value);
  var selectedStock = document.querySelector(".selectedStock");
  var stockPrice = document.querySelector(".stockPrice");
  var numberStocks = document.querySelector(".numberStocks");
  var expectedProfit = parseFloat(document.querySelector(".profit").value);
  var requiredPoints = document.querySelector(".requiredPoints");
  chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
    var tabTitle = tab[0].title.split(" ");
    var stockValue = parseFloat(tabTitle[1]) / 5;
    selectedStock.value = tabTitle[0];
    stockPrice.value = "₹ " + stockValue + " (5x intraday leverage)";

    if (isNaN(budget) !== true && budget !== undefined && budget > 0) {
      numberStocks.value = Math.floor(budget / stockValue);
    } else {
      numberStocks.value = "";
    }
    if (
      isNaN(expectedProfit) !== true &&
      expectedProfit !== undefined &&
      expectedProfit >= 0 &&
      parseInt(numberStocks.value) > 0
    ) {
      var requiredPointsValue = expectedProfit / parseInt(numberStocks.value);
      requiredPoints.value = Math.round(requiredPointsValue * 100) / 100;
    } else {
      requiredPoints.value = "";
    }
  });
}

function _orderExecute(orderType) {
  var stockName = document.querySelector(".selectedStock").value;
  var quantity = parseInt(document.querySelector(".numberStocks").value);
  if (
    isNaN(quantity) === true ||
    quantity === undefined ||
    stockName === undefined ||
    stockName.length < 1
  ) {
    _setErrorState();
    return;
  }
  if (Object.keys(specialStockNames).indexOf(stockName) !== -1) {
    stockName = specialStockNames[stockName];
  }
  var orderPayload = [
    {
      variety: "regular",
      tradingsymbol: stockName,
      exchange: "NSE",
      transaction_type: orderType,
      order_type: "MARKET",
      product: "MIS",
      quantity: parseInt(quantity),
      readonly: false,
    },
  ];

  document.getElementById("basket").value = JSON.stringify(orderPayload);
  document.getElementById("basket-form").submit();
}

function triggerBuy() {
  _orderExecute("BUY");
}

function triggerSell() {
  _orderExecute("SELL");
}

// Handler for refresh button
var calculateButton = document.querySelector(".calculateStockPrice");
calculateButton.addEventListener("click", calculateStockPrice);

// Handler for buy button
var buyButton = document.querySelector(".buyButton");
buyButton.addEventListener("click", triggerBuy);

// Handler for buy button
var sellButton = document.querySelector(".sellButton");
sellButton.addEventListener("click", triggerSell);

// Import mappings of stock names that need transforming in zerodha
var request = new XMLHttpRequest();
request.open("GET", "./mappings.json", false);
request.send(null);
var specialStockNames = JSON.parse(request.responseText);

// Enable plugin if current page -> TradingView
chrome.tabs.query({ currentWindow: true, active: true }, function (tab) {
  var heroSection = document.querySelector(".heroSection");
  var contentSection = document.querySelector(".contentSection");
  var currentTabUrl = tab[0].url;
  if (currentTabUrl.indexOf("https://www.tradingview.com/chart") !== -1) {
    heroSection.style.display = "none";
    contentSection.style.display = "";
  } else {
    heroSection.style.display = "";
    contentSection.style.display = "none";
  }
});
