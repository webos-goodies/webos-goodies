require 'ftp_ex'
require 'credentials'

namespace :upload do

  task :all => [:indices, :articles]

  task :setup => :environment do
    require 'action_controller/integration'
    require File.join(RAILS_ROOT, 'app/controllers/articles_controller')
  end

  task :indices => :setup do
    session = ActionController::Integration::Session.new
    Net::FTP.open(Credentials::FTP_HOST, Credentials::FTP_USER, Credentials::FTP_PASS) do |ftp|
      ftp.passive = true
      status = session.get("/preview")
      raise "request failed for the top page:\n#{session.response.body}" unless status == 200
      ftp.putbinarystring(session.response.body,
                          File.join(Credentials::FTP_SITE_PATH, 'index.html'))
      status = session.get("/preview.rss")
      raise "request failed for rss feed:\n#{session.response.body}" unless status == 200
      ftp.putbinarystring(session.response.body,
                          File.join(Credentials::FTP_SITE_PATH, 'index.rdf'))
      status = session.get("/preview.atom")
      raise "request failed for atom feed:\n#{session.response.body}" unless status == 200
      ftp.putbinarystring(session.response.body,
                          File.join(Credentials::FTP_SITE_PATH, 'atom.xml'))
    end
  end

  task :single_article => :setup do
    id      = ENV['ARTICLE'].to_i
    article = Article.find(:first, :conditions => { :id => id })
    raise "article #{id} was not found." unless article
    session = ActionController::Integration::Session.new
    status  = session.get("/preview/article/#{id}")
    raise "request failed :\n#{session.response.body}" unless status == 200
    Net::FTP.open(Credentials::FTP_HOST, Credentials::FTP_USER, Credentials::FTP_PASS) do |ftp|
      ftp.passive = true
      ftp.putbinarystring(session.response.body,
                          File.join(Credentials::FTP_SITE_PATH, 'archives', article[:page_name] + '.html'))
    end
  end

  task :articles => :setup do
    articles = Article.find(:all, :conditions => { :published => true }).map do |article|
      { :id => article.id, :page_name => article.page_name }
    end
    session = ActionController::Integration::Session.new
    Net::FTP.open(Credentials::FTP_HOST, Credentials::FTP_USER, Credentials::FTP_PASS) do |ftp|
      ftp.passive = true
      articles.each do |article|
        $stdout << "uploading article #{article[:id]}...\n"
        status = session.get("/preview/article/#{article[:id]}")
        raise "request failed :\n#{session.response.body}" unless status == 200
        ftp.putbinarystring(session.response.body,
                            File.join(Credentials::FTP_SITE_PATH, 'archives', article[:page_name] + '.html'))
      end
    end
  end

end
