/**
 * Main js for all data and charting
 */
(function (window, Papa, moment, Chart, ChartDataLabels, arcgisRest) {
  if (Chart) {
    // Charts defaults
    Chart.plugins.unregister(ChartDataLabels);
    Chart.defaults.global.defaultFontColor = '#3E3F3A';
    Chart.defaults.global.defaultFontFamily = '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
  }

  // gloabl data object
  const am = window.appMain = {};

  // colors
  am.colors = {
    aqua: '#7fdbff',
    blue: '#325D88', //
    lime: '#01ff70',
    navy: '#001f3f',
    teal: '#20c997', //
    olive: '#3d9970',
    green: '#93C54B', //
    red: '#d9534f', //
    maroon: '#943835', //*
    orange: '#F47C3C', //
    purple: '#6f42c1', //
    yellow: '#ffc107', // 
    fuchsia: '#f012be',
    gray: '#98978B', //
    white: '#ffffff',
    black: '#212529', //
    silver: '#dddddd'
  };

  am.currentFiscalYear = '2020';

  am.currentSconYear = '2019';

  // meter multipliers [decimal, text, water, sewer]
  am.multipliers = [
    [0.75, '3/4"', 1, 1],
    [1, '1"', 1.4, 1.67],
    [1.5, '1 1/2"', 1.8, 3.33],
    [2, '2"', 2.9, 5.33],
    [3, '3"', 11, 10.67],
    [4, '4"', 14, 16.67]
  ];

  // rates
  am.rates = {
    '2020': {
      wBase: 29.50,
      wCon: 1.80,
      wLoan: 7.15,
      sBase: 26.90,
      sCon: 2.60,
      sLoan: 19.50,
      parks: 2.00
    },
    '2019': {
      wBase: 29.50,
      wCon: 1.80,
      wLoan: 9.80,
      sBase: 26.90,
      sCon: 2.60,
      sLoan: 22.50,
      parks: 2.00
    },
    '2018': {
      wBase: 30.70,
      wCon: 1.8,
      wLoan: 9.5,
      sBase: 26.65,
      sCon: 2.45,
      sLoan: 44.75,
      parks: 2.00
    },
    '2017': {
      wBase: 29.3,
      wCon: 3,
      wLoan: 9.5,
      sBase: 23.95,
      sCon: 2.31,
      sLoan: 55.27,
      parks: 2.00
    }
  };

  // required revenue by fiscal year
  am.requiredRevenue = {
    '2020': {
      wBase: 364210,
      wCon: 108790,
      wLoan: 87200,
      sBase: 296800,
      sCon: 127200,
      sLoan: 227000
    },
    '2019': {
      wBase: 373567,
      wCon: 111585,
      wLoan: 113359,
      sBase: 303350,
      sCon: 130007,
      sLoan: 248835
    },
    '2018': {
      wBase: 344304,
      wCon: 102844,
      wLoan: 119949,
      sBase: 248926,
      sCon: 122540,
      sLoan: 498760
    },
    '2017': {
      wBase: 344304,
      wCon: 102844,
      wLoan: 119949,
      sBase: 248926,
      sCon: 122540,
      sLoan: 498760
    }
  };

  // metter eol vars
  am.eol = {
    realMeterAccuracy: [
      1,
      0.997462,
      0.994924,
      0.992386,
      0.989848,
      0.98731,
      0.984772,
      0.982234,
      0.979696,
      0.977158,
      0.97462,
      0.972082,
      0.969544,
      0.967006,
      0.964468,
      0.96193,
      0.959392,
      0.956854,
      0.954316,
      0.951778,
      0.94924,
      0.946702,
      0.944164,
      0.941626,
      0.939088,
      0.93655,
      0.934012,
      0.930262,
      0.926512,
      0.922762,
      0.919012,
      0.915262,
      0.911512,
      0.907762,
      0.904012,
      0.900262,
      0.896512,
      0.892762,
      0.889012,
      0.885262,
      0.881512,
      0.877762,
      0.874012,
      0.870262,
      0.866512,
      0.862762,
      0.859012,
      0.855262,
      0.851512,
      0.847762,
      0.844012,
      0.840262,
      0.836512,
      0.832762,
      0.829012,
      0.825262,
      0.821512,
      0.817762,
      0.814012,
      0.810262,
      0.806512
    ],
    years: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    useYears: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    waterRate: am.rates[am.currentFiscalYear].wCon,
    sewerRate: am.rates[am.currentFiscalYear].sCon,
    replacementCost: 245,
    avgConsumption: 4.7
  };

  // fetch csv data and convert to json
  // @returns array of fullfilled promises
  am.getData = () => {
    return Promise.all([
      '/csv/water-sewer-stats.csv'
    ].map(url => {
      return fetch(url)
        .then(res => {
          return res.ok ? res.text() : Promise.reject(res.status);
        })
        .then(csv => {
          return Papa.parse(csv, {
            header: true
          });
        });
    }));
  };

  // filter data by calendar year
  am.filterYear = (data, year) => {
    return data.filter(d => {
      return d.year === year;
    });
  };

  // filter data by fiscal year
  am.filterFiscalYear = (data, fiscalYear) => {
    return data.filter(d => {
      return d.fiscalYear === fiscalYear;
    });
  };

  // filter data by sewer consumption year
  am.filterSconYear = (data, sconYear) => {
    return data.filter(d => {
      return d.sconYear === sconYear;
    });
  };

  // return the YYYY-MM labels array
  am.getMonthLabels = data => {
    return data.map(d => {
      return moment({
        year: d.year,
        month: d.month
      }).format('MMM YYYY');
    });
  };

  am.getSconYearOfLabels = () => {
    return [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2].map(m => {
      return moment({
        month: m
      }).format('MMM');
    });
  };

  // return array of field values
  am.getFieldData = (data, field, divisor) => {
    return data.map(d => {
      return d[field] / (divisor || 1);
    });
  };

  // return sum of field
  am.sumField = (data, field) => {
    let sum = 0;
    data.forEach(d => {
      sum = sum + parseFloat(d[field]);
    });
    return sum;
  };

  // return array of unique valeus
  am.uniqueValues = (data, field) => {
    const r = [];
    data.forEach(d => {
      if (r.indexOf(d[field]) === -1) {
        r.push(d[field]);
      }
    });
    return r;
  };

  /**
   * Array of accumulative values
   * @param value Number - value to accumulate
   * @param length Number - number of values to add to array
   * @param integer Boolean (optional) - parseInt() or not (falsy by default)
   * @param divisor Number (optional) - number to divide the value by when accumulating (12 by default for months)
   * @returns Number[]
   */
  am.valueAccumulativeArray = (value, length, integer, divisor) => {
    const r = [];
    let counter = 0;
    const one = value / (divisor || 12);
    while (counter < length) {
      counter++;
      const v = one * counter;
      r.push(integer === true ? parseInt(v, 10) : v);
    }
    return r;
  };

  am.accumulativeArray = (values, integer) => {
    const r = [];
    values.reduce((acc, value) => {
      const v = acc + value;
      r.push(integer === true ? parseInt(v) : v);
      return v;
    }, 0);
    return r;
  };

  am.subtractArrays = (one, two) => {
    return one.map((r, idx) => {
      return r - two[idx];
    });
  };

  am.averageArray = arr => {
    return arr.reduce((p, c) => p + parseFloat(c), 0) / arr.length;
  };

  am.sumArray = arr => {
    return arr.reduce((p, c) => p + parseFloat(c), 0);
  };

  // formatters
  // axis dollar ticks
  am.$ticks = value => {
    return '$' + value.toLocaleString();
  };

  // tooltip dollar
  am.$tooltipLabel = (item, data) => {
    return data.datasets[item.datasetIndex].label + ': $' + Number(item.value).toLocaleString();
  }


  // services stats
  const restUrl = 'https://gisportal.vernonia-or.gov/arcgis/rest/services/Water/Water_Meters_Public/MapServer/0';

  am.getServicesData = (params) => {
    return arcgisRest.queryFeatures(Object.assign({
      url: restUrl,
      returnGeometry: false
    }, params))
  };
  

}(this, this.Papa, this.moment, this.Chart, this.ChartDataLabels, this.arcgisRest));
