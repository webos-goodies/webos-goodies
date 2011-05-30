(function() {

  var win   = window,
      doc   = document,
      docEl = document.documentElement,
      body  = document.body;

  function isNumber(value) {
    return typeof value == 'number';
  }

  function isFunction(value) {
    return typeof value == 'function';
  }

  function bind(method, scope) {
    return function() { return method.apply(scope, arguments) };
  }

  function addEvent(el, type, proc, scope) {
    var listener = bind(proc, scope);
    el.addEventListener ?
      el.addEventListener(type, listener, false) :
      el.attachEvent('on' + type, listener);
    return { el: el, type: type, listener: listener };
  }

  function removeEvent(info) {
    info.el.addEventListener ?
      info.el.removeEventListener(info.type, info.listener, false) :
      info.el.detachEvent('on' + info.type, info.listener);
  }

  function stopEvent(ev) {
    ev.stopPropagation && ev.stopPropagation();
    ev.preventDefault  && ev.preventDefault();
    ev.cancelBubble = true;
    ev.returnValue  = false;
  }

  function getElement(id) {
    return typeof id === 'string' ? doc.getElementById(id) : id;
  }

  function getScrollStd() {
    return { x: docEl.scrollLeft, y: docEl.scrollTop };
  }
  function getScrollN4() {
    return { x: win.pageXOffset, y: win.pageYOffset };
  }
  function getScrollQuirks() {
    return { x: body.scrollLeft, y: body.scrollTop };
  }
  var getScroll =
    (isNumber(win.pageXOffset) ? getScrollN4 :
     (docEl && docEl.clientWidth ? getScrollStd : getScrollQuirks));

  function getWindowSizeN4() {
    return { x: win.innerWidth, y: win.innerHeight };
  }
  function getWindowSizeStd() {
    return { x: docEl.clientWidth, y: docEl.clientHeight };
  }
  function getWindowSizeQuirks() {
    return { x: body.offsetWidth, y: body.clientHeight };
  }
  var getWindowSize =
    (win.innerWidth ? getWindowSizeN4 :
     (docEl && docEl.clientWidth ? getWindowSizeStd : getWindowSizeQuirks));

  /** @constructor */
  var DragResize = function(container, options) {
    options   = options || {};
    container = getElement(container);

    this.container        = container;
    this.minWidth         = options['minWidth'];
    this.minHeight        = options['minHeight'];
    this.scroll           = options['scroll'];
    this.onClickCallback  = options['onclick'];
    this.onDragCallback   = options['ondrag'];
    this.onFinishCallback = options['onfinish'];
    this.callbackScope    = options['scope'];
    this.ignoreTags       = {};
    this.events           = [];

    var dragHandle   = getElement(options['dragHandle']),
        resizeHandle = getElement(options['resizeHandle']);
    if(dragHandle || resizeHandle != container) {
      this.dragHandle = dragHandle || container;
      this.events.push(addEvent(this.dragHandle, 'mousedown', this.drag_onMouseDown, this));
      this.events.push(addEvent(this.dragHandle, 'click',     this.onClick,          this));
    }
    if(this.dragHandle != container || (resizeHandle && resizeHandle != this.dragHandle)) {
      this.resizeHandle = resizeHandle || container;
      this.events.push(addEvent(this.resizeHandle, 'mousedown', this.resize_onMouseDown, this));
      this.events.push(addEvent(this.resizeHandle, 'click',     this.onClick,            this));
    }

    var ignoreTags = options['ignoreTags'];
    if(typeof ignoreTags === 'string') {
      ignoreTags = [ignoreTags];
    }
    if(ignoreTags) {
      for(var i = 0 ; i < ignoreTags.length ; ++i) {
        this.ignoreTags[ignoreTags[i].toUpperCase()] = true;
      }
    }
  };

  DragResize['minWidth']  = 100;
  DragResize['minHeight'] = 100;
  DragResize.dragInfo     = null;
  DragResize.ie           = !!win.ActiveXObject;

  DragResize.onMouseMove = function(ev) {
    var info = DragResize.dragInfo;
    if(info) {
      if(DragResize.ie &&
         !(document.documentMode && document.documentMode >= 8) &&
         !(ev.button & 1)) {
        DragResize.finish();
      } else {
        info.currentX = ev.clientX;
        info.currentY = ev.clientY;
        DragResize.ie && stopEvent(ev);
        var self = info.manager;
        if(self && isFunction(self.onDragCallback)) {
          self.onDragCallback.call(
            self.callbackScope, self.container, info.currentX, info.currentY);
        }
      }
    }
  };

  DragResize.onMouseUp = function(ev) {
    var info = DragResize.dragInfo, scroll = getScroll();
    try {
      if(info) {
        var self = info.manager;
        if(self && isFunction(self.onClickCallback) &&
           info.clickX + info.baseScX == ev.clientX + scroll.x &&
           info.clickY + info.baseScY == ev.clientY + scroll.y) {
          self.onClickCallback.call(self.callbackScope, ev);
        }
      }
    } finally {
      DragResize.finish();
    }
  };

  DragResize.finish = function() {
    var info = DragResize.dragInfo;
    DragResize.dragInfo = null;
    if(info) {
      info.intervalId && clearInterval(info.intervalId);
      var self = info.manager;
      if(self && isFunction(self.onFinishCallback)) {
        self.onFinishCallback.call(
          self.callbackScope, self.container, info.currentX, info.currentY);
      }
    }
  };

  DragResize.prototype.drag_onMouseDown = function(ev) {
    if(this.checkIgnoreTags(ev))
      return;
    stopEvent(ev);
    var info      = DragResize.dragInfo = this.beginDrag(ev, this.drag_onInterval),
        container = this.container;
    info.baseX = container.offsetLeft;
    info.baseY = container.offsetTop;
    info.minX  = 0;
    info.minY  = 0;
    info.maxX  = docEl.scrollWidth  - container.offsetWidth;
    info.maxY  = docEl.scrollHeight - container.offsetHeight;
  };

  DragResize.prototype.drag_onInterval = function() {
    this.updateDrag(function(info, container, x, y, scroll) {
      container.style.left = x + 'px';
      container.style.top  = y + 'px';
      if(this.scroll) {
        var frameSize = getWindowSize(),
            right     = x + container.offsetWidth,
            bottom    = y + container.offsetHeight,
            sx        = scroll.x,
            sy        = scroll.y;
        x < sx ? (sx = x) : (right  > (sx + frameSize.x) && (sx = right  - frameSize.x));
        y < sy ? (sy = y) : (bottom > (sy + frameSize.y) && (sy = bottom - frameSize.y));
        (sx != scroll.x || sy != scroll.y) && win.scroll(sx, sy);
      }
    });
  };

  DragResize.prototype.resize_onMouseDown = function(ev) {
    if(this.checkIgnoreTags(ev))
      return;
    stopEvent(ev);
    var info      = DragResize.dragInfo = this.beginDrag(ev, this.resize_onInterval),
        container = this.container,
        minWidth  = (isNumber(this.minWidth)  ? this.minWidth  : DragResize['minWidth']),
        minHeight = (isNumber(this.minHeight) ? this.minHeight : DragResize['minHeight']);
    info.baseX   = container.offsetLeft + container.offsetWidth;
    info.baseY   = container.offsetTop  + container.offsetHeight;
    info.adjustX = container.offsetWidth  - container.clientWidth;
    info.adjustY = container.offsetHeight - container.clientHeight;
    info.minX    = container.offsetLeft + info.adjustX + minWidth;
    info.minY    = container.offsetTop  + info.adjustY + minHeight;
    info.maxX    = docEl.scrollWidth;
    info.maxY    = container.style.position != 'absolute' ? 65536 : docEl.scrollHeight;
  };

  DragResize.prototype.resize_onInterval = function() {
    this.updateDrag(function(info, container, x, y, scroll) {
      container.style.width  = (x - container.offsetLeft - info.adjustX) + 'px';
      container.style.height = (y - container.offsetTop  - info.adjustY) + 'px';
      if(this.scroll) {
        var frameSize = getWindowSize(),
            left      = container.offsetLeft,
            top       = container.offsetTop,
            sx        = scroll.x,
            sy        = scroll.y;
        left < sx              && (sx = left);
        x > (sx + frameSize.x) && (sx = x - frameSize.x);
        top < sy               && (sy = top);
        y > (sy + frameSize.y) && (sy = y - frameSize.y);
        (sx != scroll.x || sy != scroll.y) && win.scroll(sx, sy);
      }
    });
  };

  DragResize.prototype.onClick = function(ev) {
    if(!this.checkIgnoreTags(ev))
      stopEvent(ev);
  };

  DragResize.prototype.checkIgnoreTags = function(ev) {
    var el = ev.target || ev.srcElement;
    while(el) {
      if(el.nodeType == 1 && this.ignoreTags[el.tagName.toUpperCase()])
        return el;
      el = el.parentNode;
    }
    return null;
  };

  DragResize.prototype.beginDrag = function(ev, updateProc) {
    stopEvent(ev);
    DragResize.finish();
    var container = this.container,
        scroll    = getScroll(),
        mouseX    = ev.clientX,
        mouseY    = ev.clientY,
        scrollX   = scroll.x,
        scrollY   = scroll.y;
    return {
      manager:    this,
      intervalId: setInterval(bind(updateProc, this), 30),
      clickX:     mouseX,
      clickY:     mouseY,
      currentX:   mouseX,
      currentY:   mouseY,
      prevX:      mouseX,
      prevY:      mouseY,
      baseScX:    scrollX,
      baseScY:    scrollY,
      currentScX: scrollX,
      currentScY: scrollY,
      prevScX:    scrollX,
      prevScY:    scrollY
    };
  };

  DragResize.prototype.updateDrag = function(proc) {
    var info = DragResize.dragInfo, scroll = getScroll();
    if(info.currentX   != info.prevX || info.currentY   != info.prevY ||
       info.currentScX != scroll.x   || info.currentScY != scroll.y) {
      var container = this.container,
          x = Math.min(Math.max(info.baseX + info.currentX - info.clickX + scroll.x - info.baseScX, info.minX), info.maxX),
          y = Math.min(Math.max(info.baseY + info.currentY - info.clickY + scroll.y - info.baseScY, info.minY), info.maxY);
      proc.call(this, info, container, x, y, scroll);
      info.prevX      = info.currentX;
      info.prevY      = info.currentY;
      info.currentScX = scroll.x;
      info.currentScY = scroll.y;
    }
  };

  DragResize.prototype['detach'] = function() {
    if(DragResize.dragInfo && DragResize.dragInfo.manager == this)
      DragResize.finish();
    while(this.events.length > 0)
      removeEvent(this.events.pop());
    this.container = this.dragHandle = this.resizeHandle =
      this.onClickCallback = this.onDragCallback = this.onFinishCallback =
      this.callbackScope = this.ignoreTags = this.events = null;
  }

  addEvent(doc, 'mouseup',   DragResize.onMouseUp,   DragResize);
  addEvent(doc, 'mousemove', DragResize.onMouseMove, DragResize);

  win['DragResize'] = DragResize;

})();
