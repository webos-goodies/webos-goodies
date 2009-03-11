var DraggableGrid = (function() {

var _window     = window,
    _document   = document,
    _nullFunc   = function() { return false; };
var _rootEl     = _document.documentElement || {},
    _proxyEl    = _document.createElement('DIV'),
    _quirks     = /backcompat/i.test(_document.compatMode),
    _isIE       = !!_window.ActiveXObject,
    _currentObj = null,
    _dummyRegex = { test: _nullFunc };

function normalizeCallback(callback) {
  var scope = _window, method = callback;
  if(arguments.length >= 2)
	callback = arguments;
  if(typeof callback != 'function') {
	if(!(method = callback[1] || callback['method'])) {
	  method = callback[0];
	} else {
	  scope = callback[0] || callback['scope'];
	  if(typeof method != 'function')
		method = scope[method];
	}
  }
  return [scope, method];
}

function delegate() {
  var callback = normalizeCallback.apply(this, arguments);
  return function() { callback[1].apply(callback[0], arguments); }
}

function addEvent(element, type) {
  var listener = delegate(Array.prototype.slice.call(arguments, 2));
  element['addEventListener'] ?
    element.addEventListener(type, listener, false) :
    element.attachEvent('on' + type, listener);
}

function stopEvent(event) {
  event.stopPropagation && event.stopPropagation();
  event.preventDefault  && event.preventDefault();
  event.cancelBubble = true;
  event.returnValue  = false;
}

function getRootElement() {
  return _quirks ? _document.body : _rootEl;
}

function getScroll() {
  var x = 0, y = 0, e;
  if(typeof _window.pageXOffset == 'number'){
	x = _window.pageXOffset;
	y = _window.pageYOffset;
  } else {
	e = getRootElement();
	x = e.scrollLeft;
	y = e.scrollTop;
  }
  return { x: x, y: y };
}

function getPageSize() {
  var e = getRootElement();
  return {
	x: e.scrollWidth,
	y: e.scrollHeight
  };
}

function getClientSize() {
  var x = 0, y = 0, e;
  if(typeof _window.innerWidth == 'number') {
	x = _window.innerWidth;
	y = _window.innerHeight;
  } else {
	e = getRootElement();
	x = e.clientWidth;
	y = e.clientHeight;
  }
  return { x: x, y: y };
}

function getStyle(e, name) {
  var view = _document.defaultView;
  return e.style[name] ? e.style[name] :
	(view && view.getComputedStyle ?
	 view.getComputedStyle(e, '').getPropertyValue(name) : e.currentStyle[name]);
}

function getElementPosition(element) {
  var e, p, x, y, s = getScroll(), cl = window.opera ? 0 : 1;
  if(element.getBoundingClientRect)
  {
	e = getRootElement();
	p = element.getBoundingClientRect();
	return {
	  x: p.left + s.x - (e.clientLeft || 0),
	  y: p.top  + s.y - (e.clientTop  || 0)
	};
  }
  else
  {
	e = element;
	x = (-e.clientLeft || 0)*cl + (e.scrollLeft || 0);
	y = (-e.clientTop  || 0)*cl + (e.scrollTop  || 0);
	while(e && e.nodeName.toUpperCase() != 'BODY') {
	  x += (e.offsetLeft || 0) + (e.clientLeft || 0)*cl - (e.scrollLeft || 0);
	  y += (e.offsetTop  || 0) + (e.clientTop  || 0)*cl - (e.scrollTop  || 0);
	  p  = getStyle(e, 'position');
	  if(p == 'fixed') {
		x += s.x;
		y += s.y;
		break;
	  } else if(p == 'absolute' && !_window.opera) {
		e = e.offsetParent;
	  } else {
		p = e.offsetParent;
		while((e = e.parentNode) != p) {
		  x -= (e.scrollLeft || 0);
		  y -= (e.scrollTop  || 0);
		}
	  }
	}
	return { x: x, y: y };
  }
}

function CLASS(gridId, opts)
{
  opts = opts || {};

  var self              = this,
      optScroll         = !!opts['scroll'],
      optFence          = !!opts['fence'],
      optDraggableClass = new RegExp('(?:^|\\s)'+(opts['draggableClass']||'draggable')+'(?:$|\\s)'),
      optHandleClass    = null,
      optProxyHtml      = opts['proxyHtml']  || '&nbsp;',
      optProxyClass     = opts['proxyClass'] || 'draggable-proxy',
      optProxyStyle     = opts['proxyStyle'] || 'background-color: #fcc;',
      optOpacity        = opts['opacity']    || 0.7,
      optOffset         = parseInt(opts['offset'] || 0, 10),
      optIgnoreTags     = _dummyRegex,
      optIgnoreClasses  = _dummyRegex,
      optOnBegin        = opts['onBegin']  || _nullFunc,
      optOnDrop         = opts['onDrop']   || _nullFunc,
      draggingEl, prevPosition, intervalId, oldStyle,
      baseX, baseY, adjustX, adjustY, minX, minY, maxX, maxY,
      clickX, clickY, currentX, currentY, prevX, prevY,
      baseScX, baseScY, currentScX, currentScY, prevScX, prevScY;

  (function(){
	var frameEl       = frame(),
	    ignoreTags    = opts['ignoreTags'],
	    ignoreClasses = opts['ignoreClasses'];

	optHandleClass = opts['handleClass'] ?
	  new RegExp('(?:^|\\s)'+opts['handleClass']+'(?:$|\\s)') : optDraggableClass;

	if(ignoreTags && ignoreTags.length > 0)
	  optIgnoreTags = new RegExp((opts['ignoreTags']||[]).join('|'), 'i');

	if(ignoreClasses && ignoreClasses.length > 0)
	  optIgnoreClasses = new RegExp('(?:^|\\s*)(?:' +
									ignoreClasses.join('|') + ')(?:$|\\s*)', 'i');

	addEvent(frameEl, 'mousedown', self, onMouseDown);
	addEvent(frameEl, 'click',     self, onClick);
  })();

  function frame() { return _document.getElementById(gridId); }

  function findDragTarget(event) {
	var element = event.target || event.srcElement, parentNode;
	while(element && element.id != gridId && (parentNode = element.parentNode)) {
	  if(element.nodeType == 1) {
		if(optIgnoreTags.test(element.nodeName) ||
		   optIgnoreClasses.test(element.className)) {
		  break;
		}
		if(optHandleClass.test(element.className)) {
		  do {
			if(parentNode.id == gridId){
			  return optDraggableClass.test(element.className) ? element : null;
			}
			element = parentNode;
		  } while(parentNode = element.parentNode);
		  break;
		}
	  }
	  element = parentNode;
	}
	return null;
  }

  function elementFromPoint(x, y) {
	var i, l, p, n, before = true, nodes = frame().childNodes;
	for(i = 0, l = nodes.length ; i < l ; ++i) {
	  if(optDraggableClass.test((n = nodes[i]).className)) {
		p = getElementPosition(n);
		if(p.x <= x && x < p.x + n.offsetWidth &&
		   p.y <= y && y < p.y + n.offsetHeight) {
		  return [n, before];
		}
	  }
	  if(n == _proxyEl) before = false;
	}
	return null;
  }

  function onMouseDown(event) {
	CLASS.finishDrag();
	if(!(draggingEl = findDragTarget(event)))
	  return;
	stopEvent(event);
	oldStyle = intervalId = null;
	_currentObj = this;

	var frameEl       = frame(),
	    callback      = normalizeCallback(optOnBegin),
	    draggingStyle = draggingEl.style,
	    draggingPos   = getElementPosition(draggingEl),
	    scrollPos     = getScroll(),
	    i, j, k, l;

	prevPosition   = draggingEl.nextSibling;
	draggingPos.x += optOffset;
	draggingPos.y += optOffset;

	i = getStyle(draggingEl, 'display');
	j = getStyle(draggingEl, 'float') || getStyle(draggingEl, 'styleFloat');
    k = getStyle(draggingEl, 'vertical-align');
    l = getStyle(draggingEl, 'zoom');
	_proxyEl.className = optProxyClass;
	_proxyEl.innerHTML = optProxyHtml;
	_proxyEl.style.cssText = [
	  'width:'   + getStyle(draggingEl, 'width'),
	  'height:'  + getStyle(draggingEl, 'height'),
	  'display:' + i,
	  i != 'inline-block' && i != 'inline' && j ? 'float:' + j : '',
      k ? 'vertical-align:' + k : '',
      l ? 'zoom:' + l : '',
	  optProxyStyle].join(';');

	oldStyle               = draggingStyle.cssText;
	draggingStyle.position = 'absolute';
	draggingStyle.left     = draggingPos.x + 'px';
	draggingStyle.top      = draggingPos.y + 'px';
	draggingStyle.opacity  = optOpacity;

	intervalId = setInterval(delegate(this, onIdle), 30);
	baseX   = draggingPos.x;
	baseY   = draggingPos.y;
	clickX  = currentX = prevX = event.clientX;
	clickY  = currentY = prevY = event.clientY;
	baseScX = currentScX = prevScX = scrollPos.x;
	baseScY = currentScY = prevScY = scrollPos.y;

	if(optFence) {
	  i = getElementPosition(frameEl);
	  minX = i.x;
	  minY = i.y;
	  maxX = i.x + frameEl.offsetWidth;
	  maxY = i.y + frameEl.offsetHeight;
	} else {
	  i = getPageSize();
	  minX = minY = 0;
	  maxX = i.x;
	  maxY = i.y;
	}
	maxX -= draggingEl.offsetWidth;
	maxY -= draggingEl.offsetHeight;

	frameEl.insertBefore(_proxyEl, draggingEl);
	_document.body.appendChild(draggingEl);

	callback[1].call(callback[0], { manager: this, prevPos: prevPosition });
  }

  function onClick(event) {
	draggingEl && stopEvent(event);
  }

  function onIdle() {
	var s = getScroll();
	if(currentX != prevX || currentY != prevY ||
	   currentScX != s.x || currentScY != s.y)
	{
	  var x = Math.min(Math.max(baseX + currentX - clickX + s.x - baseScX, minX), maxX),
	      y = Math.min(Math.max(baseY + currentY - clickY + s.y - baseScY, minY), maxY),
	      e, size, right, bottom, sx = s.x, sy = s.y;
	  draggingEl.style.left = x + 'px';
	  draggingEl.style.top  = y + 'px';
	  if(e = elementFromPoint(sx + currentX, sy + currentY)) {
		frame().insertBefore(_proxyEl, e[1] ? e[0] : e[0].nextSibling);
	  }
	  if(optScroll) {
		size   = getClientSize();
		right  = x + draggingEl.offsetWidth;
		bottom = y + draggingEl.offsetHeight;
		x < sx ? (sx = x) : (right  > (sx + size.x) && (sx = right  - size.x));
		y < sy ? (sy = y) : (bottom > (sy + size.y) && (sy = bottom - size.y));
		(sx != s.x || sy != s.y) && _window.scroll(sx, sy);
	  }
	  prevX = currentX;
	  prevY = currentY;
	  currentScX = s.x;
	  currentScY = s.y;
	}
  }

  function endDrag(callback, dropProc) {
	if(draggingEl) {
	  draggingEl.style.cssText = oldStyle;
	  (dropProc||_nullFunc)();
	  frame().removeChild(_proxyEl);
	  try {
		callback = normalizeCallback(callback);
		callback[1].call(callback[0], {
		  manager: this,
		  prevPos: prevPosition
		});
	  } catch(e) {}
	}
	intervalId && clearInterval(intervalId);
	draggingEl   = null;
	intervalId   = null;
	prevPosition = null;
  }

  self.getDraggingElement = function() {
	return draggingEl;
  };

  self.getProxyElement = function() {
	return _proxyEl;
  };

  self.onMouseMove = function(event) {
	currentX = event.clientX;
	currentY = event.clientY;
  };

  self.finishDrag = function() {
	endDrag.call(this, optOnDrop, function() {
	  frame().insertBefore(draggingEl, _proxyEl);
	});
  };

  self.cancelDrag = function() {
	endDrag.call(this, _nullFunc, function() {
	  frame().insertBefore(draggingEl, prevPosition);
	});
  };

  self = null;
}

CLASS.finishDrag = function() {
  if(_currentObj) {
	_currentObj.finishDrag();
	_currentObj = null;
  }
}

CLASS.cancelDrag = function() {
  if(_currentObj) {
	_currentObj.cancelDrag();
	_currentObj = null;
  }
}

function onMouseUp(event) {
  if(_currentObj) {
	CLASS.finishDrag();
	stopEvent(event);
  }
}

function onMouseMove(event) {
  if(_currentObj) {
	if(_isIE) {
	  if(!(event.button & 1)) {
		CLASS.finishDrag();
		return;
	  }
	  stopEvent(event);
	}
	_currentObj.onMouseMove(event);
  }
}

addEvent(_document, 'mouseup',   CLASS, onMouseUp);
addEvent(_document, 'mousemove', CLASS, onMouseMove);

return CLASS;

})();
