/**
 * Water service stats
 */
(function (document, appMain, Chart, ChartDataLabels) {
  // colors for charts
  const color = Chart.helpers.color;
  const colors = appMain.colors;

  const labels = ['3/4"', '1"', '1 1/2"', '2"', '3"', '4"'];

  const borderWidth = 1;

  const borderColor = [
    colors.red,
    colors.green,
    colors.blue,
    colors.yellow,
    colors.maroon,
    colors.olive,
    colors.purple
  ];

  const backgroundColor = [
    color(colors.red).alpha(0.5).rgbString(),
    color(colors.green).alpha(0.5).rgbString(),
    color(colors.blue).alpha(0.5).rgbString(),
    color(colors.yellow).alpha(0.5).rgbString(),
    color(colors.maroon).alpha(0.5).rgbString(),
    color(colors.olive).alpha(0.5).rgbString(),
    color(colors.purple).alpha(0.5).rgbString()
  ];

  const services = appMain.multipliers.reduce((map, obj) => {
    map[obj[0]] = 0;
    return map;
  }, {});

  const multipliers = appMain.multipliers.reduce((map, obj) => {
    map[obj[0]] = [obj[2]];
    return map;
  }, {});

  const serviceTypes = {
    '47J': 0,
    CITY: 0,
    COMM: 0,
    COMM_MULTI: 0,
    GOV: 0,
    IND: 0,
    NOPRT: 0,
    RES: 0,
    RES_MULTI: 0
  };

  appMain.getServicesData({
    where: `WSC_TYPE = 'BILLABLE'`,
    outFields: ['METER_SIZE_D', 'IN_CITY'],
  })
    .then(results => {
      // console.log(results);
      let total = 0;
      let city = 0;
      let notCity = 0;

      results.features.forEach(feat => {
        const atts = feat.attributes;
        // exists in system but not in ground yet
        if (!atts.METER_SIZE_D) {
          return;
        }
        total++;
        atts.IN_CITY ? city++ : notCity++;
        services[atts.METER_SIZE_D]++;
      });

      new Chart(document.querySelector('canvas[data-chart-water-services]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Services By Size',
            data: [
              services['0.75'],
              services['1'],
              services['1.5'],
              services['2'],
              services['3'],
              services['4']
            ],
            borderWidth,
            borderColor,
            backgroundColor
          }]
        },
        plugins: [ChartDataLabels],
        options: {
          title: {
            display: true,
            text: 'Services By Size'
          },
          legend: {
            display: false
          },
          responsive: true,
          aspectRatio: 3,
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'end',
              offset: 4
            }
          }
        }
      });
      document.querySelector('*[data-water-services-count]').innerHTML = total;

      new Chart(document.querySelector('canvas[data-chart-water-multipliers]').getContext('2d'), {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Multipliers By Size',
            data: [
              (services['0.75'] * multipliers['0.75']).toFixed(1),
              (services['1'] * multipliers['1']).toFixed(1),
              (services['1.5'] * multipliers['1.5']).toFixed(1),
              (services['2'] * multipliers['2']).toFixed(1),
              (services['3'] * multipliers['3']).toFixed(1),
              (services['4'] * multipliers['4']).toFixed(1)
            ],
            borderWidth,
            borderColor,
            backgroundColor
          }]
        },
        plugins: [ChartDataLabels],
        options: {
          title: {
            display: true,
            text: 'Multipliers By Size'
          },
          legend: {
            display: false
          },
          responsive: true,
          aspectRatio: 3,
          plugins: {
            datalabels: {
              anchor: 'end',
              align: 'end',
              offset: 4
            }
          }
        }
      });
      document.querySelector('*[data-water-multipliers-count]').innerHTML = (
        (services['0.75'] * multipliers['0.75']) +
        (services['1'] * multipliers['1']) +
        (services['1.5'] * multipliers['1.5']) +
        (services['2'] * multipliers['2']) +
        (services['3'] * multipliers['3']) +
        (services['4'] * multipliers['4'])).toFixed(1);

      new Chart(document.querySelector('canvas[data-chart-water-city]').getContext('2d'), {
        type: 'doughnut',
        plugins: [ChartDataLabels],
        options: {
          legend: {
            display: true
          },
          title: {
            display: false,
            text: ''
          },
          tooltips: {},
          plugins: {
            datalabels: {
              color: colors.white
            }
          }
        },
        data: {
          labels: [
            'City Limits',
            'Not in City Limits'
          ],
          datasets: [{
            data: [
              city,
              notCity
            ],
            backgroundColor: [
              colors.blue,
              colors.red
            ]
          }]
        }
      });
    });

  appMain.getServicesData({
    where: `1 = 1`,
    outFields: ['ACCT_TYPE'],
  })
    .then(results => {
      results.features.forEach(feat => serviceTypes[feat.attributes.ACCT_TYPE]++);

      new Chart(document.querySelector('canvas[data-chart-water-service-types]').getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['Residential', ['Multi-Unit', 'Residential'], 'Commercial', ['Mixed Residential', 'Commercial'], 'Industrial', 'Non-Profit', ['Government', 'Public']],
          datasets: [{
            label: 'Water Service Types',
            data: [serviceTypes.RES, serviceTypes.RES_MULTI, serviceTypes.COMM, serviceTypes.COMM_MULTI, serviceTypes.IND, serviceTypes.NOPRT, (serviceTypes.GOV + serviceTypes['47J'])],
            borderWidth,
            borderColor,
            backgroundColor
          }]
        },
        plugins: [ChartDataLabels],
        options: {
          title: {
            display: false,
            text: 'Types'
          },
          legend: {
            display: false
          },
          responsive: true,
          aspectRatio: 3,
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
