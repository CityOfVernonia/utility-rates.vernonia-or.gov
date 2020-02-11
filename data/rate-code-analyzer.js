/**
 * Analyze a rate code file
 */
(function (document, appMain, Papa) {

  // multiplier by rate code
  // create this from appMain.multipliers???
  const Mm = {
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
    console.log(data);

    const rateCodesByMonth = {};

    const monthData = [];

    // group rate code by month
    rateCodes.forEach(rateCode => {
      const date = moment(rateCode[2], 'MM/DD/YYYY');
      const monthCode = date.year() + '-' + date.month();
      if (!rateCodesByMonth[monthCode]) {
        rateCodesByMonth[monthCode] = [];
      }
      rateCodesByMonth[monthCode].push(rateCode);
    });





    document.querySelector('*[data-rate-code-results]').innerHTML = '';
  };




  document.querySelector('form[data-rate-code-form]').addEventListener('submit', evt => {
    evt.preventDefault();

    Papa.parse(evt.target.FILE.files[0], {
      skipEmptyLines: true,
      complete: analyzeRateCodes
    });
  });
}(this.document, this.appMain, this.Papa));
