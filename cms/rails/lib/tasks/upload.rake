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
    raise "site #{id} was not found." unless site
    session = ActionController::Integration::Session.new
    Net::FTP.open(site.ftp_host, site.ftp_user, site.ftp_password) do |ftp|
      site_id     = site.id
      ftp_path    = site.ftp_path
      ftp.passive = true
      [['/preview',      'index.html'],
       ['/preview.rss',  site.rss_path],
       ['/preview.atom', site.atom_path]].each do |get_path, upload_path|
        status = session.get(get_path + "?site_id=#{site_id}")
        raise "request failed for the top page:\n#{session.response.body}" unless status == 200
        ftp.putbinarystring(session.response.body, File.join(ftp_path, upload_path))
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
    articles = site.articles.find(:all, :conditions => { :published => true })
    cmd = File.join(RAILS_ROOT, 'script/app/show_article')
    Net::FTP.open(site.ftp_host, site.ftp_user, site.ftp_password) do |ftp|
      ftp.passive = true
      articles.each do |article|
        article.publish
        article.save(false)
        $stdout << "uploading article #{article.id}...\n"
        html = `#{cmd} #{article.id}`
        path = File.join(ftp_path, article_path, article[:page_name] + '.html')
        ftp.putbinarystring(html, path)
        sleep(5)
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
