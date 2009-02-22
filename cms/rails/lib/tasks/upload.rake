require 'ftp_ex'

namespace :upload do

  task :all => [:indices, :articles]

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
    session = ActionController::Integration::Session.new
    status  = session.get("/preview/article/#{id}")
    raise "request failed :\n#{session.response.body}" unless status == 200
    article = Article.find_by_id(id)
    raise "article #{id} was not found." unless article
    site = article.site
    Net::FTP.open(site.ftp_host, site.ftp_user, site.ftp_password) do |ftp|
      ftp.passive = true
      ftp.putbinarystring(session.response.body,
                          File.join(site.ftp_path, site.article_path, article[:page_name] + '.html'))
    end
  end

  task :articles => :setup do
    raise 'Please set ENV["SITE"].' if (ENV['SITE']||'').strip.blank?
    site         = Site.find(ENV['SITE'].strip.to_i)
    ftp_path     = site.ftp_path
    article_path = site.article_path
    articles = site.articles.find(:all, :conditions => { :published => true }).map do |article|
      { :id => article.id, :page_name => article.page_name }
    end
    session = ActionController::Integration::Session.new
    Net::FTP.open(site.ftp_host, site.ftp_user, site.ftp_password) do |ftp|
      ftp.passive = true
      articles.each do |article|
        $stdout << "uploading article #{article[:id]}...\n"
        status = session.get("/preview/article/#{article[:id]}")
        raise "request failed :\n#{session.response.body}" unless status == 200
        ftp.putbinarystring(session.response.body,
                            File.join(ftp_path, article_path, article[:page_name] + '.html'))
      end
    end
  end

end
