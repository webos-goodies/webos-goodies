goog.require('wg.FeedRenderer');
window['FeedRenderer']                    = wg.FeedRenderer;
wg.FeedRenderer['processResponse']        = wg.FeedRenderer.processResponse;
wg.FeedRenderer.prototype['setTemplate']  = wg.FeedRenderer.prototype.setTemplate;
wg.FeedRenderer.prototype['setFormatter'] = wg.FeedRenderer.prototype.setFormatter;
wg.FeedRenderer.prototype['render']       = wg.FeedRenderer.prototype.render;
wg.FeedRenderer.setDefaultCallbackName('FeedRenderer.processResponse');
