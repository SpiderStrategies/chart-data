var assert = require('assert')
  , manipulator = require('../lib')
  , _ = require('lodash')

describe('Manipulates chart data', function () {

  it('fetches the datasequence with the most datapoints', function () {
    var points = require('./missing-points')
      , sequences = points.graph.datasequences

    assert.equal(sequences[0].datapoints.length, 4)
    assert.equal(sequences[1].datapoints.length, 5)

    var xValues = manipulator.xValues(points.graph.datasequences)

    assert.equal(xValues.length, 5)
    assert.deepEqual(xValues, ['2008', '2009', '2011', '2012', '2010'])

    var dualMissing = require('./missing-multiple-points')
    xValues = manipulator.xValues(dualMissing.graph.datasequences)
    assert.equal(xValues.length, 5)
    assert.deepEqual(xValues, ['2008', '2009', '2011', '2012', '2010'])
  })

  it('turns graph data into line chart datapoints array', function () {
    var missing = require('./missing-points')
      , chartData = manipulator.chartData(missing)

    assert.equal(chartData.length, 2)
    assert.equal(chartData[0].title, 'X-Cola!')
    assert.equal(chartData[0].datapoints.length, 4)
    assert.deepEqual(_.pluck(chartData[0].datapoints, 'value'), [12, 2, 27.9, 45])

    assert.equal(chartData[1].title, 'Y-Cola')
    assert.equal(chartData[1].datapoints.length, 5)
    assert.deepEqual(_.pluck(chartData[1].datapoints, 'title'), ['2008', '2009', '2011', '2012', '2010'])
    assert.deepEqual(_.pluck(chartData[1].datapoints, 'value'), [18.4, 20.1, 26.1, 29, 24.8])
  })

  it('determines the duration set based on a timeframe', function () {
    var ga = require('./two-years')

    var weekly = manipulator.durations(ga, 'weekly')
      , monthly = manipulator.durations(ga, 'monthly')
      , yearly = manipulator.durations(ga, 'yearly')

    assert.equal(weekly.start.valueOf(), 1371787200000)
    assert.equal(weekly.middle.valueOf(), 1371182400000)
    assert.equal(weekly.end.valueOf(), 1370577600000)

    assert.equal(monthly.start.valueOf(), 1371787200000)
    assert.equal(monthly.middle.valueOf(), 1369368000000)
    assert.equal(monthly.end.valueOf(), 1366948800000)

    assert.equal(yearly.start.valueOf(), 1371787200000)
    assert.equal(yearly.middle.valueOf(), 1340251200000)
    assert.equal(yearly.end.valueOf(), 1308715200000)
  })

  it('splits graph data into line chart datapoints based on a timeframe', function () {
    var ga = require('./two-years')
      , chartData = manipulator.chartData(ga, 'weekly')

    assert.equal(chartData.length, 2)

    assert.equal(chartData[0].title, 'this week')
    assert.equal(chartData[1].title, 'last week')

    assert.equal(chartData[0].datapoints.length, 7)
    assert.equal(chartData[1].datapoints.length, 7)

    assert.equal(chartData[0].datapoints[0].title, 1371268800000)
    assert.equal(chartData[0].datapoints[6].title, 1371787200000)
    assert.equal(chartData[1].datapoints[0].title, 1371268800000)
    assert.equal(chartData[1].datapoints[6].title, 1371787200000)


    chartData[0].datapoints.forEach(function (datapoint, i) {
      assert.equal(datapoint.title, chartData[1].datapoints[i].title)
    })

    chartData = manipulator.chartData(ga, 'monthly')

    assert.equal(chartData[0].datapoints.length, 28)
    assert.equal(chartData[1].datapoints.length, 28)

    chartData = manipulator.chartData(ga, 'yearly')

    assert.equal(chartData[0].datapoints.length, 365)
    assert.equal(chartData[1].datapoints.length, 365)


  })

  it('determines timeframe keys', function () {
    assert.equal(manipulator.key('weekly'), 'week')
    assert.equal(manipulator.key('monthly'), 'month')
    assert.equal(manipulator.key('yearly'), 'year')
  })

})
