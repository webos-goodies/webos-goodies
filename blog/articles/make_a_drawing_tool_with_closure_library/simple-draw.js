goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.ui.SelectionModel');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarToggleButton');
goog.require('goog.ui.ToolbarColorMenuButton');
goog.require('goog.fx.Dragger');
goog.require('goog.fx.Dragger.EventType');
goog.require('goog.graphics');

var toolbar       = null;
var graphics      = null;
var dragger       = null;
var currentMode   = 'ellipse';
var currentStroke = null;
var currentFill   = null;
var currentShape  = null;

// 初期化
function initialize() {
  // 描画領域の初期化
  graphics      = goog.graphics.createGraphics(512, 512);
  currentStroke = new goog.graphics.Stroke(2, '#000000');
  currentFill   = new goog.graphics.SolidFill('#ffff00');
  var canvas    = goog.dom.$('canvas')
  graphics.render(canvas);
  goog.events.listen(canvas, goog.events.EventType.MOUSEDOWN, onMouseDownCanvas);

  // ツールバーの初期化
  toolbar = new goog.ui.Toolbar();
  toolbar.decorate(goog.dom.$('toolbar'));

  // モード切り替えボタンの初期化
  var selectionModel = new goog.ui.SelectionModel();
  selectionModel.setSelectionHandler(onClickMode);
  goog.array.forEach(['move', 'ellipse'], function(id) {
    var button = toolbar.getChild('toolbar-mode-' + id);
    selectionModel.addItem(button);
    goog.events.listen(button, goog.ui.Component.EventType.ACTION, function(e) {
      selectionModel.setSelectedItem(e.target);
    });
  });
  selectionModel.setSelectedItem(toolbar.getChild('toolbar-mode-' + currentMode));

  // 色選択ボタンの初期化
  var strokeButton = toolbar.getChild('toolbar-color-stroke');
  strokeButton.setSelectedColor(currentStroke.getColor());
  goog.events.listen(strokeButton, goog.ui.Component.EventType.ACTION, onChangeStrokeColor);

  var fillButton = toolbar.getChild('toolbar-color-fill');
  fillButton.setSelectedColor(currentFill.getColor());
  goog.events.listen(fillButton, goog.ui.Component.EventType.ACTION, onChangeFillColor);
}
goog.exportSymbol('initialize', initialize, window);

// クライアント座標系から描画領域の座標系に変換
function clientToCanvas(x, y) {
  var scroll = goog.dom.getDocumentScroll();
  var bounds = goog.dom.$('canvas').getBoundingClientRect();
  return {
    x: x + scroll.x - bounds.left,
    y: y + scroll.y - bounds.top
  };
}

// ツールバーのモード切り替えボタンが押された際の処理
function onClickMode(button, select) {
  if(button && /^toolbar-mode-(.+)/.exec(button.getId())) {
    if(select)
      currentMode = RegExp.$1;
    button.setChecked(select);
  }
}

// 描画領域内でマウスボタンが押された際の処理
function onMouseDownCanvas(e) {
  if(!dragger && currentMode == 'ellipse') {
    var pt       = clientToCanvas(e.clientX, e.clientY);
    currentShape = graphics.drawCircle(0, 0, 1, currentStroke, currentFill);
    currentShape.setTransformation(pt.x, pt.y, 0, 0, 0);
    goog.events.listen(
      currentShape, goog.events.EventType.MOUSEDOWN, onMouseDownShape, false, currentShape);

    dragger = new goog.fx.Dragger(goog.dom.$('dummy-drag-target'));
    goog.events.listen(dragger, goog.fx.Dragger.EventType.DRAG, onDragCanvas);
    goog.events.listen(dragger, goog.fx.Dragger.EventType.END,  onDragEnd);
    dragger.startDrag(e);
  }
}

// ドラッグによる図形描画の処理
function onDragCanvas(e) {
  if(dragger && currentShape) {
    var pt    = clientToCanvas(e.clientX, e.clientY);
    var trans = currentShape.getTransform();
    currentShape.setRadius(
      Math.max(1, Math.abs(pt.x - trans.getTranslateX())),
      Math.max(1, Math.abs(pt.y - trans.getTranslateY())));
  }
}

// ドラッグが終了した際の処理（描画、移動共通）
function onDragEnd(e) {
  if(dragger) {
    dragger.dispose();
    dragger = null;
  }
}

// 図形内でマウスボタンが押された際の処理
function onMouseDownShape(e) {
  if(currentMode == 'move') {
    if(!dragger && this) {
      currentShape  = this;
      dragger       = new goog.fx.Dragger(goog.dom.$('dummy-drag-target'));
      dragger.prevX = e.clientX;
      dragger.prevY = e.clientY;
      goog.events.listen(dragger, goog.fx.Dragger.EventType.DRAG, onDragShape);
      goog.events.listen(dragger, goog.fx.Dragger.EventType.END,  onDragEnd);
      dragger.startDrag(e);

      var strokeButton = toolbar.getChild('toolbar-color-stroke');
      strokeButton.setSelectedColor(currentShape.getStroke().getColor());
      var fillButton = toolbar.getChild('toolbar-color-fill');
      fillButton.setSelectedColor(currentShape.getFill().getColor());
    }
  }
}

// ドラッグによる図形移動の処理
function onDragShape(e) {
  if(dragger && currentShape) {
    var trans = currentShape.getTransform();
    var newX  = e.clientX - dragger.prevX + trans.getTranslateX();
    var newY  = e.clientY - dragger.prevY + trans.getTranslateY();
    currentShape.setTransformation(newX, newY, 0, 0, 0);
    dragger.prevX = e.clientX;
    dragger.prevY = e.clientY;
  }
}

// 線色が変更された際の処理
function onChangeStrokeColor(e) {
  var color = e.target.getSelectedColor() || '#000000';
  currentStroke = new goog.graphics.Stroke(2, color);
  if(currentMode == 'move' && currentShape)
    currentShape.setStroke(currentStroke);
}

// 背景色が変更された際の処理
function onChangeFillColor(e) {
  var color   = e.target.getSelectedColor() || '#000000';
  currentFill = new goog.graphics.SolidFill(color);
  if(currentMode == 'move' && currentShape)
    currentShape.setFill(currentFill);
}
