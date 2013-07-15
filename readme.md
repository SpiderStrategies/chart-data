Parses and manipulates the chart data. We store data in this format:

```
{
  graph: {
    title:
    datasequences: [ {
        title: <csv row 1, column n + 1>
        datapoints: [ {
            title:
            value:
          }, ...
        ]
      }
      ...
    ]
  }
}
```

For most services, we fetch two years worth of data. When the data is sent into the line chart, it needs to be in this format.

```
  [
    {
      title: 'Data sequence 1',
      datapoints: [ {title: 'Point 1', value: 1}, ... ]
    },
    ...
  ]
```

The original data is split into multiple datasequences based on its timeframe, which can be weekly, monthly, or yearly.
