var DragResize = (function() {

  var $window         = window,
	$document         = document,
	$addEventListener = 'addEventListener',
	$offset           = 'offset',
	$client           = 'client',
	$scroll           = 'scroll',
	$min              = 'min',
	$left             = 'Left',
	$top              = 'Top',
	$width            = 'Width',
	$height           = 'Height',
	$drag             = 'drag',
	$resize           = 'resize',
	$handle           = 'Handle',
	$true             = true,
	$false            = false,
	$null             = null;

  var $body          = $document.body,
	$documentElement = $document.documentElement;

  var $methodWrapper = function(method, scope)
  {
    return function() { return method.apply(scope, arguments) };
  },
  $addEvent = function(element, type, proc, scope)
  {
    var listener = $methodWrapper(proc, scope);
    if(element[$addEventListener])
      element[$addEventListener](type, listener, $false);
    else
      element.attachEvent('on' + type, listener);
    return { $element: element, $type: type, $listener: listener };
  },
  $removeEvent = function(info)
  {
    if(info.$element[$addEventListener])
      info.$element.removeEventListener(info.$type, info.$listener, $false);
    else
      info.$element.detachEvent('on' + info.$type, info.$listener);
  },
  $stopEvent = function(event)
  {
    if(event.stopPropagation)
      event.stopPropagation();
    if(event.preventDefault)
      event.preventDefault();
    event.cancelBubble = $true;
    event.returnValue  = $false;
  },
  $getElement = function(id)
  {
    return typeof id === 'string' ? $document.getElementById(id) : id;
  };

  if(typeof $window.pageXOffset === 'number') {
    var $getScroll = function() {
      return { x: $window.pageXOffset, y: $window.pageYOffset };
    };
  } else if($documentElement && $documentElement[$client+$width]) {
    var $getScroll = function() {
      return { x: $documentElement[$scroll+$left], y: $documentElement[$scroll+$top] };
    };
  } else {
    var $getScroll = function() {
      return { x: $body[$scroll+$left], y: $body[$scroll+$top] };
    };
  }

  if($window.innerWidth) {
    var $getWindowSize = function() {
      return { x: $window.innerWidth, y: $window.innerHeight };
    };
  } else if($documentElement && $documentElement[$client+$width]) {
    var $getWindowSize = function() {
      return { x: $documentElement[$client+$width], y: $documentElement[$client+$height] };
    };
  } else if($body) {
    var $getWindowSize = function() {
      return { x: $body[$offset+$width], y: $body[$client+$height] };
    };
  }

  var DragResize = function(container, options)
  {
    options                  = options || {};
    container                = $getElement(container);
    options[$drag+$handle]   = $getElement(options[$drag+$handle]);
    options[$resize+$handle] = $getElement(options[$resize+$handle]);
    this.$container      = container;
    this.$minWidth       = options[$min+$width];
    this.$minHeight      = options[$min+$height];
    this[$scroll]        = options[$scroll];
    this.$events         = [];
    if(options[$drag+$handle] || options[$resize+$handle] != container)
    {
      this.$dragHandle = options[$drag+$handle] || container;
      this.$events.push($addEvent(this.$dragHandle, 'mousedown', this.$drag_onMouseDown, this));
      this.$events.push($addEvent(this.$dragHandle, 'click',     $stopEvent,             $window));
    }
    if(this.$dragHandle != container || (options[$resize+$handle] && options[$resize+$handle] != this.$dragHandle))
    {
      this.$resizeHandle = options[$resize+$handle] || container;
      this.$events.push($addEvent(this.$resizeHandle, 'mousedown', this.$resize_onMouseDown, this));
      this.$events.push($addEvent(this.$resizeHandle, 'click',     $stopEvent,               $window));
    }
  };

  DragResize[$min+$width]    = 100;
  DragResize[$min+$height]   = 100;
  DragResize.$dragInfo        = $null;
  DragResize.$ie              = $window.ActiveXObject ? $true : $false;

  DragResize.$onMouseMove = function(event)
  {
    var info = this.$dragInfo;
    if(!info)
      return;
    if(DragResize.$ie && !(event.button & 1))
    {
      this.$finish();
      return;
    }
    info.$currentX = event.clientX;
    info.$currentY = event.clientY;
    if(this.$ie)
    {
      $stopEvent(event);
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
    this.$dragInfo = $null;
  };

  DragResize.prototype = {

    $drag_onMouseDown : function(event)
    {
      $stopEvent(event);
      var info    = DragResize.$dragInfo = this.$beginDrag(event, 'drag', this.$drag_onInterval),
		container = this.$container;
      info.$baseX = container[$offset+$left];
      info.$baseY = container[$offset+$top];
      info.$minX  = 0;
      info.$minY  = 0;
      info.$maxX  = $documentElement[$scroll+$width]  - container[$offset+$width];
      info.$maxY  = $documentElement[$scroll+$height] - container[$offset+$height];
    },

    $drag_onInterval : function()
    {
      this.$updateDrag(function(info, container, x, y, scroll) {
        container.style.left = x + 'px';
        container.style.top  = y + 'px';
        if(this[$scroll])
        {
          var frameSize = $getWindowSize(),
			right       = x + container[$offset+$width], bottom = y + container[$offset+$height],
			sx          = scroll.x, sy = scroll.y;
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
            $window[$scroll](sx, sy);
        }
      });
    },

    $resize_onMouseDown : function(event)
    {
      $stopEvent(event);
      var info      = DragResize.$dragInfo = this.$beginDrag(event, 'resize', this.$resize_onInterval),
		container   = this.$container,
		minWidth    = (typeof this.$minWidth  === 'number' ? this.$minWidth  : DragResize[$min+$width]),
		minHeight   = (typeof this.$minHeight === 'number' ? this.$minHeight : DragResize[$min+$height]);
      info.$baseX   = container[$offset+$left] + container[$offset+$width];
      info.$baseY   = container[$offset+$top]  + container[$offset+$height];
      info.$adjustX = container[$offset+$width]  - container[$client+$width];
      info.$adjustY = container[$offset+$height] - container[$client+$height];
      info.$minX    = container[$offset+$left] + info.$adjustX + minWidth;
      info.$minY    = container[$offset+$top]  + info.$adjustY + minHeight;
      info.$maxX    = $documentElement[$scroll+$width];
      info.$maxY    = container.style.position != 'absolute' ? 65536 : $documentElement[$scroll+$height];
    },

    $resize_onInterval : function()
    {
      this.$updateDrag(function(info, container, x, y, scroll) {
        container.style.width  = (x - container[$offset+$left] - info.$adjustX) + 'px';
        container.style.height = (y - container[$offset+$top]  - info.$adjustY) + 'px';
        if(this[$scroll])
        {
          var frameSize = $getWindowSize(),
			left        = container[$offset+$left], top = container[$offset+$top],
			sx          = scroll.x, sy = scroll.y;
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
            $window[$scroll](sx, sy);
        }
      });
    },

    $beginDrag : function(event, mode, updateProc)
    {
      $stopEvent(event);
      DragResize.$finish();
      var container = this.$container, scroll = $getScroll(),
		mouseX = event.clientX, mouseY = event.clientY,
		scrollX = scroll.x, scrollY = scroll.y;
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
      var info = DragResize.$dragInfo, scroll = $getScroll();
      if(info.$currentX   != info.$prevX || info.$currentY   != info.$prevY ||
         info.$currentScX != scroll.x    || info.$currentScY != scroll.y)
      {
        var container = this.$container,
          x = Math.min(Math.max(info.$baseX + info.$currentX - info.$clickX + scroll.x - info.$baseScX, info.$minX), info.$maxX),
          y = Math.min(Math.max(info.$baseY + info.$currentY - info.$clickY + scroll.y - info.$baseScY, info.$minY), info.$maxY);
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
      this.$container    = $null;
      this.$dragHandle   = $null;
      this.$resizeHandle = $null;
    }

  };

  $addEvent($document, 'mouseup',   DragResize.$onMouseUp,   DragResize);
  $addEvent($document, 'mousemove', DragResize.$onMouseMove, DragResize);

  return DragResize;

})();
