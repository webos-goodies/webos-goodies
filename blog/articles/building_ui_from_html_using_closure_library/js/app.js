goog.provide('app.App');
goog.require('goog.string');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.dom');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ToolbarToggleButton');

/** @constructor */
app.App = function() {
  var textarea = goog.dom.getElement('html-code');
  var wrapper  = goog.dom.getElement('toolbar-wrap');
  textarea.value = goog.string.trim(wrapper.innerHTML);

  this.buildToolbar_();

  goog.events.listen(
    goog.dom.getElement('btn-update-toolbar'),
    goog.events.EventType.CLICK,
    this.onUpdateToolbar_,
    false,
    this);
};

app.App.prototype.buildToolbar_ = function() {
  if(this.toolbar_) {
    goog.events.removeAll(this.toolbar_);
    this.toolbar_.dispose();
    this.toolbar_ = null;
  }
  var textarea = goog.dom.getElement('html-code');
  var wrapper  = goog.dom.getElement('toolbar-wrap');
  wrapper.innerHTML = textarea.value;

  this.toolbar_ = new goog.ui.Toolbar();
  this.toolbar_.decorate(goog.dom.getElement('toolbar'));

  goog.events.listen(
    this.toolbar_,
    goog.ui.Component.EventType.ACTION,
    this.onAction_,
    false,
    this);
};

app.App.prototype.onUpdateToolbar_ = function() {
  this.buildToolbar_();
};

app.App.prototype.onAction_ = function(e) {
  alert(e.target.getId());
};

new app.App();
