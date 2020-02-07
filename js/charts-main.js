/**
 * Chart defaults and common for all charting
 */
(function (window, Papa, moment, Chart, ChartDataLabels) {
  if (Chart) {
    // Charts defaults
    Chart.plugins.unregister(ChartDataLabels);
    Chart.defaults.global.defaultFontColor = '#3E3F3A';
    Chart.defaults.global.defaultFontFamily = '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
  }

  // gloabl data object
  const c = window.chartData = {};

  // colors
  c.colors = {
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

  // meter multipliers [decimal, text, water, sewer]
  c.multipliers = [
    [0.75, '3/4"', 1, 1],
    [1, '1"', 1.4, 1.67],
    [1.5, '1 1/2"', 1.8, 3.33],
    [2, '2"', 2.9, 5.33],
    [3, '3"', 11, 10],
    [4, '4"', 14, 16.67]
  ];

  // rates
  c.rates = {
    '2019': {
      wBase: 29.50,
      wCon: 1.80,
      wLoan: 9.80,
      sBase: 26.90,
      sCon: 2.60,
      sLoan: 22.50
    },
    '2018': {
      wBase: 29.50,
      wCon: 1.80,
      wLoan: 9.80,
      sBase: 26.90,
      sCon: 2.60,
      sLoan: 22.50
    },
    '2017': {
      wBase: 29.50,
      wCon: 1.80,
      wLoan: 9.80,
      sBase: 26.90,
      sCon: 2.60,
      sLoan: 22.50
    }
  };

  // required revenue by fiscal year
  c.requiredRevenue = {
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

  // fetch csv data and convert to json
  // @returns array of fullfilled promises
  c.getData = () => {
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
  c.filterYear = (data, year) => {
    return data.filter(d => {
      return d.year === year;
    });
  };

  // filter data by fiscal year
  c.filterFiscalYear = (data, fiscalYear) => {
    return data.filter(d => {
      return d.fiscalYear === fiscalYear;
    });
  };

  // filter data by sewer consumption year
  c.filterSconYear = (data, sconYear) => {
    return data.filter(d => {
      return d.sconYear === sconYear;
    });
  };

  // return the YYYY-MM labels array
  c.getMonthLabels = data => {
    return data.map(d => {
      return moment({
        year: d.year,
        month: d.month
      }).format('MMM YYYY');
    });
  };

  // return array of field values
  c.getFieldData = (data, field, divisor) => {
    return data.map(d => {
      return d[field] / (divisor || 1);
    });
  };

  // return sum of field
  c.sumField = (data, field) => {
    let sum = 0;
    data.forEach(d => {
      sum = sum + parseFloat(d[field]);
    });
    return sum;
  };

  /**
   * Array of accumulative values
   * @param value Number - value to accumulate
   * @param length Number - number of values to add to array
   * @param integer Boolean (optional) - parseInt() or not (falsy by default)
   * @param divisor Number (optional) - number to divide the value by when accumulating (12 by default for months)
   * @returns Number[]
   */
  c.valueAccumulativeArray = (value, length, integer, divisor) => {
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

  c.accumulativeArray = (values, integer) => {
    const r = [];
    values.reduce((acc, value) => {
      const v = acc + value;
      r.push(integer === true ? parseInt(v) : v);
      return v;
    }, 0);
    return r;
  };

  c.subtractArrays = (one, two) => {
    return one.map((r, idx) => {
      return r - two[idx];
    });
  };

  c.averageArray = arr => {
    return arr.reduce((p, c) => p + parseFloat(c), 0) / arr.length;
  };

  c.sumArray = arr => {
    return arr.reduce((p, c) => p + parseFloat(c), 0);
  };


  // formatters
  // axis dollar ticks
  c.$ticks = value => {
    return '$' + value.toLocaleString();
  };

  // tooltip dollar
  c.$tooltipLabel = (item, data) => {
    return data.datasets[item.datasetIndex].label + ': $' + Number(item.value).toLocaleString();
  }

}(this, this.Papa, this.moment, this.Chart, this.ChartDataLabels));
