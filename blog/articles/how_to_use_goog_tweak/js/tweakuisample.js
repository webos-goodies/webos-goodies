goog.provide('tweakuisample.App');
goog.require('goog.dom');
goog.require('goog.tweak');
goog.require('goog.tweak.TweakUi');

goog.tweak.registerBoolean(
  'Checkbox', 'boolean値はチェックボックスとして表示されます');
goog.tweak.registerBoolean(
  'CheckedCheckbox',
  'boolean値のデフォルトはfalseですが、変更可能です', true);

goog.tweak.registerString(
  'Textbox', '文字列はテキストボックスとして表示されます');
goog.tweak.registerString(
  'TextboxWithText',
  '文字列のデフォルトは空文字列ですが、変更可能です',
  'Default text');

goog.tweak.registerString(
  'Combobox',
  'validValuesオプションを付けた文字列は、ドロップダウンになります',
  '', { validValues: ['Item1', 'Item2', 'Item3'] });

goog.tweak.registerNumber(
  'Numberbox', '数値はテキストボックスとして表示されます');
goog.tweak.registerNumber(
  'NumberboxWithDefault',
  '数値のデフォルトは0ですが、変更可能です', 100);

goog.tweak.registerNumber(
  'NumberConbobox',
  'validValuesオプションを付けた数値は、ドロップダウンになります',
  0, { validValues: [0, 5, 10, 50] });

goog.tweak.beginBooleanGroup('BooleanGroup', 'Boolean値はグループ化できます');
goog.tweak.registerBoolean('GroupItem1', 'Group item 1');
goog.tweak.registerBoolean('GroupItem2', 'Group item 2');
goog.tweak.endBooleanGroup();

goog.tweak.registerButton(
  'Button',
  'ボタンでJavaScriptの実行も可能',
  function() { alert('ボタンでJavaScriptの実行も可能'); },
  'コードの実行');

/** @constructor */
tweakuisample.App = function() {
  goog.dom.setTextContent(goog.dom.getElement('url'), location.search || '');
  var tweakEl = goog.tweak.TweakUi.createCollapsible();
  if(tweakEl) {
    goog.dom.getElement('my-tweak-ui').appendChild(tweakEl);
  } else {
    goog.dom.setTextContent(goog.dom.getElement('my-tweak-ui'), 'STRIPPED!')
  }
};

var app = new tweakuisample.App();
