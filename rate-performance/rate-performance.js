(function (document, dataMain, Chart, ChartDataLabels) {
  const fiscalYear = document.querySelector('h1[data-fiscal-year]').getAttribute('data-fiscal-year');

  // colors for charts
  const color = Chart.helpers.color;
  const colors = appMain.colors;

  // required revenue and rates
  const requiredRevenue = appMain.requiredRevenue[fiscalYear];
  const rates = appMain.rates[fiscalYear];
  const multipliers = appMain.multipliers;
  const rateTableRows = [];

  document.querySelector('*[data-required-revenue]').innerHTML = `
    <td class="text-center">$${requiredRevenue.wBase.toLocaleString()}</td>
    <td class="text-center">$${requiredRevenue.wCon.toLocaleString()}</td>
    <td class="text-center">$${requiredRevenue.wLoan.toLocaleString()}</td>
    <td class="text-center">$${requiredRevenue.sBase.toLocaleString()}</td>
    <td class="text-center">$${requiredRevenue.sCon.toLocaleString()}</td>
    <td class="text-center">$${requiredRevenue.sLoan.toLocaleString()}</td>
  `;

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

  document.querySelector('*[data-rates]').innerHTML = rateTableRows.join('');

  // get data
  appMain.getData()
    .then(results => {
      // filter by fiscal year
      const data = appMain.filterFiscalYear(results[0].data, fiscalYear);

      const labels = appMain.getMonthLabels(data);

      // water revenue
      const waterRevenueBase = appMain.getFieldData(data, 'waterRevenueBase');
      const waterRevenueConsumption = appMain.getFieldData(data, 'waterRevenueConsumption');
      const waterRevenueLoan = appMain.getFieldData(data, 'waterRevenueLoan');

      // sewer revenue
      const sewerRevenueBase = appMain.getFieldData(data, 'sewerRevenueBase');
      const sewerRevenueConsumption = appMain.getFieldData(data, 'sewerRevenueConsumption');
      const sewerRevenueLoan = appMain.getFieldData(data, 'sewerRevenueLoan');

      // water and sewer projection vars and calcs
      const monthCount = data.length;
      const waterBasePercentage = [];
      const waterConsumptionPercentage = [];
      const sewerBasePercentage = [];
      const sewerConsumptionPercentage = [];
      waterRevenueBase.forEach((r, idx) => {
        const wrb = waterRevenueBase[idx];
        const wrc = waterRevenueConsumption[idx];
        const srb = sewerRevenueBase[idx];
        const src = sewerRevenueConsumption[idx];
        const waterTotal = wrb + wrc;
        const sewerTotal = srb + src;
        waterBasePercentage.push((wrb / waterTotal * 100).toFixed(1));
        waterConsumptionPercentage.push((wrc / waterTotal * 100).toFixed(1));
        sewerBasePercentage.push((srb / sewerTotal * 100).toFixed(1));
        sewerConsumptionPercentage.push((src / sewerTotal * 100).toFixed(1));
      });

      // water and sewer stats
      const waterConsumption = appMain.getFieldData(data, 'waterConsumption', 1000);
      const sewerConsumption = appMain.getFieldData(data, 'sewerConsumption', 1000);

      const waterMultipliersCount = appMain.getFieldData(data, 'waterMultipliersCount');
      const waterMultipliersRevenue = appMain.getFieldData(data, 'waterMultipliersRevenue');
      const sewerMultipliersCount = appMain.getFieldData(data, 'sewerMultipliersCount');
      const sewerMultipliersRevenue = appMain.getFieldData(data, 'sewerMultipliersRevenue');

      const waterMultipliersCountSum = appMain.sumArray(waterMultipliersCount);
      const waterMultipliersRevenueSum = appMain.sumArray(waterMultipliersRevenue);
      const sewerMultipliersCountSum = appMain.sumArray(sewerMultipliersCount);
      const sewerMultipliersRevenueSum = appMain.sumArray(sewerMultipliersRevenue);

      // water revenue chart
      new Chart(document.querySelector('canvas[data-chart-water-revenue]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            stack: 'water',
            label: 'Base Revenue',
            data: waterRevenueBase,
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.5).rgbString()
          }, {
            stack: 'water',
            label: 'Consumption Revenue',
            data: waterRevenueConsumption,
            borderWidth: 1,
            borderColor: colors.green,
            backgroundColor: color(colors.green).alpha(0.5).rgbString()
          }, {
            label: 'Loan Revenue',
            data: waterRevenueLoan,
            borderWidth: 1,
            borderColor: colors.teal,
            backgroundColor: color(colors.teal).alpha(0.5).rgbString()
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Billed Water Revenue'
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            mode: 'index',
            callbacks: {
              label: appMain.$tooltipLabel
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: appMain.$ticks
              }
            }]
          }
        }
      });

      // water projection chart
      new Chart(document.querySelector('canvas[data-chart-water-projection]'), {
        type: 'horizontalBar',
        data: {
          labels: ['Base Revenue', 'Consumption Revenue', 'Loan Revenue'],
          datasets: [{
            label: 'Required Revenue',
            data: [
              requiredRevenue.wBase,
              requiredRevenue.wCon,
              requiredRevenue.wLoan
            ],
            borderWidth: 1,
            borderColor: [
              colors.blue,
              colors.green,
              colors.teal
            ],
            backgroundColor: [
              color(colors.blue).alpha(0.333).rgbString(),
              color(colors.green).alpha(0.333).rgbString(),
              color(colors.teal).alpha(0.333).rgbString()
            ]
          }, {
            label: 'Billed To Date Revenue',
            data: [
              appMain.sumField(data, 'waterRevenueBase'),
              appMain.sumField(data, 'waterRevenueConsumption'),
              appMain.sumField(data, 'waterRevenueLoan')
            ],
            borderWidth: 1,
            borderColor: [
              colors.blue,
              colors.green,
              colors.teal
            ],
            backgroundColor: [
              color(colors.blue).alpha(0.666).rgbString(),
              color(colors.green).alpha(0.666).rgbString(),
              color(colors.teal).alpha(0.666).rgbString()
            ]
          }, {
            label: 'Projected Revenue',
            data: [
              (appMain.sumField(data, 'waterRevenueBase') / monthCount * 12),
              (appMain.sumField(data, 'waterRevenueConsumption') / monthCount * 12),
              (appMain.sumField(data, 'waterRevenueLoan') / monthCount * 12)
            ],
            borderWidth: 1,
            borderColor: [
              colors.blue,
              colors.green,
              colors.teal
            ],
            backgroundColor: [
              colors.blue,
              colors.green,
              colors.teal
            ]
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Revenue Billed to Date and Year Projection'
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            callbacks: {
              label: appMain.$tooltipLabel
            }
          },
          scales: {
            xAxes: [{
              ticks: {
                min: 0,
                callback: appMain.$ticks
              }
            }]
          }
        }
      });

      // water accumulative chart
      new Chart(document.querySelector('canvas[data-chart-water-accumulative]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Base Revenue',
            data: appMain.subtractArrays(
              appMain.accumulativeArray(waterRevenueBase, true),
              appMain.valueAccumulativeArray(requiredRevenue.wBase, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.5).rgbString()
          }, {
            label: 'Consumption Revenue',
            data: appMain.subtractArrays(
              appMain.accumulativeArray(waterRevenueConsumption, true),
              appMain.valueAccumulativeArray(requiredRevenue.wCon, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.green,
            backgroundColor: color(colors.green).alpha(0.5).rgbString()
          }, {
            label: 'Loan Revenue',
            data: appMain.subtractArrays(
              appMain.accumulativeArray(waterRevenueLoan, true),
              appMain.valueAccumulativeArray(requiredRevenue.wLoan, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.teal,
            backgroundColor: color(colors.teal).alpha(0.5).rgbString()
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Month Accumulative Revenue +/-'
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            mode: 'index',
            callbacks: {
              label: appMain.$tooltipLabel
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: appMain.$ticks
              }
            }]
          }
        }
      });

      // water split chart
      new Chart(document.querySelector('canvas[data-chart-water-split]').getContext('2d'), {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
          labels,
          datasets: [{
            stack: 'percent',
            label: 'Base',
            data: waterBasePercentage,
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.5).rgbString()
          }, {
            stack: 'percent',
            label: 'Consumption',
            data: waterConsumptionPercentage,
            borderWidth: 1,
            borderColor: colors.green,
            backgroundColor: color(colors.green).alpha(0.5).rgbString()
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Base/Consumption Split'
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            mode: 'index',
            callbacks: {
              label: (item, _data) => {
                return _data.datasets[item.datasetIndex].label + ': ' + item.value + '%';
              }
            }
          },
          scales: {
            yAxes: [{
              min: 0,
              max: 100,
              ticks: {
                callback: (value) => {
                  return value + '%';
                }
              }
            }]
          },
          plugins: {
            datalabels: {
              color: colors.black,
              formatter: function (value) {
                return value + '%';
              }
            }
          }
        }
      });

      document.querySelector('*[data-water-split-avg]')
        .innerHTML = `${appMain.averageArray(waterBasePercentage).toFixed(1)}%/${appMain.averageArray(waterConsumptionPercentage).toFixed(1)}%`;

      // water stats chart
      new Chart(document.querySelector('canvas[data-chart-water]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Count Multipliers',
            data: waterMultipliersCount,
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.1).rgbString()
          }, {
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Revenue Multipliers',
            data: waterMultipliersRevenue,
            borderDash: [5, 5],
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.1).rgbString()
          }, {
            yAxisID: 'right-axis',
            label: 'Consumption',
            data: waterConsumption,
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.5).rgbString()
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Water Multipliers & Consumption'
          },
          elements: {
            line: {
              tension: 0
            }
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            mode: 'index'
          },
          scales: {
            yAxes: [{
              display: true,
              id: 'left-axis',
              position: 'left',
              scaleLabel: {
                display: true,
                labelString: 'Meter Multipliers'
              }
            }, {
              display: true,
              id: 'right-axis',
              position: 'right',
              gridLines: {
                drawOnChartArea: false
              },
              scaleLabel: {
                display: true,
                labelString: '1000s Gallons'
              }
            }]
          }
        }
      });

      document.querySelector('*[data-water-multipliers-count]')
        .innerHTML = `${waterMultipliersCountSum.toFixed(0)} (${(waterMultipliersCountSum / monthCount).toFixed(2)}/month)`;

      document.querySelector('*[data-water-multipliers-revenue]')
        .innerHTML = `${waterMultipliersRevenueSum.toFixed(2)} (${(waterMultipliersRevenueSum / monthCount).toFixed(2)}/month)`;

      document.querySelector('*[data-water-consumption]')
        .innerHTML = `${(appMain.sumArray(waterConsumption) * 1000).toLocaleString()}`;


      // sewer revenue chart
      new Chart(document.querySelector('canvas[data-chart-sewer-revenue]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            stack: 'sewer',
            label: 'Base Revenue',
            data: sewerRevenueBase,
            borderWidth: 1,
            borderColor: colors.red,
            backgroundColor: color(colors.red).alpha(0.5).rgbString()
          }, {
            stack: 'sewer',
            label: 'Consumption Revenue',
            data: sewerRevenueConsumption,
            borderWidth: 1,
            borderColor: colors.orange,
            backgroundColor: color(colors.orange).alpha(0.5).rgbString()
          }, {
            label: 'Loan Revenue',
            data: sewerRevenueLoan,
            borderWidth: 1,
            borderColor: colors.maroon,
            backgroundColor: color(colors.maroon).alpha(0.5).rgbString()
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Sewer Revenue'
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            mode: 'index',
            callbacks: {
              label: appMain.$tooltipLabel
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: appMain.$ticks
              }
            }]
          }
        }
      });

      // sewer projection chart
      new Chart(document.querySelector('canvas[data-chart-sewer-projection]'), {
        type: 'horizontalBar',
        data: {
          labels: ['Base Revenue', 'Consumption Revenue', 'Loan Revenue'],
          datasets: [{
            label: 'Required Revenue',
            data: [
              requiredRevenue.sBase,
              requiredRevenue.sCon,
              requiredRevenue.sLoan
            ],
            borderWidth: 1,
            borderColor: [
              colors.red,
              colors.orange,
              colors.maroon
            ],
            backgroundColor: [
              color(colors.red).alpha(0.333).rgbString(),
              color(colors.orange).alpha(0.333).rgbString(),
              color(colors.maroon).alpha(0.333).rgbString()
            ]
          }, {
            label: 'Billed To Date Revenue',
            data: [
              appMain.sumField(data, 'sewerRevenueBase'),
              appMain.sumField(data, 'sewerRevenueConsumption'),
              appMain.sumField(data, 'sewerRevenueLoan')
            ],
            borderWidth: 1,
            borderColor: [
              colors.red,
              colors.orange,
              colors.maroon
            ],
            backgroundColor: [
              color(colors.red).alpha(0.666).rgbString(),
              color(colors.orange).alpha(0.666).rgbString(),
              color(colors.maroon).alpha(0.666).rgbString()
            ]
          }, {
            label: 'Projected Revenue',
            data: [
              (appMain.sumField(data, 'sewerRevenueBase') / monthCount * 12),
              (appMain.sumField(data, 'sewerRevenueConsumption') / monthCount * 12),
              (appMain.sumField(data, 'sewerRevenueLoan') / monthCount * 12)
            ],
            borderWidth: 1,
            borderColor: [
              colors.red,
              colors.orange,
              colors.maroon
            ],
            backgroundColor: [
              colors.red,
              colors.orange,
              colors.maroon
            ]
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Revenue Billed to Date and Year Projection'
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            callbacks: {
              label: appMain.$tooltipLabel
            }
          },
          scales: {
            xAxes: [{
              ticks: {
                min: 0,
                callback: appMain.$ticks
              }
            }]
          }
        }
      });

      // sewer accumulative chart
      new Chart(document.querySelector('canvas[data-chart-sewer-accumulative]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Base Revenue',
            data: appMain.subtractArrays(
              appMain.accumulativeArray(sewerRevenueBase, true),
              appMain.valueAccumulativeArray(requiredRevenue.sBase, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.red,
            backgroundColor: color(colors.red).alpha(0.5).rgbString()
          }, {
            label: 'Consumption Revenue',
            data: appMain.subtractArrays(
              appMain.accumulativeArray(sewerRevenueConsumption, true),
              appMain.valueAccumulativeArray(requiredRevenue.sCon, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.orange,
            backgroundColor: color(colors.orange).alpha(0.5).rgbString()
          }, {
            label: 'Loan Revenue',
            data: appMain.subtractArrays(
              appMain.accumulativeArray(sewerRevenueLoan, true),
              appMain.valueAccumulativeArray(requiredRevenue.sLoan, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.maroon,
            backgroundColor: color(colors.maroon).alpha(0.5).rgbString()
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Month Accumulative Revenue +/-'
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            mode: 'index',
            callbacks: {
              label: appMain.$tooltipLabel
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: appMain.$ticks
              }
            }]
          }
        }
      });

      // sewer split chart
      new Chart(document.querySelector('canvas[data-chart-sewer-split]').getContext('2d'), {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
          labels,
          datasets: [{
            stack: 'percent',
            label: 'Base',
            data: sewerBasePercentage,
            borderWidth: 1,
            borderColor: colors.red,
            backgroundColor: color(colors.red).alpha(0.5).rgbString()
          }, {
            stack: 'percent',
            label: 'Consumption',
            data: sewerConsumptionPercentage,
            borderWidth: 1,
            borderColor: colors.orange,
            backgroundColor: color(colors.orange).alpha(0.5).rgbString()
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Base/Consumption Split'
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            mode: 'index',
            callbacks: {
              label: (item, _data) => {
                return _data.datasets[item.datasetIndex].label + ': ' + item.value + '%';
              }
            }
          },
          scales: {
            yAxes: [{
              min: 0,
              max: 100,
              ticks: {
                callback: (value) => {
                  return value + '%';
                }
              }
            }]
          },
          plugins: {
            datalabels: {
              color: colors.black,
              formatter: function (value) {
                return value + '%';
              }
            }
          }
        }
      });

      document.querySelector('*[data-sewer-split-avg]')
        .innerHTML = `${appMain.averageArray(sewerBasePercentage).toFixed(1)}%/${appMain.averageArray(sewerConsumptionPercentage).toFixed(1)}%`;

      // sewer stats chart
      new Chart(document.querySelector('canvas[data-chart-sewer]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Count Multipliers',
            data: appMain.getFieldData(data, 'sewerMultipliersCount'),
            borderWidth: 1,
            borderColor: colors.red,
            backgroundColor: color(colors.red).alpha(0.1).rgbString()
          }, {
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Revenue Multipliers',
            data: appMain.getFieldData(data, 'sewerMultipliersRevenue'),
            borderDash: [5, 5],
            borderWidth: 1,
            borderColor: colors.red,
            backgroundColor: color(colors.red).alpha(0.1).rgbString()
          }, {
            yAxisID: 'right-axis',
            label: 'Consumption',
            data: sewerConsumption,
            borderWidth: 1,
            borderColor: colors.red,
            backgroundColor: color(colors.red).alpha(0.5).rgbString()
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Sewer Multipliers & Consumption'
          },
          elements: {
            line: {
              tension: 0
            }
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            mode: 'index'
          },
          scales: {
            yAxes: [{
              display: true,
              id: 'left-axis',
              position: 'left',
              scaleLabel: {
                display: true,
                labelString: 'Meter Multipliers'
              }
            }, {
              display: true,
              id: 'right-axis',
              position: 'right',
              gridLines: {
                drawOnChartArea: false
              },
              scaleLabel: {
                display: true,
                labelString: '1000s Gallons'
              }
            }]
          }
        }
      });
      document.querySelector('*[data-sewer-multipliers-count]')
        .innerHTML = `${sewerMultipliersCountSum.toFixed(0)} (${(sewerMultipliersCountSum / monthCount).toFixed(2)}/month)`;

      document.querySelector('*[data-sewer-multipliers-revenue]')
        .innerHTML = `${sewerMultipliersRevenueSum.toFixed(2)} (${(sewerMultipliersRevenueSum / monthCount).toFixed(2)}/month)`;

      document.querySelector('*[data-sewer-consumption]')
        .innerHTML = `${(appMain.sumArray(sewerConsumption) * 1000).toLocaleString()}`;

    });

}(this.document, this.dataMain, this.Chart, this.ChartDataLabels));
