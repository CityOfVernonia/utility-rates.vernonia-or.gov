/**
 * Analyze a rate code file
 */
(function (document, appMain, Papa, moment, encodeURI) {

  // multiplier by rate code
  // create this from appMain.multipliers???
  const rateCodeMultipliers = {
    // water
    W34: 1,
    W1: 1.4,
    W15: 1.8,
    W2: 2.9,
    W3: 11,
    W4: 14,
    WLP: 1,
    WLP1: 1.4,
    WLP15: 1.8,
    WLP2: 2.9,
    WLP3: 11,
    WLP4: 14,
    // sewer
    S34: 1,
    S1: 1.67,
    S15: 3.33,
    S2: 5.33,
    S3: 10,
    S4: 16.67,
    SLP: 1,
    SLP1: 1.67,
    SLP15: 3.33,
    SLP2: 5.33,
    SLP3: 10,
    SLP4: 16.67
  };

  const rates = appMain.rates;

  analyzeRateCodes = (results) => {
    const { data } = results;

    const monthData = [];

    // group rate codes by month
    const rateCodesByMonth = {};

    data.forEach(rateCode => {
      const date = moment(rateCode[2], 'MM/DD/YYYY');
      // csv header or invalid entry
      if (!date.isValid()) {
        return;
      }
      const monthCode = date.year() + '-' + date.month();
      if (!rateCodesByMonth[monthCode]) {
        rateCodesByMonth[monthCode] = [];
      }
      rateCodesByMonth[monthCode].push(rateCode);
    });

    // create data object for each month
    for (let rateCode in rateCodesByMonth) {
      const year = parseInt(rateCode.split('-')[0]);
      const month = parseInt(rateCode.split('-')[1]);
      const fiscalYear = month <= 6 ? year - 1 : year;
      const sconYear = month <= 2 ? year - 1 : year;

      // clone data object
      const mData = Object.assign({}, {
        year, month, fiscalYear, sconYear,
        waterConsumption: 0,
        waterMultipliersCount: 0,
        waterMultipliersRevenue: 0,
        waterRevenueBase: 0,
        waterRevenueConsumption: 0,
        waterRevenueLoan: 0,
        sewerConsumption: 0,
        sewerMultipliersCount: 0,
        sewerMultipliersRevenue: 0,
        sewerRevenueBase: 0,
        sewerRevenueConsumption: 0,
        sewerRevenueLoan: 0
      });


      monthData.push(mData);

      // add up the numbers from each rate code
      rateCodesByMonth[rateCode].forEach(rCode => {
        const code = rCode[0];
        const usage = Number(rCode[3]);
        const amount = Number(rCode[4]);
        const count = Number(rCode[5]);

        switch (code) {
          case 'W34':
          case 'W1':
          case 'W15':
          case 'W2':
          case 'W3':
          case 'W4':
            mData.waterConsumption = mData.waterConsumption + (usage * 100);
            mData.waterMultipliersCount = mData.waterMultipliersCount + (count * rateCodeMultipliers[code]);
            mData.waterRevenueBase = mData.waterRevenueBase + amount;
            break;
          case 'WLP':
          case 'WLP1':
          case 'WLP15':
          case 'WLP2':
          case 'WLP3':
          case 'WLP4':
            mData.waterRevenueLoan = mData.waterRevenueLoan + amount;
            break;
          case 'S34':
          case 'S1':
          case 'S15':
          case 'S2':
          case 'S3':
          case 'S4':
            mData.sewerMultipliersCount = mData.sewerMultipliersCount + (count * rateCodeMultipliers[code]);
            mData.sewerRevenueBase = mData.sewerRevenueBase + amount;
            break;
          case 'SLP':
          case 'SLP1':
          case 'SLP15':
          case 'SLP2':
          case 'SLP3':
          case 'SLP4':
            mData.sewerRevenueLoan = mData.sewerRevenueLoan + amount;
            break;
          case 'SCON':
            // sewer consumption is figured by the rate
            mData.sewerConsumption = mData.sewerConsumption + (parseInt(amount / rates[fiscalYear].sCon * 1000));
            mData.sewerRevenueConsumption = mData.sewerRevenueConsumption + amount;
            break;
          default:
            break;
        }
      });
    } // end for

    // do some calcs and cleanup
    monthData.forEach(mData => {
      const fiscalRates = rates[mData.fiscalYear];

      // before fiscal 2018 water allowance must be taken into account
      const waterRevenueConsumption = mData.fiscalYear < 2018 ? ((mData.waterConsumption / 1000) - (mData.waterMultipliersCount * 2)) * fiscalRates.wCon : (mData.waterConsumption / 1000) * fiscalRates.wCon;
      
      // water consumption and base revenue
      mData.waterRevenueConsumption = Math.round(waterRevenueConsumption);
      mData.waterRevenueBase = Math.round(mData.waterRevenueBase - waterRevenueConsumption);

      // calc water and sewer revenue multipliers
      mData.waterMultipliersRevenue = Math.round(mData.waterRevenueBase / fiscalRates.wBase * 10) / 10;
      mData.sewerMultipliersRevenue = Math.round(mData.sewerRevenueBase / fiscalRates.sBase * 100) / 100;

      // clean up numbers
      mData.waterRevenueLoan = Math.round(mData.waterRevenueLoan);
      mData.sewerRevenueLoan = Math.round(mData.sewerRevenueLoan);
      mData.sewerMultipliersCount = Math.round(mData.sewerMultipliersCount * 100) / 100;
      mData.sewerRevenueBase = Math.round(mData.sewerRevenueBase);
      mData.sewerRevenueConsumption = Math.round(mData.sewerRevenueConsumption);
    });

    const csvString = Papa.unparse(monthData, {
      header: false
    });

    const csv = Papa.unparse(monthData);

    document.querySelector('*[data-rate-code-results]').innerHTML = `
      <h4>Results</h4>
      <p style="overflow-x: hidden;">${csvString}</p>
      <p><a class="btn btn-primary" target="_blank" href="data:text/csv;charset=utf-8,${encodeURI(csv)}" download="rate-codes-${new Date().getTime()}.csv">Download</a></p>
    `;
  }; // end analyzeRateCodes()

  document.querySelector('form[data-rate-code-form]').addEventListener('submit', evt => {
    evt.preventDefault();

    Papa.parse(evt.target.FILE.files[0], {
      skipEmptyLines: true,
      complete: analyzeRateCodes
    });
  });
}(this.document, this.appMain, this.Papa, this.moment, this.encodeURI));
