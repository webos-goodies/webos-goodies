# -*- mode:ruby -*-

require 'ftp_ex'

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
    pages = [{ :src => '/preview',      :dest => 'index.html' },
             { :src => '/preview.rss',  :dest => site.rss_path },
             { :src => '/preview.atom', :dest => site.atom_path }]
    pages.each do |page|
      page[:body] = `#{cmd} #{page[:src]}?site_id=#{site.id}`
    end
    Net::FTP.open(site.ftp_host, site.ftp_user, site.ftp_password) do |ftp|
      ftp_path    = site.ftp_path
      ftp.passive = true
      pages.each do |page|
        ftp.putbinarystring(page[:body], File.join(ftp_path, page[:dest]))
      end
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
    html = `#{cmd} #{id}`
    path = File.join(site.ftp_path, site.article_path, article[:page_name] + '.html')
    Net::FTP.open(site.ftp_host, site.ftp_user, site.ftp_password) do |ftp|
      ftp.passive = true
      ftp.putbinarystring(html, path)
    end
  end

  task :articles => :setup do
    raise 'Please set ENV["SITE"].' if (ENV['SITE']||'').strip.blank?
    site         = Site.find(ENV['SITE'].strip.to_i)
    ftp_path     = site.ftp_path
    article_path = site.article_path
    articles     = site.articles.find(:all, :conditions => { :published => true })
    cmd          = File.join(RAILS_ROOT, 'script/app/show_article')
    index        = 0
    while index < articles.size
      begin
        Net::FTP.open(site.ftp_host, site.ftp_user, site.ftp_password) do |ftp|
          ftp.passive = true
          while index < articles.size
            article = articles[index]
            article.publish
            article.save(false)
            $stdout << "uploading article #{article.id}...\n"
            html = `#{cmd} #{article.id}`
            path = File.join(ftp_path, article_path, article[:page_name] + '.html')
            ftp.putbinarystring(html, path)
            index = index + 1
            sleep(1)
          end
        end
      rescue
      end
    end
  end

  task :categories => :setup do
    raise 'Please set ENV["SITE"].' if (ENV['SITE']||'').strip.blank?
    site          = Site.find(ENV['SITE'].strip.to_i)
    ftp_path      = site.ftp_path
    category_path = 'categories'
    categories    = site.categories.find(:all)
    cmd           = File.join(RAILS_ROOT, 'script/app/show_category')
    index         = 0
    while index < categories.size
      begin
        Net::FTP.open(site.ftp_host, site.ftp_user, site.ftp_password) do |ftp|
          ftp.passive = true
          while index < categories.size
            category = categories[index]
            $stdout << "uploading category #{category.name}...\n"
            name = category[:name]
            json = category.to_json
            html = `#{cmd} #{category.id}`
            path = File.join(ftp_path, category_path, name + '.html')
            ftp.putbinarystring(html, path)
            sleep(1)
            path = File.join(ftp_path, category_path, 'jsonp', name + '.js')
            ftp.putbinarystring("tplRegistCategory(#{json});", path)
            sleep(1)
            index = index + 1
          end
        end
      rescue
      end
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
    site = Site.find(ENV['SITE'].strip.to_i)
    Net::FTP.open(site.ftp_host, site.ftp_user, site.ftp_password) do |ftp|
      ['common2.js'].each do |sname|
        dname       = File.join(site.ftp_path, '/template', sname)
        content     = IO.read(File.join(RAILS_ROOT, 'public/javascripts', sname))
        ftp.passive = true
        ftp.putbinarystring(content, dname)
      end
    end
  end

end
