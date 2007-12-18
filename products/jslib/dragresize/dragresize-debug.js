var DragResize = (function() {

  var $methodWrapper = function(method, scope)
  {
    return function() { return method.apply(scope, arguments) };
  };

  var $addEvent = function(element, type, proc, scope, capture)
  {
    var listener = $methodWrapper(proc, scope);
    capture = typeof capture === 'undefined' ? false : capture;
    if(element.addEventListener)
      element.addEventListener(type, listener, capture);
    else
      element.attachEvent('on' + type, listener);
    return { $element: element, $type: type, $listener: listener, $capture: capture };
  };

  var $removeEvent = function(info)
  {
    if(info.$element.addEventListener)
      info.$element.removeEventListener(info.$type, info.$listener, info.$capture);
    else
      info.$element.detachEvent('on' + info.$type, info.$listener);
  };

  var $stopEvent = function(event)
  {
    if(event.stopPropagation)
      event.stopPropagation();
    if(event.preventDefault)
      event.preventDefault();
    event.cancelBubble = true;
    event.returnValue  = false;
  };

  var $getElement = function(id)
  {
    return typeof id === 'string' ? document.getElementById(id) : id;
  };

  if(typeof window.pageXOffset === 'number') {
    var $getScroll = function() {
      return { x: window.pageXOffset, y: window.pageYOffset };
    };
  } else if(document.documentElement && document.documentElement.clientWidth) {
    var $getScroll = function() {
      return { x: document.documentElement.scrollLeft, y: document.documentElement.scrollTop };
    };
  } else {
    var $getScroll = function() {
      return { x: document.body.scrollLeft, y: document.body.scrollTop };
    };
  }

  if(window.innerWidth) {
    var $getWindowSize = function() {
      return { x: window.innerWidth, y: window.innerHeight };
    };
  } else if(document.documentElement && document.documentElement.clientWidth) {
    var $getWindowSize = function() {
      return { x: document.documentElement.clientWidth, y: document.documentElement.clientHeight };
    };
  } else if(document.body) {
    var $getWindowSize = function() {
      return { x: document.body.offsetWidth, y: document.body.clientHeight };
    };
  }

  var DragResize = function(container, options)
  {
    options              = options || {};
    container            = $getElement(container);
    options.dragHandle   = $getElement(options.dragHandle);
    options.resizeHandle = $getElement(options.resizeHandle);
    this.$container      = container;
    this.$minWidth       = options.minWidth;
    this.$minHeight      = options.minHeight;
    this.$scroll         = options.scroll;
    this.$events         = [];
    if(options.dragHandle || options.resizeHandle != container)
    {
      this.$dragHandle = options.dragHandle || container;
      this.$events.push($addEvent(this.$dragHandle, 'mousedown', this.$drag_onMouseDown, this));
      this.$events.push($addEvent(this.$dragHandle, 'click',     $stopEvent,             window));
    }
    if(this.$dragHandle != container || (options.resizeHandle && options.resizeHandle != this.$dragHandle))
    {
      this.$resizeHandle = options.resizeHandle || container;
      this.$events.push($addEvent(this.$resizeHandle, 'mousedown', this.$resize_onMouseDown, this));
      this.$events.push($addEvent(this.$resizeHandle, 'click',     $stopEvent,               window));
    }
  };

  DragResize.minWidth         = 100;
  DragResize.minHeight        = 100;
  DragResize.$dragInfo        = null;
  DragResize.$ie              = window.ActiveXObject ? true : false;
  DragResize.preventSelection = DragResize.$ie ? true : false;

  DragResize.$onMouseMove = function(event)
  {
    var info = this.$dragInfo;
    if(!info)
      return true;
    if(DragResize.$ie && !(event.button & 1))
    {
      this.$finish();
      return true;
    }
    info.$currentX = event.clientX;
    info.$currentY = event.clientY;
    if(this.preventSelection)
    {
      $stopEvent(event);
      return false;
    }
    else
    {
      return true;
    }
  };

  DragResize.$onMouseUp = function(event)
  {
    var info = DragResize.$dragInfo;
    this.$finish();
  };

  DragResize.$finish = function()
  {
    var info = this.$dragInfo;
    if(info)
    {
      if(info.$intervalId)
        clearInterval(info.$intervalId);
    }
    this.$dragInfo = null;
  };

  DragResize.prototype = {

    $drag_onMouseDown : function(event)
    {
      $stopEvent(event);
      var info      = DragResize.$dragInfo = this.$beginDrag(event, 'drag', this.$drag_onInterval);
      var container = this.$container;
      info.$baseX   = container.offsetLeft;
      info.$baseY   = container.offsetTop;
      info.$minX    = 0;
      info.$minY    = 0;
      info.$maxX    = document.documentElement.scrollWidth  - container.offsetWidth;
      info.$maxY    = document.documentElement.scrollHeight - container.offsetHeight;
      return false;
    },

    $drag_onInterval : function()
    {
      this.$updateDrag(function(info, container, x, y, scroll) {
        container.style.left = x + 'px';
        container.style.top  = y + 'px';
        if(this.$scroll)
        {
          var frameSize = $getWindowSize();
          var right = x + container.offsetWidth, bottom = y + container.offsetHeight;
          var sx = scroll.x, sy = scroll.y;
          if(x < sx) {
            sx = x;
          } else if(right > (sx + frameSize.x)) {
            sx = right - frameSize.x;
          }
          if(y < sy) {
            sy = y;
          } else if(bottom > (sy + frameSize.y)) {
            sy = bottom - frameSize.y;
          }
          if(sx != scroll.x || sy != scroll.y)
            window.scroll(sx, sy);
        }
      });
    },

    $resize_onMouseDown : function(event)
    {
      $stopEvent(event);
      var info      = DragResize.$dragInfo = this.$beginDrag(event, 'resize', this.$resize_onInterval);
      var container = this.$container;
      var minWidth  = (typeof this.$minWidth  === 'number' ? this.$minWidth  : DragResize.minWidth);
      var minHeight = (typeof this.$minHeight === 'number' ? this.$minHeight : DragResize.minHeight);
      info.$baseX   = container.offsetLeft + container.offsetWidth;
      info.$baseY   = container.offsetTop  + container.offsetHeight;
      info.$adjustX = container.offsetWidth  - container.clientWidth;
      info.$adjustY = container.offsetHeight - container.clientHeight;
      info.$minX    = container.offsetLeft + info.$adjustX + minWidth;
      info.$minY    = container.offsetTop  + info.$adjustY + minHeight;
      info.$maxX    = document.documentElement.scrollWidth;
      info.$maxY    = container.style.position != 'absolute' ? 65536 : document.documentElement.scrollHeight;
      return false;
    },

    $resize_onInterval : function()
    {
      this.$updateDrag(function(info, container, x, y, scroll) {
        container.style.width  = (x - container.offsetLeft - info.$adjustX) + 'px';
        container.style.height = (y - container.offsetTop  - info.$adjustY) + 'px';
        if(this.$scroll)
        {
          var frameSize = $getWindowSize();
          var left = container.offsetLeft, top = container.offsetTop;
          var sx = scroll.x, sy = scroll.y;
          if(left < sx) {
            sx = left;
          }
          if(x > (sx + frameSize.x)) {
            sx = x - frameSize.x;
          }
          if(top < sy) {
            sy = top;
          }
          if(y > (sy + frameSize.y)) {
            sy = y - frameSize.y;
          }
          if(sx != scroll.x || sy != scroll.y)
            window.scroll(sx, sy);
        }
      });
    },

    $beginDrag : function(event, mode, updateProc)
    {
      $stopEvent(event);
      DragResize.$finish();
      var container = this.$container;
      var scroll = $getScroll();
      var mouseX = event.clientX, mouseY = event.clientY;
      var scrollX = scroll.x, scrollY = scroll.y;
      return {
        $mode:       mode,
        $manager:    this,
        $intervalId: setInterval($methodWrapper(updateProc, this), 30),
        $clickX:     mouseX,
        $clickY:     mouseY,
        $currentX:   mouseX,
        $currentY:   mouseY,
        $prevX:      mouseX,
        $prevY:      mouseY,
        $baseScX:    scrollX,
        $baseScY:    scrollY,
        $currentScX: scrollX,
        $currentScY: scrollY,
        $prevScX:    scrollX,
        $prevScY:    scrollY
      };
    },

    $updateDrag : function(proc)
    {
      var info   = DragResize.$dragInfo;
      var scroll = $getScroll();
      if(info.$currentX   != info.$prevX || info.$currentY   != info.$prevY ||
         info.$currentScX != scroll.x    || info.$currentScY != scroll.y)
      {
        var container = this.$container;
        var x = Math.min(Math.max(info.$baseX + info.$currentX - info.$clickX + scroll.x - info.$baseScX, info.$minX), info.$maxX);
        var y = Math.min(Math.max(info.$baseY + info.$currentY - info.$clickY + scroll.y - info.$baseScY, info.$minY), info.$maxY);
        proc.call(this, info, container, x, y, scroll);
        info.$prevX      = info.$currentX;
        info.$prevY      = info.$currentY;
        info.$currentScX = scroll.x;
        info.$currentScY = scroll.y;
      }
    },

    detach : function()
    {
      if(DragResize.$dragInfo && DragResize.$dragInfo.$manager == this)
        DragResize.$finish();
      while(this.$events.length > 0)
        $removeEvent(this.$events.pop());
      this.$container    = null;
      this.$dragHandle   = null;
      this.$resizeHandle = null;
    }

  };

  $addEvent(document, 'mouseup',   DragResize.$onMouseUp,   DragResize);
  $addEvent(document, 'mousemove', DragResize.$onMouseMove, DragResize);

  return DragResize;

})();
