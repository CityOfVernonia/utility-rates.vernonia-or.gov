/**
 * Calculate utility rates
 */
(function (document, appMain) {

  const initPopovers = () => {
    $('[data-toggle="popover"]').popover();
  };
  const jqueryCheck = () => {
    if (window.$) {
      initPopovers();
    } else {
      setTimeout(jqueryCheck, 100);
    }
  };
  jqueryCheck();


  const form = document.querySelector('form[data-rate-calculator]');

  form.addEventListener('submit', evt => {
    evt.preventDefault();

    const {
      W_PAYROLL,
      W_OM,
      W_PROJECTED,
      W_FACILITIES,
      W_OPERATING,
      W_LOAN,
      W_LOAN_PROJECTED,
      W_MULTIPLIERS,
      W_CONSUMPTION,
      W_SPLIT,
      S_PAYROLL,
      S_OM,
      S_PROJECTED,
      S_FACILITIES,
      S_OPERATING,
      S_LOAN,
      S_LOAN_PROJECTED,
      S_MULTIPLIERS,
      S_CONSUMPTION,
      S_SPLIT
    } = evt.target;


    const waterBudget = parseInt(W_PAYROLL.value) + parseInt(W_OM.value);
    const waterReserves = parseInt(W_OPERATING.value) + parseInt(W_FACILITIES.value);
    const waterProjected = parseInt(W_PROJECTED.value);

    const waterBudgetGross = waterBudget + waterReserves;
    const waterBudgetNet = waterBudgetGross - waterProjected;

    const waterBasePercent = parseInt(W_SPLIT.value) / 100;
    const waterConsumptionPercent = 1 - waterBasePercent;

    const waterBaseRequired = waterBudgetNet * waterBasePercent;
    const waterConsumptionRequired = waterBudgetNet * waterConsumptionPercent;

    const waterLoanRequired = parseInt(W_LOAN.value) - parseInt(W_LOAN_PROJECTED.value);

    const waterMultipliers = parseInt(W_MULTIPLIERS.value);
    const waterConsumptionRate = waterConsumptionRequired / parseInt(W_CONSUMPTION.value) * 1000;

    document.querySelector('*[data-water-calcs]').innerHTML = `
      <p><strong>Required water budget</strong> <span style="float:right;">$${waterBudgetNet.toLocaleString()}</span></p>
      <p><strong>Required water base</strong> <span style="float:right;">$${waterBaseRequired.toLocaleString()}</span></p>
      <p><strong>Required water consumption</strong> <span style="float:right;">$${waterConsumptionRequired.toLocaleString()}</span></p>
      <p><strong>Required water loan</strong> <span style="float:right;">$${waterLoanRequired.toLocaleString()}</span></p>
    `;

    document.querySelector('*[data-water-rates]').innerHTML = `
      <p><strong>Water base rate</strong> <span style="float:right;">${(waterBaseRequired / waterMultipliers).toLocaleString('en-us', { style:'currency', currency:'USD' })} per multiplier</span></p>
      <p><strong>Water consumption rate</strong> <span style="float:right;">${waterConsumptionRate.toLocaleString('en-us', { style:'currency', currency:'USD' })} per 1000 gal</span></p>
      <p><strong>Water loan rate</strong> <span style="float:right;">${(waterLoanRequired / waterMultipliers).toLocaleString('en-us', { style:'currency', currency:'USD' })} per multiplier</span></p>
    `;

    const sewerBudget = parseInt(S_PAYROLL.value) + parseInt(S_OM.value);
    const sewerReserves = parseInt(S_OPERATING.value) + parseInt(S_FACILITIES.value);
    const sewerProjected = parseInt(S_PROJECTED.value);

    const sewerBudgetGross = sewerBudget + sewerReserves;
    const sewerBudgetNet = sewerBudgetGross - sewerProjected;

    const sewerBasePercent = parseInt(S_SPLIT.value) / 100;
    const sewerConsumptionPercent = 1 - sewerBasePercent;

    const sewerBaseRequired = sewerBudgetNet * sewerBasePercent;
    const sewerConsumptionRequired = sewerBudgetNet * sewerConsumptionPercent;

    const sewerLoanRequired = parseInt(S_LOAN.value) - parseInt(S_LOAN_PROJECTED.value);

    const sewerMultipliers = parseInt(S_MULTIPLIERS.value);
    const sewerConsumptionRate = sewerConsumptionRequired / parseInt(S_CONSUMPTION.value) * 1000;

    document.querySelector('*[data-sewer-calcs]').innerHTML = `
      <p><strong>Required sewer budget</strong> <span style="float:right;">$${sewerBudgetNet.toLocaleString()}</span></p>
      <p><strong>Required sewer base</strong> <span style="float:right;">$${sewerBaseRequired.toLocaleString()}</span></p>
      <p><strong>Required sewer consumption</strong> <span style="float:right;">$${sewerConsumptionRequired.toLocaleString()}</span></p>
      <p><strong>Required sewer loan</strong> <span style="float:right;">$${sewerLoanRequired.toLocaleString()}</span></p>
    `;

    document.querySelector('*[data-sewer-rates]').innerHTML = `
      <p><strong>Sewer base rate</strong> <span style="float:right;">${(sewerBaseRequired / sewerMultipliers).toLocaleString('en-us', { style:'currency', currency:'USD' })} per multiplier</span></p>
      <p><strong>Sewer consumption rate</strong> <span style="float:right;">${sewerConsumptionRate.toLocaleString('en-us', { style:'currency', currency:'USD' })} per 1000 gal</span></p>
      <p><strong>Sewer loan rate</strong> <span style="float:right;">${(sewerLoanRequired / sewerMultipliers).toLocaleString('en-us', { style:'currency', currency:'USD' })} per multiplier</span></p>
    `;


  });

  // split numbers text
  const updateSplitText = (type, evt) => {
    const value = parseInt(evt.target.value);
    document.querySelector(`*[data-${type}-split-text]`).innerHTML = `${value}% / ${100 - value}%`;
  }
  const dws = document.querySelector('*[data-water-split]')
  dws.addEventListener('input', updateSplitText.bind(this, 'water'), false);
  const sws = document.querySelector('*[data-sewer-split]')
  sws.addEventListener('input', updateSplitText.bind(this, 'sewer'), false);
  form.addEventListener('reset', () => {
    updateSplitText('water', { target: { value: 77 } });
    updateSplitText('sewer', { target: { value: 70 } });
  });


  // submit form for default bill and chart
  document.querySelector('.calc-rate-submit').click();
}(this.document, this.appMain));
