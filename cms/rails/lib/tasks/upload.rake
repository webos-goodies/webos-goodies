# -*- mode:ruby -*-

require 'aws-sdk'
require 'uri'

namespace :upload do

  task :all => [:indices, :articles, :scripts]

  task :setup => :environment do
    require 'action_controller/integration'
    require File.join(RAILS_ROOT, 'app/controllers/articles_controller')
  end

  task :indices => :setup do
    raise 'Please set ENV["SITE"].' if (ENV['SITE']||'').strip.blank?
    site = Site.find(ENV['SITE'].strip.to_i)
    cmd  = File.join(RAILS_ROOT, 'script/app/show_page')
    raise "site #{id} was not found." unless site
    pages = [{ :src => '/preview',      :dest => 'index.html',   :type => 'text/html' },
             { :src => '/preview.rss',  :dest => site.rss_path,  :type => 'application/atom+xml' },
             { :src => '/preview.atom', :dest => site.atom_path, :type => 'application/rss+xml' }]
    pages.each do |page|
      page[:body] = `#{cmd} #{page[:src]}?site_id=#{site.id}`
    end

    client = AWS::S3.new(:access_key_id => site.aws_id, :secret_access_key => site.aws_secret)
    bucket = client.buckets[URI.parse(site.url).host]
    pages.each do |page|
      opts = { :reduced_redundancy => true, :content_type => page[:type] }
      bucket.objects[page[:dest].sub(/\A\/+/, '')].write(page[:body], opts)
    end
  end

  task :single_article => :setup do
    raise 'Please set ENV["ARTICLE"].' if (ENV['ARTICLE']||'').strip.blank?
    id      = ENV['ARTICLE'].strip.to_i
    article = Article.find_by_id(id)
    site    = article.site
    cmd     = File.join(RAILS_ROOT, 'script/app/show_article')
    raise "article #{id} was not found." unless article
    article.publish
    article.save(false)

    html   = `#{cmd} #{id}`
    path   = File.join(site.article_path, article[:page_name] + '.html')
    client = AWS::S3.new(:access_key_id => site.aws_id, :secret_access_key => site.aws_secret)
    bucket = client.buckets[URI.parse(site.url).host]
    opts   = { :reduced_redundancy => true, :content_type => 'text/html' }
    bucket.objects[path.sub(/\A\/+/, '')].write(html, opts)
  end

  task :articles => :setup do
    raise 'Please set ENV["SITE"].' if (ENV['SITE']||'').strip.blank?
    site   = Site.find(ENV['SITE'].strip.to_i)
    cmd    = File.join(RAILS_ROOT, 'script/app/show_article')
    client = AWS::S3.new(:access_key_id => site.aws_id, :secret_access_key => site.aws_secret)
    bucket = client.buckets[URI.parse(site.url).host]
    opts   = { :reduced_redundancy => true, :content_type => 'text/html' }
    site.articles.find(:all, :conditions => { :published => true }).each do |article|
      article.publish
      article.save(false)
      $stdout << "uploading article #{article.id}...\n"
      html = `#{cmd} #{article.id}`
      path = File.join(site.article_path, article[:page_name] + '.html')
      bucket.objects[path.sub(/\A\/+/, '')].write(html, opts)
    end
  end

  task :categories => :setup do
    raise 'Please set ENV["SITE"].' if (ENV['SITE']||'').strip.blank?
    site   = Site.find(ENV['SITE'].strip.to_i)
    cmd    = File.join(RAILS_ROOT, 'script/app/show_category')
    client = AWS::S3.new(:access_key_id => site.aws_id, :secret_access_key => site.aws_secret)
    bucket = client.buckets[URI.parse(site.url).host]
    htopts = { :reduced_redundancy => true, :content_type => 'text/html' }
    jsopts = { :reduced_redundancy => true, :content_type => 'text/javascript' }
    site.categories.find(:all).each do |category|
      $stdout << "uploading category #{category.name}...\n"
      name = category[:name]

      html = `#{cmd} #{category.id}`
      path = File.join('categories', name + '.html')
      bucket.objects[path.sub(/\A\/+/, '')].write(html, htopts)

      json = category.to_json
      path = File.join('categories/jsonp', name + '.js')
      bucket.objects[path.sub(/\A\/+/, '')].write("tplRegistCategory(#{json});", jsopts)
    end
  end

  task :article_list => :setup do
    raise 'Please set ENV["SITE"].' if (ENV['SITE']||'').strip.blank?
    site  = Site.find(ENV['SITE'].strip.to_i)
    cache = {}
    site.articles.each do |article|
      $stdout << "uploading article #{article[:id]}...\n"
      cache = article.upload_googledocs(cache)
      unless cache[:article_list][:rows]
        cache[:article_list][:rows] = cache[:article_list][:list_class].find(:all)
      end
    end
  end

  task :scripts => :setup do
    raise 'Please set ENV["SITE"].' if (ENV['SITE']||'').strip.blank?
    site   = Site.find(ENV['SITE'].strip.to_i)
    client = AWS::S3.new(:access_key_id => site.aws_id, :secret_access_key => site.aws_secret)
    bucket = client.buckets[URI.parse(site.url).host]
    opts   = { :reduced_redundancy => true, :content_type => 'text/javascript' }

    ['common2.js'].each do |sname|
      path    = File.join('template', sname)
      content = IO.read(File.join(RAILS_ROOT, 'public/javascripts', sname))
      bucket.objects[path.sub(/\A\/+/, '')].write(content, opts)
    end
  end

end
