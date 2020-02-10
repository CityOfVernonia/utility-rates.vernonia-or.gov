/**
 * Creates data table
 */
(function (document, appMain, moment) {
  const waterTable = document.querySelector('tbody[data-water-table]');
  const waterData = [];

  const sewerTable = document.querySelector('tbody[data-sewer-table]');
  const sewerData = [];

  appMain.getData()
    .then(results => {

      results[0].data.forEach(d => {

        waterData.push(`
          <tr>
            <td>${d.year}</td>
            <td>${moment({ month: d.month }).format('MMM')}</td>
            <td>${d.fiscalYear}</td>
            <td>${parseInt(d.waterConsumption).toLocaleString()}</td>
            <td>${d.waterMultipliersCount}</td>
            <td>${d.waterMultipliersRevenue}</td>
            <td>$${parseInt(d.waterRevenueBase).toLocaleString()}</td>
            <td>$${parseInt(d.waterRevenueConsumption).toLocaleString()}</td>
            <td>$${parseInt(d.waterRevenueLoan).toLocaleString()}</td>
          </tr>
        `);

        sewerData.push(`
        <tr>
          <td>${d.year}</td>
          <td>${moment({ month: d.month }).format('MMM')}</td>
          <td>${d.fiscalYear}</td>
          <td>${d.sconYear}</td>
          <td>${parseInt(d.sewerConsumption).toLocaleString()}</td>
          <td>${d.sewerMultipliersCount}</td>
          <td>${d.sewerMultipliersRevenue}</td>
          <td>$${parseInt(d.sewerRevenueBase).toLocaleString()}</td>
          <td>$${parseInt(d.sewerRevenueConsumption).toLocaleString()}</td>
          <td>$${parseInt(d.sewerRevenueLoan).toLocaleString()}</td>
        </tr>
        `);

        console.log(x = d.waterConsumption)

      });

      waterTable.innerHTML = waterData.join('');
      sewerTable.innerHTML = sewerData.join('');

    });

}(this.document, this.appMain, this.moment));
