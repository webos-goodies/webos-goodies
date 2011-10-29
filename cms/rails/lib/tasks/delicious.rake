# -*- coding: utf-8; mode:ruby -*-

namespace :delicious do

  task :all => [:import]

  task :setup => :environment do
    require 'webapi/delicious'
    require 'delicious_account'
  end

  task :import => :setup do
    posts = {}
    Site.find(1).articles.each do |post|
      posts[post.page_name] = post
    end

    del = WebAPI::Delicious.new(*DELICIOUS)
    del.get_posts().each do |bookmark|
      if /\/([^\/]+)\.html$/ === bookmark[:url]
        page_name = $1
        tags      = bookmark[:tags].map{|t| "[#{t}]"}.join('')
        post      = posts[page_name]
        if post
          post.tags = tags
          post.save!
        else
          raise "対応する記事がありません : #{bookmark[:url]}"
        end
      else
        raise "ページ名が不明です : #{bookmark[:url]}"
      end
    end
  end
end
