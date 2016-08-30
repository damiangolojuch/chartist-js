/**
 * //sample:
 * var gradient = new Chartist.FillGradient();
 * gradient.setGradientStartColor('#FF0C00');
 * gradient.setGradientEndColor('#0100FC');
 *
 *
 * options.areaFill = gradient;
 */
(function(window, document, Chartist){
  'use strict';

  function getLastPrevAreaElement(areaIndex)
  {
    if (areaIndex === 0) return null;

    var lastPrevAreaElement = this.areas[areaIndex - 1].pathElements;
    return lastPrevAreaElement[lastPrevAreaElement.length - 2];
  }

  function getFirstCurrentAreaElement(areaIndex)
  {
    return this.areas[areaIndex].pathElements[1];
  }

  function generatePathString(x1, x2, y1, y2)
  {
    var linesArea = [];

    var yDiff = y2 - y1;
    var xDiff = x2 - x1;
    var linesCountByX = Math.ceil((xDiff - this.linesOffset) / this.lineSpace);

    var xStep = this.lineSpace;
    var yStep = yDiff / (linesCountByX - 1);

    for (var i = 0; i < linesCountByX; i++)
    {
      var currentX = x1 + (i * xStep) + this.linesOffset;
      var currentY1 = y1 + (i * yStep) + this.linesOffsetY;


      var pString = ' M' + currentX + ',' + currentY1;
      pString += 'L'+ currentX + ',' + (this.chartMaxY - this.linesOffsetYBottom);
      linesArea.push(pString)
    }

    return linesArea.join('');
  }

  function generateAreaPathString(x1, x2, y1, y2)
  {
    var areaPathString = 'M'+ x1 +','+ this.chartMaxY;
    areaPathString += ' L'+ x1 +','+ y1;
    areaPathString += ' L'+ x2 +','+ y2;
    areaPathString += ' L'+ x2 +','+ this.chartMaxY;

    return areaPathString;
  }

  function generateLinesArea(areaIndex)
  {
    var lastPrevAreaElement = this.getLastPrevAreaElement(areaIndex);
    if (!lastPrevAreaElement) return null;

    var firstCurrentAreaElement = this.getFirstCurrentAreaElement(areaIndex);
    var areaString = this.generatePathString(lastPrevAreaElement.x, firstCurrentAreaElement.x, lastPrevAreaElement.y, firstCurrentAreaElement.y);

    return {
      area: areaString,
      origin: {
        x1: lastPrevAreaElement.x,
        x2: firstCurrentAreaElement.x,
        y1: lastPrevAreaElement.y,
        y2: firstCurrentAreaElement.y,
      },
      x1: lastPrevAreaElement.x + this.linesOffset,
      x2: firstCurrentAreaElement.x - this.linesOffset,
      y1: lastPrevAreaElement.y,
      y2: firstCurrentAreaElement.y,
    };
  }

  function createGradientShadow(serie, x1, x2, y1, y2)
  {
    if (!this.gradientColor1 || !this.gradientColor2) return;

    var shadowGradient = null;
    var pathName = window.location.pathname;

    var areaPath = this.generateAreaPathString(x1 - this.linesOffset / 2, x2 + this.linesOffset / 2, y1, y2);

    shadowGradient = new Chartist.FillGradient('0%', '0%', '0%', '100%');
    shadowGradient.setGradientStartColor(this.gradientColor1);
    shadowGradient.setGradientEndColor(this.gradientColor2);
    shadowGradient.setGradientEndOpacity(0);
    var shadowGradientId = shadowGradient.createGradients(this.svg, 1)[0];

    var shadowAreaAttrs = {
      d: areaPath
    };

    shadowAreaAttrs.style = 'fill:url(' + pathName + '#' + shadowGradientId + ') !important;';
    serie.elem('path', shadowAreaAttrs, 'ct-fill-lines-shadow', true);
  }

  function createPathElement(serie, linesArea, gradient, $beforeRender)
  {
    if (!linesArea) return false;

    var emptyAreaAttrs = {
      d: linesArea.area
    };

    if (gradient)
    {
      emptyAreaAttrs.style = 'stroke:url(' + gradient + ') !important;';
    }

    if (typeof $beforeRender == 'function')
    {
      $beforeRender(serie, linesArea);
    }

    serie.elem('path', emptyAreaAttrs, 'ct-fill-lines-area', true).attr({}, Chartist.xmlNs.uri);
    return true;
  }

  function createLine(serie, linesArea, lineOffset)
  {
    if (!linesArea) return false;

    var styles = '';

    var attrs = {
      x1: linesArea.x1,
      x2: linesArea.x2,
      y1: linesArea.y1 + lineOffset,
      y2: linesArea.y2 + lineOffset,
      style: styles
    };

    serie.elem('line', attrs, 'ct-fill-lines-line', true).attr({}, Chartist.xmlNs.uri);
    return true;
  }

  function getMinY()
  {
    if (this.$$chartMinY) return this.$$chartMinY;

    var chartMinY = Number.MAX_VALUE;

    this.points.forEach(function (p)
    {
      if (p.y < chartMinY)
      {
        chartMinY = p.y;
      }
    });

    chartMinY = (chartMinY == Number.MAX_VALUE)? this.chartMinY : chartMinY;

    this.$$chartMinY = chartMinY;
    return this.$$chartMinY;
  }

  function hasSerieSpaceLeft()
  {
    return !this.serieValues[0] || (!this.serieValues[1] && this.serieValues[0]);
  }

  function fillChartSpaceLeft(serie)
  {
    var firstElement = (this.areas.length)? this.areas[0].pathElements[1]: null;

    var maxX = (firstElement)? firstElement.x : this.chartMaxX;
    var maxY = (firstElement)? firstElement.y : this.getMinY();

    var self = this;

    return this.preparePoints(this.chartMinX, maxX, this.getMinY(), maxY, function (x1, x2, y1, y2)
    {
      var pathString = self.generatePathString(x1, x2, y1, y2);

      var linesAreaOriginal = {
        area: pathString,
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2,
      };

      var linesArea = Chartist.extend({}, linesAreaOriginal);
      linesArea.x1 += self.linesOffset;
      linesArea.x2 -= self.linesOffset;

      createLine(serie, linesArea, self.linesOffsetLine);
      self.createGradientShadow(serie, linesArea.x1, linesArea.x2, linesArea.y1, linesArea.y2);
      createPathElement(serie, linesAreaOriginal, self.getNextGradient());
      self.emitEmptyPoints(serie, linesAreaOriginal, 'left');
    });
  }

  function hasSerieSpaceRight()
  {
    return !this.serieValues[ this.serieValues.length - 1 ];
  }

  function fillChartSpaceRight(serie)
  {
    var lastElement = this.areas[this.areas.length - 1].pathElements;
    lastElement = lastElement[lastElement.length - 2];

    var self = this;
    return this.preparePoints(lastElement.x, this.chartMaxX, lastElement.y, this.getMinY(), function (x1, x2, y1, y2)
    {
      var pathString = self.generatePathString(x1, x2, y1, y2);

      var linesAreaOriginal = {
        area: pathString,
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2,
      };

      var linesArea = Chartist.extend({}, linesAreaOriginal);
      linesArea.x1 += self.linesOffset;
      linesArea.x2 -= self.linesOffset;

      createLine(serie, linesArea, self.linesOffsetLine);
      self.createGradientShadow(serie, linesArea.x1, linesArea.x2, linesArea.y1, linesArea.y2);
      createPathElement(serie, linesAreaOriginal, self.getNextGradient());
      self.emitEmptyPoints(serie, linesAreaOriginal, 'right');

    });
  }

  function countLineAreas()
  {
    var _count = 0;
    var prevValue = null;

    for (var i = 0; i < this.serieValues.length; i++)
    {
      if (this.serieValues[i] === undefined && prevValue !== undefined) _count++;

      prevValue = this.serieValues[i];
    }

    return _count;
  }

  function emitEmptyPoints(serie, linesArea, type)
  {
    var step = this.axisX.stepLength;
    var start = linesArea.x1;
    var stop = linesArea.x2;

    start += (type == 'left')? 0 : step;
    stop += (type == 'right')? step : 0;

    for (var i = start; i < stop; i+= step)
    {
      this.emitter.emit('draw', {
        type: 'emptyPoint',
        x: i,
        group: serie
      });
    }

    this.emitter.emit('draw', {
      type: 'emptyLine',
      x1: linesArea.x1,
      x2: linesArea.x2,
      group: serie
    });
  }

  function preparePoints(x1, x2, y1, y2, $callback)
  {
    var areas = [],
      lastPoint = {
        x: x1,
        y: y1
      };

    for (var i = 0; i < this.points.length; i++)
    {
      var p = this.points[i];

      if (x1 < p.x && p.x < x2)
      {
        areas.push({
          x1: lastPoint.x,
          y1: lastPoint.y,
          x2: p.x,
          y2: p.y
        });

        lastPoint.x = p.x;
        lastPoint.y = p.y;
      }
    }

    if (areas.length === 0)
    {
      areas.push({
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
      });
    }
    else
    {
      areas.push({
        x1: lastPoint.x,
        y1: lastPoint.y,
        x2: x2,
        y2: y2
      });
    }

    if (typeof $callback == 'function')
    {
      for (var i in areas)
      {
        $callback(areas[i].x1, areas[i].x2, areas[i].y1, areas[i].y2);
      }
    }

    return areas;
  }

  function createFillLines(serie, areaIndex)
  {
    var self = this;

    if (!this.$$beforeFirstFillLines) this.beforeFirstFillLines();

    var linesArea = this.generateLinesArea(areaIndex);

    if ((this.isFirstArea(areaIndex) && this.hasSerieSpaceLeft()) || this.areas.length === 0)
    {
      this.fillChartSpaceLeft(serie);
    }

    if (this.isLastArea(areaIndex) && this.hasSerieSpaceRight())
    {
      this.fillChartSpaceRight(serie);
    }

    if (!linesArea) return;

    return this.preparePoints(linesArea.x1, linesArea.x2, linesArea.y1, linesArea.y2, function (x1, x2, y1, y2)
    {
      var linesArea = {
        area: self.generatePathString(x1, x2, y1, y2),
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2,
      };

      createLine(serie, linesArea, self.linesOffsetLine);
      createPathElement(serie, linesArea, self.getNextGradient(), function (serie, linesArea)
      {
        self.createGradientShadow(serie, linesArea.x1, linesArea.x2, linesArea.y1, linesArea.y2);
        self.emitEmptyPoints(serie, linesArea);
      });
    });

  }

  function beforeFirstFillLines()
  {
    this.$$beforeFirstFillLines = true;

    if (!this.linesGradient) return true;

    var _areasLength = this.countLineAreas() + 1;

    this.gradientsId = this.linesGradient.createGradients(this.svg, _areasLength);
    this.gradientsIdIterator = 0;
  }

  function getNextGradient()
  {
    if (!this.gradientsId[this.gradientsIdIterator]) return null;

    var pathName = window.location.pathname;

    this.gradientsIdIterator++;
    return pathName + '#' + this.gradientsId[this.gradientsIdIterator - 1];
  }

  function isFirstArea(areaIndex)
  {
    return areaIndex === 0;
  }

  function isLastArea(areaIndex)
  {
    return areaIndex === this.areasCount;
  }

  function fillLines()
  {
    this.lineSpace = 10;
    this.linesOffset = 6;
    this.linesOffsetY = 2;
    this.linesOffsetYBottom = 0;
    this.linesOffsetLine = 2;

    this.gradientColor1 = null;
    this.gradientColor2 = null;
  }

  function setChartValues(svg, emitter, axisX, axisY, areas, chartMinX, chartMaxX, chartMaxY, chartMinY)
  {
    this.svg = svg;
    this.emitter = emitter;
    this.areas = areas;
    this.areasCount = areas.length - 1;
    this.chartMaxY = chartMaxY;
    this.chartMinY = chartMinY;

    this.axisX = axisX;
    this.axisY = axisY;

    this.chartMinX = chartMinX;
    this.chartMaxX = chartMaxX;
  }

  function setSerieValues(values)
  {
    this.serieValues = values;
  }

  function setLineSpace(lineSpace)
  {
    this.lineSpace = lineSpace;
  }

  function setLinesOffset(linesOffset)
  {
    this.linesOffset = linesOffset;
  }

  function setLinesOffsetY(offset)
  {
    this.linesOffsetY = offset;
  }

  function setLinesOffsetYBottom(offset)
  {
    this.linesOffsetYBottom = offset;
  }

  function setLinesOffsetLine(offset)
  {
    this.linesOffsetLine = offset;
  }

  function setShadowGradient(color1, color2)
  {
    this.gradientColor1 = color1;
    this.gradientColor2 = color2;
  }

  function setLinesGradient(gradient)
  {
    this.linesGradient = gradient;
  }

  function setPoints(points)
  {
    this.points = points;
  }

  // Creating line chart type in Chartist namespace
  Chartist.FillLines = Chartist.Class.extend({
    constructor: fillLines,
    createFillLines: createFillLines,
    setLineSpace: setLineSpace,
    setLinesOffset: setLinesOffset,
    setLinesOffsetY: setLinesOffsetY,
    setLinesOffsetLine: setLinesOffsetLine,
    setLinesOffsetYBottom: setLinesOffsetYBottom,
    setChartValues: setChartValues,
    setShadowGradient: setShadowGradient,
    setSerieValues: setSerieValues,
    setLinesGradient: setLinesGradient,
    beforeFirstFillLines: beforeFirstFillLines,
    setPoints: setPoints,

    getLastPrevAreaElement: getLastPrevAreaElement,
    getFirstCurrentAreaElement: getFirstCurrentAreaElement,
    generateLinesArea: generateLinesArea,
    generatePathString: generatePathString,
    isFirstArea: isFirstArea,
    isLastArea: isLastArea,
    hasSerieSpaceLeft: hasSerieSpaceLeft,
    fillChartSpaceLeft: fillChartSpaceLeft,
    hasSerieSpaceRight: hasSerieSpaceRight,
    fillChartSpaceRight: fillChartSpaceRight,
    createGradientShadow: createGradientShadow,
    generateAreaPathString: generateAreaPathString,
    countLineAreas: countLineAreas,
    getNextGradient: getNextGradient,
    emitEmptyPoints: emitEmptyPoints,
    preparePoints: preparePoints,
    getMinY: getMinY
  });

}(window, document, Chartist));
