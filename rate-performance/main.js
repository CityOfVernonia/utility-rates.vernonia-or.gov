(function (document, chartData, Chart, ChartDataLabels) {
  const fiscalYear = document.querySelector('h1[data-fiscal-year]').getAttribute('data-fiscal-year');

  // colors for charts
  const color = Chart.helpers.color;
  const colors = chartData.colors;

  // required revenue and rates
  const requiredRevenue = chartData.requiredRevenue[fiscalYear];
  const rates = chartData.rates[fiscalYear];
  const multipliers = chartData.multipliers;
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
  chartData.getData()
    .then(results => {
      // filter by fiscal year
      const data = chartData.filterFiscalYear(results[0].data, fiscalYear);

      const labels = chartData.getMonthLabels(data);

      // water revenue
      const waterRevenueBase = chartData.getFieldData(data, 'waterRevenueBase');
      const waterRevenueConsumption = chartData.getFieldData(data, 'waterRevenueConsumption');
      const waterRevenueLoan = chartData.getFieldData(data, 'waterRevenueLoan');

      // sewer revenue
      const sewerRevenueBase = chartData.getFieldData(data, 'sewerRevenueBase');
      const sewerRevenueConsumption = chartData.getFieldData(data, 'sewerRevenueConsumption');
      const sewerRevenueLoan = chartData.getFieldData(data, 'sewerRevenueLoan');

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
      const waterConsumption = chartData.getFieldData(data, 'waterConsumption', 1000);
      const sewerConsumption = chartData.getFieldData(data, 'sewerConsumption', 1000);

      const waterMultipliersCount = chartData.getFieldData(data, 'waterMultipliersCount');
      const waterMultipliersRevenue = chartData.getFieldData(data, 'waterMultipliersRevenue');
      const sewerMultipliersCount = chartData.getFieldData(data, 'sewerMultipliersCount');
      const sewerMultipliersRevenue = chartData.getFieldData(data, 'sewerMultipliersRevenue');

      const waterMultipliersCountSum = chartData.sumArray(waterMultipliersCount);
      const waterMultipliersRevenueSum = chartData.sumArray(waterMultipliersRevenue);
      const sewerMultipliersCountSum = chartData.sumArray(sewerMultipliersCount);
      const sewerMultipliersRevenueSum = chartData.sumArray(sewerMultipliersRevenue);

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
              label: chartData.$tooltipLabel
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: chartData.$ticks
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
              chartData.sumField(data, 'waterRevenueBase'),
              chartData.sumField(data, 'waterRevenueConsumption'),
              chartData.sumField(data, 'waterRevenueLoan')
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
              (chartData.sumField(data, 'waterRevenueBase') / monthCount * 12),
              (chartData.sumField(data, 'waterRevenueConsumption') / monthCount * 12),
              (chartData.sumField(data, 'waterRevenueLoan') / monthCount * 12)
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
              label: chartData.$tooltipLabel
            }
          },
          scales: {
            xAxes: [{
              ticks: {
                min: 0,
                callback: chartData.$ticks
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
            data: chartData.subtractArrays(
              chartData.accumulativeArray(waterRevenueBase, true),
              chartData.valueAccumulativeArray(requiredRevenue.wBase, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.5).rgbString()
          }, {
            label: 'Consumption Revenue',
            data: chartData.subtractArrays(
              chartData.accumulativeArray(waterRevenueConsumption, true),
              chartData.valueAccumulativeArray(requiredRevenue.wCon, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.green,
            backgroundColor: color(colors.green).alpha(0.5).rgbString()
          }, {
            label: 'Loan Revenue',
            data: chartData.subtractArrays(
              chartData.accumulativeArray(waterRevenueLoan, true),
              chartData.valueAccumulativeArray(requiredRevenue.wLoan, monthCount, true)
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
              label: chartData.$tooltipLabel
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: chartData.$ticks
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
        .innerHTML = `${chartData.averageArray(waterBasePercentage).toFixed(1)}%/${chartData.averageArray(waterConsumptionPercentage).toFixed(1)}%`;

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
        .innerHTML = `${(chartData.sumArray(waterConsumption) * 1000).toLocaleString()}`;


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
              label: chartData.$tooltipLabel
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: chartData.$ticks
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
              chartData.sumField(data, 'sewerRevenueBase'),
              chartData.sumField(data, 'sewerRevenueConsumption'),
              chartData.sumField(data, 'sewerRevenueLoan')
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
              (chartData.sumField(data, 'sewerRevenueBase') / monthCount * 12),
              (chartData.sumField(data, 'sewerRevenueConsumption') / monthCount * 12),
              (chartData.sumField(data, 'sewerRevenueLoan') / monthCount * 12)
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
              label: chartData.$tooltipLabel
            }
          },
          scales: {
            xAxes: [{
              ticks: {
                min: 0,
                callback: chartData.$ticks
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
            data: chartData.subtractArrays(
              chartData.accumulativeArray(sewerRevenueBase, true),
              chartData.valueAccumulativeArray(requiredRevenue.sBase, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.red,
            backgroundColor: color(colors.red).alpha(0.5).rgbString()
          }, {
            label: 'Consumption Revenue',
            data: chartData.subtractArrays(
              chartData.accumulativeArray(sewerRevenueConsumption, true),
              chartData.valueAccumulativeArray(requiredRevenue.sCon, monthCount, true)
            ),
            borderWidth: 1,
            borderColor: colors.orange,
            backgroundColor: color(colors.orange).alpha(0.5).rgbString()
          }, {
            label: 'Loan Revenue',
            data: chartData.subtractArrays(
              chartData.accumulativeArray(sewerRevenueLoan, true),
              chartData.valueAccumulativeArray(requiredRevenue.sLoan, monthCount, true)
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
              label: chartData.$tooltipLabel
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: chartData.$ticks
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
        .innerHTML = `${chartData.averageArray(sewerBasePercentage).toFixed(1)}%/${chartData.averageArray(sewerConsumptionPercentage).toFixed(1)}%`;

      // sewer stats chart
      new Chart(document.querySelector('canvas[data-chart-sewer]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Count Multipliers',
            data: chartData.getFieldData(data, 'sewerMultipliersCount'),
            borderWidth: 1,
            borderColor: colors.red,
            backgroundColor: color(colors.red).alpha(0.1).rgbString()
          }, {
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Revenue Multipliers',
            data: chartData.getFieldData(data, 'sewerMultipliersRevenue'),
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
        .innerHTML = `${(chartData.sumArray(sewerConsumption) * 1000).toLocaleString()}`;

    });

}(this.document, this.chartData, this.Chart, this.ChartDataLabels));
