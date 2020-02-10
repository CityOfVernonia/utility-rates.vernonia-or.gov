/**
 * Multiplier and consumption charts
 */
(function (document, appMain, Chart) {
  // colors for charts
  const color = Chart.helpers.color;
  const colors = appMain.colors;

  // get data
  appMain.getData()
    .then(results => {
      const data = results[0].data;

      const labels = appMain.getMonthLabels(data);

      const waterConsumption = appMain.getFieldData(data, 'waterConsumption', 1000);

      const sewerConsumption = appMain.getFieldData(data, 'sewerConsumption', 1000);

      // water chart
      new Chart(document.querySelector('canvas[data-chart-water]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Count Multipliers',
            data: appMain.getFieldData(data, 'waterMultipliersCount'),
            borderWidth: 1,
            borderColor: colors.blue,
            backgroundColor: color(colors.blue).alpha(0.1).rgbString()
          }, {
            yAxisID: 'left-axis',
            type: 'line',
            label: 'Revenue Multipliers',
            data: appMain.getFieldData(data, 'waterMultipliersRevenue'),
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


      // scon year chart
      const sconDataSets = [];

      const sconColors = [
        colors.red,
        colors.blue,
        colors.green,
        colors.yellow
      ];

      let currentSconYearTotal;
      let currentSconYearProjection;

      appMain.uniqueValues(data, 'sconYear').forEach((sy, idx) => {
        const sconData = appMain.filterSconYear(data, sy);
        const yearData = appMain.getFieldData(sconData, 'sewerConsumption', 1000);

        if (sy === '2017') {
          yearData.unshift(null, null, null, null);
        }

        sconDataSets.push({
          label: sy,
          data: yearData,
          borderWidth: 1,
          borderColor: sconColors[idx],
          backgroundColor: color(sconColors[idx]).alpha(0.5).rgbString()
        });

        if (appMain.currentSconYear === sy) {
          currentSconYearTotal = appMain.sumField(sconData, 'sewerConsumption');
          currentSconYearProjection = currentSconYearTotal / yearData.length * 12;
        } 
      });

      new Chart(document.querySelector('canvas[data-chart-scon]').getContext('2d'), {
        type: 'bar',
        data: {
          labels: appMain.getSconYearOfLabels(),
          datasets: sconDataSets
        },
        options: {
          title: {
            display: true,
            text: `Sewer Consumption Year`
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

      document.querySelector('*[data-scon-total]').innerHTML = `
        ${parseInt(currentSconYearTotal * 1000).toLocaleString()} (${parseInt(currentSconYearProjection * 1000).toLocaleString()} projected)
      `;

    });
}(this.document, this.appMain, this.Chart));
