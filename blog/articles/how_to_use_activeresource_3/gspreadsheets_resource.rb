require 'rubygems'
require 'active_support'
require 'active_resource'
require 'time'
require 'erb'

class GoogleSpreadsheet < ActiveResource::Base

  class Connection < ActiveResource::Connection
    DEBUG = false
    def authorization_header
      if @user && @password && !@token
        email            = ERB::Util.u(@user)
        password         = ERB::Util.u(@password)
        http             = Net::HTTP.new('www.google.com', 443)
        http.use_ssl     = true
        http.verify_mode = OpenSSL::SSL::VERIFY_NONE
        resp, data = http.post('/accounts/ClientLogin',
                               "accountType=HOSTED_OR_GOOGLE&Email=#{email}&Passwd=#{password}&service=wise",
                               { 'Content-Type' => 'application/x-www-form-urlencoded' })
        handle_response(resp)
        @token = (data || resp.body)[/Auth=(.*)/n, 1]
      end
      @token ? { 'Authorization' => "GoogleLogin auth=#{@token}" } : {}
    end
    private
    def http() http = super; http.set_debug_output($stderr) if DEBUG; http end
  end

  class Format
    def extension() '' end
    def mime_type() 'application/atom+xml' end
    def encode(hash, options = {})
      root = REXML::Element.new('entry')
      root.add_namespace('http://www.w3.org/2005/Atom')
      root.add_namespace('gsx', 'http://schemas.google.com/spreadsheets/2006/extended')
      hash.each do |key, value|
        if value && (key = key.dup).gsub!(/^gsx_/u, 'gsx:')
          e = REXML::Element.new(key, root)
          e.text = value
        end
      end
      root.to_s
    end
    def decode(xml)
      e = Hash.from_xml(xml.gsub(/<(\/?)gsx:/u, '<\1gsx_'))
      if e.has_key?('feed')
        e = e['feed']['entry'] || []
        (e.is_a?(Array) ? e : [e]).each{|i| format_entry(i) }
      else
        format_entry(e['entry'])
      end
    end
    private
    def format_entry(e)
      e['id']      = e['id'][/[^\/]+\z/u] if e.has_key?('id')
      e['updated'] = (Time.xmlschema(e['updated']) rescue Time.parse(e['updated'])) if e.has_key?('updated')
      e
    end
  end

  #-------------------------------------------------------------------

  self.site   = 'http://spreadsheets.google.com/'
  self.prefix = '/:document_id/:worksheet_id/:visibility/:projection/'
  self.format = Format.new

  class << self
    def connection(refresh = false)
      if defined?(@connection) || self == GoogleSpreadsheet
        @connection = Connection.new(site, format) if refresh || @connection.nil?
        @connection.user = user if user
        @connection.password = password if password
        @connection.timeout = timeout if timeout
        @connection
      else
        superclass.connection
      end
    end
    def element_path(id, prefix_options = {}, query_options = nil)
      prefix_options, query_options = split_options(prefix_options) if query_options.nil?
      "/feeds/list#{prefix(prefix_options)}#{id}#{query_string(query_options)}"
    end
    def collection_path(prefix_options = {}, query_options = nil)
      prefix_options, query_options = split_options(prefix_options) if query_options.nil?
      "/feeds/list#{prefix(prefix_options)}#{query_string(query_options)}"
    end
  end

  def destroy() connection.delete(edit_path, self.class.headers) end

  protected

  def update
    returning connection.put(edit_path, encode, self.class.headers) do |response|
      load_attributes_from_response(response)
    end
  end
  def edit_path()
    s = self.class.site
    (self.attributes['link'] || []).map{|l| l.rel == 'edit' ? l.href : nil }.compact.each do |href|
      e = URI.parse(href)
      return e.request_uri if s.scheme == e.scheme && s.port == e.port && s.host == e.host
    end
    raise 'No edit link'
  end

end
