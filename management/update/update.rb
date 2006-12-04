#! /usr/bin/ruby

require 'webapi/delicious'
require 'nkf'

api = WebAPI::Delicious.new('hokousya')
posts = api.posts(3, 'google-tips')

out = ''
posts.each do |post|
  out << "title : #{post.title}\n"
  out << "url   : #{post.url}\n"
  out << "note  : #{post.note}\n"
  out << "tags  : #{post.tags.join(',')}\n"
end

print NKF.nkf('-s', out)
