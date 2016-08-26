var gradient = new Chartist.FillGradient();
gradient.setGradientStartColor('#FF0C00');
gradient.setGradientEndColor('#0100FC');

var gradient2 = new Chartist.FillGradient();
gradient2.setGradientStartColor('#FF0C00');
gradient2.setGradientEndColor('#0100FC');

var fillLines = new Chartist.FillLines();
fillLines.setLineSpace(10);
fillLines.setLinesOffset(4);
fillLines.setLinesOffsetY(2);
fillLines.setLinesOffsetLine(3);
fillLines.setShadowGradient('#FFFFFF', '#000000');
fillLines.setLinesGradient(gradient2);

new Chartist.Line('.ct-chart', {
  labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  series: [
    //[null, 1, 9, 2, 7, null, 4, null, null, 5, 4, null]
    [10, null, 1, 1, null, null, null, null, null, null, null, null]
    //[null, null, null, null, null, null, null, null, null, null, null, 1]
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
  lineScratchSize: 50,

  fillEmptySpace: fillLines

});
