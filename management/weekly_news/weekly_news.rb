#! /usr/bin/ruby
# -*- coding: utf-8 -*-

require 'rubygems'
require 'active_support'
require 'active_resource'
require 'time'
require 'erb'
require 'pp'

KCODE = 'UTF8'

module Feeds

  class FeedFormat
    RSS_ITEMS = {
      'title'       => 'title',
      'link'        => 'link',
      'description' => 'content',
      'catetories'  => 'category'
    }
    def extension() '' end
    def mime_type() '*' end
    def encode(hash, options = {}) throw NotSupportError.new end
    def decode(xml)
      tree = Hash.from_xml(xml)
      if tree.has_key?('rss')
        e = (tree['rss']['channel'] || { 'item' => [] })['item']
        e = e.is_a?(Array) ? e : [e]
        e.each_index{|i| e[i] = decode_rss(e[i], i) }
      end
    end
    private
    def parseTime(t)
      t ? Time.rfc822(t) : nil rescue Time.parse(t)
    end
    def decode_rss(e, i)
      r = { 'id' => e['guid'] || i }
      RSS_ITEMS.each{|k,v| r[v] = e[k] }
      r['published'] = parseTime(e['pubDate'])
      r
    end
  end

  class Feed < ActiveResource::Base
    self.format = FeedFormat.new
    class << self
      def find(path) super(:all, :from => path.to_s) end
    end
  end

end

class YahooBookmarksFeed < Feeds::Feed
  self.site = 'http://bookmarks.yahoo.co.jp/'
  class << self
    def find() super('/rss/webos_goodies/tag/pending') end
  end
end

YahooBookmarksFeed.find().each do |entry|
  entry.content = entry.content.gsub(/<br\s*\/>/, "\n").gsub(/<[^>]+>/, '')
  entry.content = entry.content.gsub(/<[^>]+>/, '')
  entry.content = entry.content.gsub(/\s*\d+人が登録\Z/, '')
  print <<EOS

**#{ entry.title }

#{ entry.link }
#{ entry.content }
EOS
end
