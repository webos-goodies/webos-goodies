goog.provide('sample.App');
goog.require('goog.editor.Field');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.ui.editor.ToolbarController');
goog.require('goog.ui.editor.DefaultToolbar');

/** @constructor */
sample.App = function() {
  var editor = new goog.editor.Field('editor', document);
  var toolbar = new goog.ui.editor.DefaultToolbar.makeDefaultToolbar(goog.dom.$('toolbar'));
  var controller = new goog.ui.editor.ToolbarController(editor, toolbar);
  editor.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
  editor.makeEditable();
};
goog.addSingletonGetter(sample.App);

sample.App.getInstance();
