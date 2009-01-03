require 'ftp_ex'
require 'credentials'

namespace :upload do

  task :setup => :environment do
    require 'action_controller/integration'
    require File.join(RAILS_ROOT, 'app/controllers/articles_controller')
  end

  task :articles => :setup do
    session  = ActionController::Integration::Session.new
    articles = Article.find(:all).map{|article| { :id => article.id, :page_name => article.page_name } }
    Net::FTP.open(Credentials::FTP_HOST, Credentials::FTP_USER, Credentials::FTP_PASS) do |ftp|
      articles.each do |article|
        $stdout << "uploading article #{article[:id]}...\n"
        status = session.get("/articles/#{article[:id]}/preview")
        raise "request failed :\n#{session.response.body}" unless status == 200
        ftp.putbinarystring(session.response.body,
                            File.join(Credentials::FTP_SITE_PATH, 'archives', article[:page_name] + '.html'))
      end
    end
  end

end
