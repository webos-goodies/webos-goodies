require 'open-uri'
require 'digest/sha1'
require 'time'
require 'livedoor_blog'

class WSSE
  def initialize(username, password)
    @username = username
    @password = password
  end

  def to_s
    nonce   = [0..20].map{ rand(256).chr }.join
    nonce64 = [nonce].pack('m').gsub("\n", '')
    created = Time.new.utc.iso8601.to_s
    digest  = [Digest::SHA1.digest(nonce+created+@password)].pack('m').gsub("\n", '')
    ["UsernameToken Username=\"#{@username}\"",
     "PasswordDigest=\"#{digest}\"",
     "Nonce=\"#{nonce64}\"",
     "Created=\"#{created}\""].join(',')
  end

  def to_hash
    { "X-WSSE" => self.to_s }
  end
end

require 'ftp_ex'
require 'credentials'

namespace :livedoor do

  desc "Fetch ENV['ARTICLE_ID'] and print it."
  task :article do
    wsse = WSSE.new(Credentials::LIVEDOOR_USER, Credentials::LIVEDOOR_PASS)
    id   = ENV['ARTICLE_ID']
    open("http://cms.blog.livedoor.com/atom/blog_id=1427319/entry_id=#{id}", wsse.to_hash) do |file|
      print file.read
    end
  end

  desc "Import all articles from livedoor blog."
  task :import => :environment do

    article_ids = []
    Net::FTP.open('ftp.blog.livedoor.com', Credentials::LIVEDOOR_USER, Credentials::LIVEDOOR_PASS) do |ftp|
      ftp.foreach('/archives') do |stat|
        if /^(\d+)\.html\.gz/ === stat.to_s
          article_ids << $1
        end
      end
    end

    articles = {}
    wsse     = WSSE.new(Credentials::LIVEDOOR_USER, Credentials::LIVEDOOR_PASS)
    article_ids.each do |id|
      open("http://cms.blog.livedoor.com/atom/blog_id=1427319/entry_id=#{id}", wsse.to_hash) do |file|
        $stderr << "fetching #{id}...\n"
        if /<title>([^<]*)<\/title>/u === file.read
          title = CGI::unescapeHTML($1)
          raise "Duplicated title : #{title}(#{id})" if articles.has_key?(title)
          articles[title] = { :id => id, :title => title }
        else
          raise "Illegal atom feed : #{id}" unless titles.size == 1
        end
      end
    end

    export_data = LivedoorBlog::ExportData.new(File.join(RAILS_ROOT, 'db/backup.htm'))

    Article.transaction do
      export_data.each do |exported_article|
        data = {
          :title        => exported_article.meta.title,
          :meta         => exported_article.meta.category.join(','),
          :publish_date => exported_article.meta.date,
          :body1        => exported_article.body[0]||'',
          :body2        => exported_article.body[1]||'',
          :parser       => exported_article.body.wiki? ? 'LivedoorParser' : 'HtmlParser',
          :published    => true
        }
        raise "Article id not found : #{data[:title]}" unless articles.has_key?(data[:title])
        data[:page_name] = articles[data[:title]][:id]
        Article.new(data).save!
      end
    end

  end

end
