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

require 'time'
require 'uri'
require 'net/http'
require 'net/https'
require 'rexml/document'

module GoogleSpreadsheetsAPI

  def self.login(email, password)
    Proxy.login(email, password)
  end

  class Proxy
    @@token = nil

    def self.login(email, password)
      email    = URI.escape(email)
      password = URI.escape(password)
      http     = Net::HTTP.new('www.google.com', 443)
      http.use_ssl = true
      resp, data = http.post('/accounts/ClientLogin',
                             "accountType=HOSTED_OR_GOOGLE&Email=#{email}&Passwd=#{password}&service=wise",
                             { 'Content-Type' => 'application/x-www-form-urlencoded' })
      raise "Authentication failed." unless (200..300) ===  resp.code.to_i
      @@token = data[/Auth=(.*)/, 1]
    end

    def self.get(uri, headers = {})
      raise 'call GoogleSpreadsheetsAPI.login before sending a request.' unless @@token
      uri  = URI.parse(uri)
      doc  = nil
      Net::HTTP.start(uri.host, uri.port)do |http|
        headers  = { 'Authorization' => "GoogleLogin auth=#{@@token}" }.update(headers)
        response = http.get(uri.path, headers)
        raise "Resource \"#{uri}\" generated status #{response.code}." unless (200..300) ===  response.code.to_i
        doc = REXML::Document.new(response.body)
      end
      doc
    end

    def self.post(uri, data, headers = {})
      uri = URI.parse(uri)
      Net::HTTP.start(uri.host, uri.port)do |http|
        headers  = { 'Authorization' => "GoogleLogin auth=#{@@token}" }.update(headers)
        response = http.post(uri.path, data, headers)
        raise "Resource \"#{uri}\" generated status #{response.code}." unless (200..300) ===  response.code.to_i
      end
    end

  end

  class Document
    attr_accessor :id, :updated_at, :title

    def initialize(hash = {})
      @id         = hash[:id]
      @updated_at = hash[:updated_at]
      @title      = hash[:title]
    end

    def self.find()
      feed = Proxy.get('http://spreadsheets.google.com/feeds/spreadsheets/private/full')
      docs = []
      feed.elements.each('/feed/entry') do |element|
        document = Document.new
        element.each do |child|
          case child.name
          when 'updated': document.updated_at = Time.xmlschema(child.texts.join)
          when 'title'  : document.title = child.texts.join
          when 'link'
            if (child.attribute('rel').to_s == 'self' &&
                /full\/(.+)$/ === child.attribute('href').to_s)
              document.id = $1
            end
          end
        end
        docs << document
      end
      docs
    end

    def worksheets()
      Worksheet.find(@id)
    end
  end

  class Worksheet
    attr_accessor :id, :document_id, :updated_at, :title, :row_count, :col_count

    def initialize(hash = {})
      @id          = hash[:id]
      @document_id = hash[:document_id]
      @updated_at  = hash[:updated_at]
      @title       = hash[:title]
      @row_count   = hash[:row_count]
      @col_count   = hash[:col_count]
    end

    def append_row(hash)
      root = REXML::Element.new('atom:entry')
      root.add_namespace('atom', 'http://www.w3.org/2005/Atom')
      root.add_namespace('gsx', 'http://schemas.google.com/spreadsheets/2006/extended')
      hash.each do |key, value|
        e = REXML::Element.new("gsx:#{key}", root)
        e.text = value
      end
      Proxy.post("http://spreadsheets.google.com/feeds/list/#{@document_id}/#{@id}/private/full",
                 root.to_s,
                 { 'Content-Type' => 'application/atom+xml' })
    end

    def self.find(document_id)
      feed = Proxy.get("http://spreadsheets.google.com/feeds/worksheets/#{document_id}/private/full")
      sheets = []
      feed.elements.each('/feed/entry') do |element|
        sheet = Worksheet.new(:document_id => document_id.to_s)
        element.each do |child|
          case child.name
          when 'updated' : sheet.updated_at = Time.xmlschema(child.texts.join)
          when 'title'   : sheet.title = child.texts.join
          when 'rowCount': sheet.row_count = child.texts.join.to_i
          when 'colCount': sheet.col_count = child.texts.join.to_i
          when 'link'
            if (child.attribute('rel').to_s == 'self' &&
                /worksheets\/([^\/]+)\/private\/full\/(.+)$/ === child.attribute('href').to_s)
              sheet.document_id = $1
              sheet.id = $2
            end
          end
        end
        sheets << sheet
      end
      sheets
    end

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

    GoogleSpreadsheetsAPI.login(Credentials::GOOGLE_USER, Credentials::GOOGLE_PASS)
    comment_sheet   = GoogleSpreadsheetsAPI::Document.new(:id => 'pMIBrnJ4PHK_Tnb_IAz3cTQ').worksheets[0]
    trackback_sheet = GoogleSpreadsheetsAPI::Document.new(:id => 'pMIBrnJ4PHK_XSOfGkVhjTQ').worksheets[0]

    article_ids = []
    Net::FTP.open('ftp.blog.livedoor.com', Credentials::LIVEDOOR_USER, Credentials::LIVEDOOR_PASS) do |ftp|
      ftp.passive = true
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
        $stderr << "uploading #{exported_article.meta.title}...\n"
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
        exported_article.comments.each do |comment|
          d = comment.date
          c = {
            'timestamp' => "#{d.mon}/#{d.day}/#{d.year} #{d.hour}:#{d.min}:#{d.sec}",
            'page'      => data[:page_name],
            'title'     => data[:title],
            'name'      => comment.author,
            'url'       => comment.url,
            'comment'   => comment.body
          }
          comment_sheet.append_row(c)
        end
        exported_article.trackbacks.each do |trackback|
          d = trackback.date
          c = {
            'timestamp' => "#{d.mon}/#{d.day}/#{d.year} #{d.hour}:#{d.min}:#{d.sec}",
            'page'      => data[:page_name],
            'title'     => data[:title],
            'site'      => trackback.blog_name,
            'source'    => trackback.title,
            'url'       => trackback.url,
            'ip'        => trackback.ip,
            'excerpt'   => trackback.body.gsub(/[\x00-\x09\x0b\x0c\x0e-\x1f]/u, ' ')
          }
          trackback_sheet.append_row(c)
        end
      end
    end

  end

end
