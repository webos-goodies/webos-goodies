#! /usr/bin/ruby

require 'webapi/google/ajaxfeeds'

KCODE    = 'UTF8'
FEED_URL = 'http://myweb.yahoo.com/mywebrss/user/WxOWnIrYtZTWpQf1ec3vYmiA/tag/pending/urls.xml'

WebAPI::Google::AjaxFeeds.load(FEED_URL, 'num' => -1).each do |entry|
  print <<EOS

**#{ entry.title }

#{ entry.link }

#{ entry.content }
EOS
end
