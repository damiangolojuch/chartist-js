var gradient = new Chartist.FillGradient();
gradient.setGradientStartColor('#FF0C00');
gradient.setGradientEndColor('#0100FC');

new Chartist.Line('.ct-chart', {
  labels: [1, 2, 3, 4, 5, 6, 7, 8],
  series: [
    [1, 9, 7, null, null, 3, 5, 4]
  ]
}, {
  low: 0,
  showArea: true,
  areaShadow: true,
  axisY: {
    // If labels should be shown or not
    showLabel: 0,
    // If the axis grid should be drawn or not
    showGrid: 0
  },
  lineSmooth: false,

  areaFill: gradient,
  lineScratchSize: 50

});
