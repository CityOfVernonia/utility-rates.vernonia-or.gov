/**
 * Calculate a utility bill
 */
(function (document, chartData, Chart, ChartDataLabels) {

  let chart;

  const colors = chartData.colors;

  const multipliers = chartData.multipliers.reduce((map, obj) => {
    map[obj[0]] = [obj[2], obj[3]];
    return map;
  }, {});

  const rates = chartData.rates[chartData.currentFiscalYear];

  const form = document.querySelector('form[data-bill-calculator]');

  form.addEventListener('submit', evt => {
    evt.preventDefault();

    if (chart) {
      chart.destroy();
    }

    const t = evt.target;
    const waterMultiplier = multipliers[t.size.value][0];
    const sewerMultiplier = multipliers[t.size.value][1];

    const bill = {
      waterBase: waterMultiplier * rates.wBase,
      waterConsumption: t.water.value / 1000 * rates.wCon,
      waterLoan: waterMultiplier * rates.wLoan,
      sewerBase: sewerMultiplier * rates.sBase,
      sewerConsumption: t.sewer.value / 1000 * rates.sCon,
      sewerLoan: sewerMultiplier * rates.sLoan,
      parks: t.parkunits.value * rates.parks
    };

    let total = 0;

    for (let b in bill) {
      total = total + bill[b];
    }
    
    document.querySelector('div[data-bill-results]').innerHTML = `
      <p style="color:${colors.blue};">Water Base: $${bill.waterBase.toFixed(2)}</p>
      <p style="color:${colors.green};">Water Consumption: $${bill.waterConsumption.toFixed(2)}</p>
      <p style="color:${colors.teal};">Water Loan: $${bill.waterLoan.toFixed(2)}</p>
      <p style="color:${colors.red};">Sewer Base: $${bill.sewerBase.toFixed(2)}</p>
      <p style="color:${colors.orange};">Sewer Consumption: $${bill.sewerConsumption.toFixed(2)}</p>
      <p style="color:${colors.maroon};">Sewer Loan: $${bill.sewerLoan.toFixed(2)}</p>
      <p style="color:${colors.yellow}; border-bottom:1px solid #98978B; padding-bottom: 1rem;">Parks: $${bill.parks.toFixed(2)}</p>
      <p>Total: $${total.toFixed(2)}</p>
    `;

    chart = new Chart(document.querySelector('canvas[data-bill-chart]').getContext('2d'), {
      type: 'doughnut',
      plugins: [ChartDataLabels],
      options: {
        responsive: true,
        aspectRatio: 1,
        legend: {
          display: false
        },
        title: {
					display: true,
					text: `Utility Bill - $${total.toFixed(2)}`
        },
        tooltips: {
          mode: 'index',
          callbacks: {
            label: (info, data) => {
              const idx = info.index;
              const value = data.datasets[0].data[idx];
              const percent = value / total * 100;
              return `${data.labels[idx]} $${value.toFixed(2)} (${percent.toFixed(1)}%)`;
            }
          }
        },
        plugins: {
          datalabels: {
            color: colors.white,
            formatter: function (value) {
              return `$${value.toFixed(2)}`;
            }
          }
        }
      },
			data: {
        labels: [
          'Water Base',
          'Water Consumption',
          'Water Loan',
          'Sewer Base',
          'Sewer Consumption',
          'Sewer Loan',
          'Parks'
        ],
        datasets: [{
          data: [
            bill.waterBase,
            bill.waterConsumption,
            bill.waterLoan,
            bill.sewerBase,
            bill.sewerConsumption,
            bill.sewerLoan,
            bill.parks
          ],
          backgroundColor: [
            colors.blue,
            colors.green,
            colors.teal,
            colors.red,
            colors.orange,
            colors.maroon,
            colors.yellow
          ]
        }]
      }
    }); // end chart

  });

  // submit form for default bill and chart
  document.querySelector('.calc-bill-submit').click();
}(this.document, this.chartData, this.Chart, this.ChartDataLabels));
