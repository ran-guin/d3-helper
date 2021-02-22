module.exports = {
  gdp: {
    dataset: [
      {country: "USA", gdp: 20.5 },
      {country: "China", gdp: 13.4 },
      {country: "Germany", gdp: 4.0 },
      {country: "Japan", gdp: 4.9 },
      {country: "France", gdp: 2.8 }
    ],
    xAxis: 'country',
    yAxis: 'gdp',
    title: 'Country Data'
  },

  covid: {
    dataset: [
      {country: "USA", date: '2020-01', cases: 20.5 },
      {country: "China", date: '2020-01', cases: 13.4 },
      {country: "Germany", date: '2020-01', cases: 4.0 },
      {country: "Japan", date: '2020-01', cases: 4.9 },
      {country: "France", date: '2020-01', cases: 2.8 },

      {country: "USA", date: '2020-02', cases: 2.5 },
      {country: "China", date: '2020-02', cases: 1.4 },
      {country: "Germany", date: '2020-02', cases: 4.0 },
      {country: "Japan", date: '2020-02', cases: 4.9 },
      {country: "France", date: '2020-02', cases: 2.8 },

      {country: "USA", date: '2020-03', cases: 12.5 },
      {country: "China", date: '2020-03', cases: 12.4 },
      {country: "Germany", date: '2020-03', cases: 4.0 },
      {country: "Japan", date: '2020-03', cases: 4.9 },
      {country: "France", date: '2020-03', cases: 2.8 },

      {country: "USA", date: '2020-04', cases: 2.0 },
      {country: "China", date: '2020-04', cases: 1.4 },
      {country: "Germany", date: '2020-04', cases: 4.0 },
      {country: "Japan", date: '2020-04', cases: 4.9 },
      {country: "France", date: '2020-04', cases: 2.8 },

      {country: "USA", date: '2020-05', cases: 21.5 },
      {country: "China", date: '2020-05', cases: 14.4 },
      {country: "Germany", date: '2020-05', cases: 4.0 },
      {country: "Japan", date: '2020-05', cases: 4.9 },
      {country: "France", date: '2020-05', cases: 2.8 },

      {country: "USA", date: '2020-06', cases: 2.5 },
      {country: "China", date: '2020-06', cases: 1.4 },
      {country: "Germany", date: '2020-06', cases: 4.0 },
      {country: "Japan", date: '2020-06', cases: 4.9 },
      {country: "France", date: '2020-06', cases: 2.8 }
    ],
    xAxis: 'country',
    yAxis: 'cases',
    split: 'date',
    title: 'Country Data'
  }
}
