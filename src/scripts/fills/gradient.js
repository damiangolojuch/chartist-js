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

  var defaultOptions = {

  };

  function isArray(variable)
  {
    return Object.prototype.toString.call(variable) == '[object Array]';
  }

  function getOption(name, validateType)
  {
    switch (validateType)
    {
      case 'array':
        return (defaultOptions[name] && defaultOptions[name] && isArray(defaultOptions[name]));
      default:
        return defaultOptions[name];
    }
  }

  function makeid(length)
  {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    length = length || 5;

    for( var i=0; i < length; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  function gradientSteps(startColor, endColor, steps) {
    startColor = startColor.substring(1, 7);
    endColor = endColor.substring(1, 7);

    var hex = function(x) {
      x = x.toString(16);
      return (x.length == 1) ? '0' + x : x;
    };

    var calculateStep = function(startColor, endColor, ratio) {
      var r = Math.ceil(parseInt(startColor.substring(0,2), 16) * ratio + parseInt(endColor.substring(0,2), 16) * (1-ratio));
      var g = Math.ceil(parseInt(startColor.substring(2,4), 16) * ratio + parseInt(endColor.substring(2,4), 16) * (1-ratio));
      var b = Math.ceil(parseInt(startColor.substring(4,6), 16) * ratio + parseInt(endColor.substring(4,6), 16) * (1-ratio));

      return hex(r) + hex(g) + hex(b);
    };

    var colors = [];
    for(var ratio = 0, i = 1; ratio <= 1; ratio=i/(steps-1), i++)
    {
      colors.push('#' + calculateStep(startColor, endColor, ratio));
    }

    return colors;
  }

  function addStop(stops, className, offset, stopColor, stopOpacity)
  {
    stops.push({
      className: className,
      offset: offset,
      stopColor: stopColor || '#000',
      stopOpacity: (+stopOpacity === stopOpacity)? stopOpacity : 1
    });
  }

  function createGradient(svgElement, stops, cords)
  {
    var gradientId = 'gradient_' + makeid(20);

    var defs = svgElement.querySelector('defs');

    if (!defs)
    {
      defs = svgElement.elem('defs');
    }

    var gradient = defs.elem('linearGradient', {
      id: gradientId,
      x1: cords.x1,
      y1: cords.y1,
      x2: cords.x2,
      y2: cords.y2
    });

    stops.forEach(function (stop) {
      gradient.elem('stop', {
        offset: stop.offset,
        class: stop.className,
        style: 'stop-color:' + stop.stopColor + '; stop-opacity:' + stop.stopOpacity
      });
    });
    return gradientId;
  }

  function createGradients(svgElement, segmentsCount)
  {
    var gradientsId = [];

    var gradientsColors = gradientSteps(this.gradientStartColor, this.gradientEndColor, segmentsCount+1);

    for (var i = 0; i < segmentsCount; i++)
    {
      var stops = [];
      addStop(stops, 'stop1', '0%', gradientsColors[i], this.gradientStartOpacity);
      addStop(stops, 'stop1', '100%', gradientsColors[i+1], this.gradientEndOpacity);

      gradientsId.push(createGradient(svgElement, stops, this.cords));
    }

    return gradientsId;
  }

  function fillGradient(x1, y1, x2, y2)
  {
    this.cords =
    {
      x1: x1 || '0%',
      x2: x2 || '100%',
      y1: y1 || '0%',
      y2: y2 || '0%'
    };

    this.gradientStartColor = '#000000';
    this.gradientEndColor = '#FFFFFF';

    this.gradientStartOpacity = 1;
    this.gradientEndOpacity = 1;
  }

  function setGradientStartColor(color)
  {
    this.gradientStartColor = color || this.gradientStartColor;
  }

  function setGradientEndColor(color)
  {
    this.gradientEndColor = color || this.gradientEndColor;
  }

  function setGradientStartOpacity(opacity)
  {
    this.gradientStartOpacity = (+opacity === opacity)? opacity : this.gradientStartOpacity;
  }

  function setGradientEndOpacity(opacity)
  {
    this.gradientEndOpacity = (+opacity === opacity)? opacity : this.gradientEndOpacity;
  }

  // Creating line chart type in Chartist namespace
  Chartist.FillGradient = Chartist.Class.extend({
    constructor: fillGradient,
    createGradients: createGradients,
    setGradientStartColor: setGradientStartColor,
    setGradientEndColor: setGradientEndColor,
    setGradientStartOpacity: setGradientStartOpacity,
    setGradientEndOpacity: setGradientEndOpacity
  });

}(window, document, Chartist));
