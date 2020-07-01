(function (document, appMain) {
  const fiscalYear = document.querySelector('table[data-fiscal-year]').getAttribute('data-fiscal-year');

  // rates
  const rates = appMain.rates[fiscalYear];
  const multipliers = appMain.multipliers;
  const rateTableRows = [];

  multipliers.forEach(m => {
    const size = m[1];
    const waterMultiplier = m[2];
    const sewerMultiplier = m[3];
    const waterBase = (rates.wBase * waterMultiplier).toFixed(2);
    const waterConsumption = rates.wCon.toFixed(2);
    const waterLoan = (rates.wLoan * waterMultiplier).toFixed(2);
    const sewerBase = (rates.sBase * sewerMultiplier).toFixed(2);
    const sewerConsumption = rates.sCon.toFixed(2);
    const sewerLoan = (rates.sLoan * sewerMultiplier).toFixed(2);
    rateTableRows.push(
      `<tr><td>${size}</td><td>${waterMultiplier}</td><td>$${waterBase}</td><td>$${waterLoan}</td><td>$${waterConsumption}/1000</td><td>${sewerMultiplier}</td><td>$${sewerBase}</td><td>$${sewerLoan}</td><td>$${sewerConsumption}/1000</td></tr>`
    );
  });

  document.querySelector('tbody[data-rates]').innerHTML = rateTableRows.join('');
}(this.document, this.appMain));
