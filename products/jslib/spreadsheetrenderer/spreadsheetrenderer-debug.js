goog.require('wg.SpreadsheetRenderer');
window['SpreadsheetRenderer']                    = wg.SpreadsheetRenderer;
wg.SpreadsheetRenderer['processResponse']        = wg.SpreadsheetRenderer.processResponse;
wg.SpreadsheetRenderer.prototype['setTemplate']  = wg.SpreadsheetRenderer.prototype.setTemplate;
wg.SpreadsheetRenderer.prototype['setFormatter'] = wg.SpreadsheetRenderer.prototype.setFormatter;
wg.SpreadsheetRenderer.prototype['render']       = wg.SpreadsheetRenderer.prototype.render;
