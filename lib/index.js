var _ = require('lodash')
  , moment = require('moment')

/*
 * Determines the key to be used when splitting data into groups
 */
module.exports.key = function (timeframe) {
  if (timeframe === 'weekly') {
    return 'week'
  } else if (timeframe == 'monthly') {
    return 'month'
  } else {
    return 'year'
  }
}

/*
 * Determines the start and end datapoints, along with the date we should
 * use for splitting datasets
 */
module.exports.durations = function (data, timeframe) {
  // Grab the most recent datapoint for the primary dataset
  var start = _.last(data.graph.datasequences[0].datapoints).title
    , end, middle

  // Determine the end and middle value we'll use.
  if (timeframe === 'weekly') {
    middle = moment(start).subtract('days', 7)
    end = moment(start).subtract('days', 7 * 2)
  } else if (timeframe === 'monthly') {
    middle = moment(start).subtract('days', 28)
    end = moment(start).subtract('days', 28 * 2)
  } else {
    middle = moment(start).subtract('days', 365)
    end = moment(start).subtract('days', 365 * 2)
  }

  return {
    start: moment(start),
    middle: middle,
    end: end
  }
}

/*
 * Returns the dataset that has the most datapoints
 */
module.exports.xValues = function (datasets) {
  return  _.union.apply(_, datasets.map(function (set) {
    return _.pluck(set.datapoints, 'title')
  }))
}

/*
 * Receives the datasequences and adjusts the title (x-coord) based on the timeframe
 * so the data is on the same chart
 */
module.exports.adjustTitles = function (datasequences, timeframe) {
  var scale
  if (timeframe === 'weekly') {
    scale = 604800000 // 7 days in millis
  } else if (timeframe === 'monthly') {
    scale = 2419200000 // 28 days in millis
  } else {
    scale = 31536000000 // 365 days in millis
  }

  datasequences[1].datapoints = datasequences[1].datapoints.map(function (datapoint) {
    var point = _.clone(datapoint)
    point.title += scale
    return point
  })

  return datasequences
}

/*
 * Sorts the datapoints so they are in the order of our master xValues set of values
 */
module.exports.sort = function (datasequences) {
  var xValues = exports.xValues(datasequences)
  return datasequences.map(function (datasequence) {
    return {
      title: datasequence.title,
      datapoints: _.compact(xValues.map(function (d) {
        return _.find(datasequence.datapoints, function (point) {
          return point.title === d
        })
      }))
    }
  })
}

/*
 * Receives an entire graph of data and returns chart data, based on a timeframe
 */
module.exports.chartData = function (data, timeframe) {
  if (!timeframe) {
    return exports.sort(data.graph.datasequences)
  }

  var durations = exports.durations(data, timeframe)

  return exports.adjustTitles([{
      title: 'this ' + exports.key(timeframe),
      datapoints: data.graph.datasequences[0].datapoints.filter(function (datapoint) {
        return datapoint.title > durations.middle
      })
    }, {
      title: 'last ' + exports.key(timeframe),
      datapoints: data.graph.datasequences[0].datapoints.filter(function (datapoint) {
        return datapoint.title <= durations.middle && datapoint.title > durations.end
      })
    }], timeframe)
}
