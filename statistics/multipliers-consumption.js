/**
 * Multiplier and consumption charts
 */
(function (chartData, Chart) {
  // colors for charts
  const color = Chart.helpers.color;
  const colors = chartData.colors;

  // get data
  chartData.getData()
    .then(results => {
      const data = results[0].data;

      const labels = chartData.getMonthLabels(data);

      const waterConsumption = chartData.getFieldData(data, 'waterConsumption', 1000);

      const sewerConsumption = chartData.getFieldData(data, 'sewerConsumption', 1000);

      // water chart
      new Chart(document.querySelector('canvas[data-chart-water]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Count Multipliers',
            data: chartData.getFieldData(data, 'waterMultipliersCount'),
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.1).rgbString()
          }, {
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Revenue Multipliers',
            data: chartData.getFieldData(data, 'waterMultipliersRevenue'),
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

      // sewer chart
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

      // consumption chart
      new Chart(document.querySelector('canvas[data-chart-consumption]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Water',
            data: waterConsumption,
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.5).rgbString()
          }, {
            label: 'Sewer',
            data: sewerConsumption,
            borderWidth: 1,
            borderColor: colors.red,
            backgroundColor: color(colors.red).alpha(0.5).rgbString()
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Water & Sewer Consumption'
          },
          responsive: true,
          aspectRatio: 3,
          tooltips: {
            mode: 'index'
          },
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: '1000s Gallons'
              }
            }]
          }
        }
      });

    });
}(this.chartData, this.Chart));
