/**
 * Meter economic optimal life
 */
(function (document, appMain, Chart, ChartDataLabels) {
  // colors for charts
  const color = Chart.helpers.color;
  const colors = appMain.colors;

  const eol = appMain.eol;

  const waterLoss = [];
  const sewerLoss = [];

  const costOfUse = [];
  const accumulatedCost = [];
  const costPerYear = [];

  const consumptionLoss = eol.realMeterAccuracy.map(rma => {
    return Math.round(((eol.avgConsumption - (eol.avgConsumption * rma)) * 12) * 1000) / 1000;
  });

  let accCost = eol.replacementCost;

  consumptionLoss.forEach(cl => {
    const wLoss = Math.round(cl * eol.waterRate * 100) / 100;
    const sLoss = Math.round(cl * eol.sewerRate * 100) / 100;
    waterLoss.push(wLoss);
    sewerLoss.push(sLoss);
    const cou = Math.round((wLoss + sLoss) * 100) / 100;
    costOfUse.push(cou);
    const acc = Math.round((accCost + cou) * 100) / 100;
    accumulatedCost.push(acc);
    accCost = acc;
  });

  eol.useYears.forEach((y, idx) => {
    costPerYear.push(Math.round((accumulatedCost[idx] / y) * 100) / 100);
  });
  costPerYear[0] = null;

  let eolYear = 0;

  eol.useYears.forEach((y, idx) => {
    if ((costPerYear[idx] <= costOfUse[idx]) && !eolYear) {
      eolYear = y;
    }
  });

  // meter eol chart
  new Chart(document.querySelector('canvas[data-chart-eol]').getContext('2d'), {
    type: 'line',
    data: {
      labels: eol.useYears,
      datasets: [{
        label: 'Cost of Use',
        yAxisID: 'left-axis',
        data: costOfUse.slice(0, 41),
        fill: false,
        borderWidth: 1,
        borderColor: colors.red,
        backgroundColor: color(colors.red).alpha(0.1).rgbString()
      }, {
        label: 'Cost Per Year',
        yAxisID: 'left-axis',
        data: costPerYear.slice(0, 41),
        fill: false,
        borderWidth: 1,
        borderColor: colors.blue,
        backgroundColor: color(colors.blue).alpha(0.1).rgbString()
      }, {
        label: 'Accumulative Cost',
        yAxisID: 'right-axis',
        data: accumulatedCost.slice(0, 41),
        fill: false,
        borderWidth: 1,
        borderColor: colors.green,
        backgroundColor: color(colors.green).alpha(0.1).rgbString()
      }]
    },
    options: {
      title: {
        display: false,
        text: 'Chart'
      },
      tooltips: {
        mode: 'index',
        callbacks: {
          label: appMain.$tooltipLabel
        }
      },
      responsive: true,
      aspectRatio: 3,
      elements: {
        line: {
          tension: 0
        }
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Meter Age in Years'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Cost'
          },
          display: true,
          id: 'left-axis',
          position: 'left',
          ticks: {
            callback: appMain.$ticks
          }
        }, {
          scaleLabel: {
            display: true,
            labelString: 'Accumulative'
          },
          display: true,
          id: 'right-axis',
          position: 'right',
          gridLines: {
            drawOnChartArea: false
          },
          ticks: {
            callback: appMain.$ticks
          }
        }]
      }
    }
  });

  document.querySelector('*[data-eol-value]').innerHTML = `
  A <strong>${eolYear}</strong> year old meter had surpassed it's economical optimal life with a water consumption rate of <strong>${eol.waterRate.toLocaleString('en-us', { style: 'currency', currency: 'USD' })} per 1000 gallons</strong>, a sewer consumption rate of <strong>${eol.sewerRate.toLocaleString('en-us', { style: 'currency', currency: 'USD' })} per 1000 gallons</strong>, and a meter replacement cost of <strong>${eol.replacementCost.toLocaleString('en-us', { style: 'currency', currency: 'USD' })}</strong>.
  `;

  // meter accuracy chart
  new Chart(document.querySelector('canvas[data-chart-meter-accuracy]').getContext('2d'), {
    type: 'bar',
    data: {
      labels: eol.years,
      datasets: [{
        type: 'line',
        yAxisID: 'left-axis',
        label: 'Meter Accuracy',
        data: eol.realMeterAccuracy.slice(0, 31),
        fill: false,
        borderWidth: 1,
        borderColor: colors.black,
        backgroundColor: color(colors.black).alpha(0.1).rgbString()
      }, {
        yAxisID: 'right-axis',
        label: 'Water Cost of Use',
        data: waterLoss.slice(0, 31),
        borderWidth: 1,
        borderColor: colors.blue,
        backgroundColor: color(colors.blue).alpha(0.5).rgbString()
      }, {
        yAxisID: 'right-axis',
        label: 'Sewer Cost of Use',
        data: sewerLoss.slice(0, 31),
        borderWidth: 1,
        borderColor: colors.red,
        backgroundColor: color(colors.red).alpha(0.5).rgbString()
      }]
    },
    options: {
      title: {
        display: false,
        text: 'Chart'
      },
      responsive: true,
      aspectRatio: 3,
      elements: {
        line: {
          tension: 0
        }
      },
      tooltips: {
        mode: 'index',
        callbacks: {
          label: (item, _data) => {
            if (item.datasetIndex === 0) {
              return _data.datasets[item.datasetIndex].label + ': ' + (Math.round(item.value * 10000) / 100) + '%'
            } else {
              return _data.datasets[item.datasetIndex].label + ': $' + Number(item.value).toLocaleString();
            }
          }
        }
      },
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Meter Age in Years'
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Accuracy'
          },
          display: true,
          id: 'left-axis',
          position: 'left',
          ticks: {
            callback: (value) => {
              return Math.round(value * 100) + '%'
            }
          }
        }, {
          scaleLabel: {
            display: true,
            labelString: 'Cost of Use'
          },
          display: true,
          id: 'right-axis',
          position: 'right',
          gridLines: {
            drawOnChartArea: false
          },
          ticks: {
            callback: appMain.$ticks
          }
        }]
      }
    }
  });


  // meter age
  appMain.getServicesData({
    where: 'WSC_TYPE = \'BILLABLE\' AND METER_SIZE_D = 0.75',
    outFields: ['METER_AGE'],
  })
    .then(results => {
      const meterAge = {};
      const labels = [];
      const data = [];
      results.features.forEach(feat => {
        const atts = feat.attributes;
        const age = atts.METER_AGE;

        if (age !== null) {
          if (!meterAge[age]) {
            meterAge[age] = 0;
          }
          meterAge[age]++;
        }
      });

      for (let a in meterAge) {
        if (meterAge.hasOwnProperty(a)) {
          labels.push(a);
          data.push(meterAge[a]);
        }
      }

      new Chart(document.querySelector('canvas[data-chart-meter-age]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Meter Age',
            data,
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.5).rgbString()
          }]
        },
        plugins: [ChartDataLabels],
        options: {
          title: {
            display: false,
            text: 'Age'
          },
          legend: {
            display: false
          },
          responsive: true,
          aspectRatio: 3,
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Meter Age in Years'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Count'
              }
            }]
          },
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'end',
              offset: 4
            }
          }
        }
      });
    });

}(this.document, this.appMain, this.Chart, this.ChartDataLabels));
