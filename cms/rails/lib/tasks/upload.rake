require 'ftp_ex'
require 'credentials'

namespace :upload do

  task :all => [:articles, :feeds]

  task :setup => :environment do
    require 'action_controller/integration'
    require File.join(RAILS_ROOT, 'app/controllers/articles_controller')
  end

  task :articles => :setup do
    session = ActionController::Integration::Session.new
    articles = Article.find(:all, :conditions => { :published => true }).map do |article|
      { :id => article.id, :page_name => article.page_name }
    end
    Net::FTP.open(Credentials::FTP_HOST, Credentials::FTP_USER, Credentials::FTP_PASS) do |ftp|
      ftp.passive = true
      articles.each do |article|
        $stdout << "uploading article #{article[:id]}...\n"
        status = session.get("/articles/#{article[:id]}/preview")
        raise "request failed :\n#{session.response.body}" unless status == 200
        ftp.putbinarystring(session.response.body,
                            File.join(Credentials::FTP_SITE_PATH, 'archives', article[:page_name] + '.html'))
      end
    end
  end

  task :feeds => :setup do
    session = ActionController::Integration::Session.new
    Net::FTP.open(Credentials::FTP_HOST, Credentials::FTP_USER, Credentials::FTP_PASS) do |ftp|
      ftp.passive = true
      status = session.get("/articles.rss/")
      raise "request failed for rss feed:\n#{session.response.body}" unless status == 200
      ftp.putbinarystring(session.response.body,
                          File.join(Credentials::FTP_SITE_PATH, 'index.rdf'))
      status = session.get("/articles.atom/")
      raise "request failed for atom feed:\n#{session.response.body}" unless status == 200
      ftp.putbinarystring(session.response.body,
                          File.join(Credentials::FTP_SITE_PATH, 'atom.xml'))
    end
  end

end
