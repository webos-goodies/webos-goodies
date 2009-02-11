#! /usr/bin/ruby

require 'rubygems'
require 'active_support'
require 'active_resource'

class Bookmark < ActiveResource::Base
  self.site = 'http://localhost:3000/'
  self.user = 'user'
  self.password = 'password'
end

Bookmark.find(:all).each do|bookmark|
  print <<EOS
title: #{bookmark.title}
url:   #{bookmark.url}
comment:
#{bookmark.comment}

EOS
end
