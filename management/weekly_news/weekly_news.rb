#! /usr/bin/ruby

require 'webapi/google/ajaxfeeds'

FEED_URL = 'http://myweb.yahoo.com/mywebrss/user/WxOWnIrYtZTWpQf1ec3vYmiA/tag/pending/urls.xml'

WebAPI::Google::AjaxFeeds.load(FEED_URL).each do |entry|
  p entry.title
end
