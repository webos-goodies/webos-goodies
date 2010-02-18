#! /usr/bin/ruby
# -*- coding: utf-8 -*-

EMAIL        = 'youraccount@gmail.com'
PASSWORD     = 'google_password'
TWITTER_USER = 'twitter_username'

# 設定ファイルの場所
CONF_FILE    = File.expand_path('~/.tweet_amplifier')
#CONF_FILE    = File.expand_path(File.join(File.dirname($0), 'tweet_amplifier'))

# 転送頻度（秒単位、デフォルト5分）
INTERVAL     = 60*5

# この正規表現にマッチするつぶやきは転送しない
IGNORE_REGEX = /@/u

require "openssl"
require "net/smtp"
require 'nkf'
require 'erb'
require 'open-uri'
require 'time'
require 'optparse'
require 'webrick'

def main
  options = {}

  OptionParser.new do |opt|
    opt.on('-d', '--daemon') {|v| options[:daemon] = v }
    opt.parse(ARGV)
  end

  if options[:daemon]
    print "Daemon mode : existing tweets are ignored.\n"
    amplifier = TweetAmplifier.new(TWITTER_USER, EMAIL, PASSWORD, :mute => true)
    amplifier.amplify()
    amplifier = nil
    WEBrick::Daemon.start do
      while true
        sleep(INTERVAL)
        amplifier = TweetAmplifier.new(TWITTER_USER, EMAIL, PASSWORD, :ignore => IGNORE_REGEX)
        amplifier.amplify()
        amplifier = nil
      end
    end
  else
    amplifier = TweetAmplifier.new(TWITTER_USER, EMAIL, PASSWORD, :ignore => IGNORE_REGEX)
    amplifier.amplify()
  end
end

class TweetAmplifier
  def initialize(user, email, password, options = {})
    @user     = user
    @buzzruby = Buzzruby.new(email, password)
    @mute     = options[:mute]
    @ignore   = options[:ignore]
  end

  def amplify()
    config  = load_config()
    tl      = UserTimeline.new(@user)
    entries = []

    if config['since_id']
      entries = tl.fetch(:since => config['since_id'], :count => 100)
      entries.sort!{|a, b| a['id'] <=> b['id'] }
      entries.each do |entry|
        begin
          text = entry["text"]
          unless (@ignore && @ignore === text) || @mute
            @buzzruby.post(entry["text"])
          end
          config['since_id'] = entry['id'] if entry['id']
        rescue => e
          $stderr.write(e.message + "\n")
        ensure
          save_config(config)
        end
      end
    else
      config['since_id'] = tl.fetch(:count => 1)[0]['id']
      save_config(config)
    end
  end

  private

  def load_config()
    config = {}
    begin
      open(CONF_FILE) do |file|
        config = JsonParser.new(:malformed_chr => ??).parse(file.read)
      end
    rescue
    end
    config
  end

  def save_config(config)
    if config['since_id']
      open(CONF_FILE, "w") do |file|
        file.write(JsonBuilder.new.build(config))
      end
    end
  end
end

class UserTimeline

  def initialize(user)
    @user = user
  end

  def fetch(params = {})
    query = {}
    query['since_id'] = params[:since].to_s if params[:since]
    query['count']    = params[:count].to_s if params[:count]
    url = "http://twitter.com/statuses/user_timeline/#{ERB::Util.u(@user)}.json"
    unless query.empty?
      q   = query.map{|key, value| "#{ERB::Util.u(key)}=#{ERB::Util.u(value)}" }.join('&')
      url = "#{url}?#{q}"
    end
    response = open(url) {|file| file.read }
    parser   = JsonParser.new(:malformed_chr => ??)
    parser.parse(response)
  end

end

class Buzzruby

  def initialize(user, password)
    @user     = user + (user.index('@') ? '' : '@gmail.com')
    @password = password
  end

  def post(buzz)
    buzz = NKF.nkf('-Wwm0MB', buzz).gsub(/\s/, '')

    SMTP.start('smtp.gmail.com', 587,
               'localhost.localdomain', @user, @password, :plain) do |smtp|
      smtp.send_mail(<<EOS, @user, 'buzz@gmail.com')
From: #{@user}
To: buzz@gmail.com
Subject: =?UTF-8?B?#{buzz}?=

EOS
    end
  end

  #-----------------------------------------------------------
  # Following class is borrowed from:
  #   http://21croissants.blogspot.com/2007/08/configuring-rails-to-use-gmails-smtp.html
  #   http://wwwaku.com/blog_part2/2007/10/29/railsでgmailをsmtpサーバーとして使う方法/
  class SMTP < Net::SMTP
    private
    def do_start(helodomain, user, secret, authtype)
      raise IOError, 'SMTP session already started' if @started
      check_auth_args user, secret, authtype if user or secret

      sock = timeout(@open_timeout) { TCPSocket.open(@address, @port) }
      @socket = Net::InternetMessageIO.new(sock)
      @socket.read_timeout = 60 #@read_timeout

      check_response(critical { recv_response() })
      do_helo(helodomain)

      if starttls
        raise 'openssl library not installed' unless defined?(OpenSSL)
        ssl = OpenSSL::SSL::SSLSocket.new(sock)
        ssl.sync_close = true
        ssl.connect
        @socket = Net::InternetMessageIO.new(ssl)
        @socket.read_timeout = 60 #@read_timeout
        do_helo(helodomain)
      end

      authenticate user, secret, authtype if user
      @started = true
    ensure
      unless @started
        # authentication failed, cancel connection.
        @socket.close if not @started and @socket and not @socket.closed?
        @socket = nil
      end
    end

    def do_helo(helodomain)
      begin
        if @esmtp
          ehlo helodomain
        else
          helo helodomain
        end
      rescue Net::ProtocolError
        if @esmtp
          @esmtp = false
          @error_occured = false
          retry
        end
        raise
      end
    end

    def starttls
      getok('STARTTLS') rescue return false
      return true
    end

    def quit
      begin
        getok('QUIT')
      rescue EOFError, OpenSSL::SSL::SSLError
      end
    end
  end
  #-----------------------------------------------------------

end

#-----------------------------------------------------------
# simple-json.rb

require 'strscan'
require 'json' if RUBY_VERSION >= '1.9.0'

class JsonParser

  RUBY19             = RUBY_VERSION >= '1.9.0'
  Debug              = false
  Name               = 'JsonParser'
  ERR_IllegalSyntax  = "[#{Name}] Syntax error"
  ERR_IllegalUnicode = "[#{Name}] Illegal unicode sequence"

  StringRegex = /\s*"((?:\\.|[^"\\])*)"/n
  ValueRegex  = /\s*(?:
		(true)|(false)|(null)|            # 1:true, 2:false, 3:null
		(?:\"((?:\\.|[^\"\\])*)\")|       # 4:String
		([-+]?\d+\.\d+(?:[eE][-+]?\d+)?)| # 5:Float
		([-+]?\d+)|                       # 6:Integer
		(\{)|(\[))/xn                     # 7:Hash, 8:Array

  def initialize(options = {})
    @default_validation    = options.has_key?(:validation)    ? options[:validation]    : true
    @default_surrogate     = options.has_key?(:surrogate)     ? options[:surrogate]     : true
    @default_malformed_chr = options.has_key?(:malformed_chr) ? options[:malformed_chr] : nil
    @default_compatible    = options.has_key?(:compatible)    ? options[:compatible]    : false
  end

  def parse(str, options = {})
    @enable_validation = options.has_key?(:validation)    ? options[:validation]    : @default_validation
    @enable_surrogate  = options.has_key?(:surrogate)     ? options[:surrogate]     : @default_surrogate
    @malformed_chr     = options.has_key?(:malformed_chr) ? options[:malformed_chr] : @default_malformed_chr
    @compatible        = options.has_key?(:compatible)    ? options[:compatible]    : @default_compatible
    @malformed_chr = @malformed_chr[0].ord if String === @malformed_chr
    if RUBY19
      str = (str.encode('UTF-8') rescue str.dup)
      if @enable_validation && !@malformed_chr
        raise err_msg(ERR_IllegalUnicode) unless str.valid_encoding?
        @enable_validation = false
      end
      if !@enable_validation && @enable_surrogate && !@malformed_chr && !@compatible
        begin
          return JSON.parse(str, :max_nesting => false)
        rescue JSON::JSONError => e
          exception = RuntimeError.new(e.message)
          exception.set_backtrace(e.backtrace)
          raise exception
        end
      end
      str.force_encoding('ASCII-8BIT')
    end
    @scanner = StringScanner.new(str)
    obj = case get_symbol[0]
          when ?{ then parse_hash
          when ?[ then parse_array
          else         raise err_msg(ERR_IllegalSyntax)
          end
    @scanner = nil
    obj
  end

  private #---------------------------------------------------------

  def validate_string(str, malformed_chr = nil)
    code  = 0
    rest  = 0
    range = nil
    ucs   = []
    str.each_byte do |c|
      if rest <= 0
        case c
        when 0x01..0x7f then rest = 0 ; ucs << c
        when 0xc0..0xdf then rest = 1 ; code = c & 0x1f ; range = 0x00080..0x0007ff
        when 0xe0..0xef then rest = 2 ; code = c & 0x0f ; range = 0x00800..0x00ffff
        when 0xf0..0xf7 then rest = 3 ; code = c & 0x07 ; range = 0x10000..0x10ffff
        else                 ucs << handle_malformed_chr(malformed_chr)
        end
      elsif (0x80..0xbf) === c
        code = (code << 6) | (c & 0x3f)
        if (rest -= 1) <= 0
          if !(range === code) || (0xd800..0xdfff) === code
            code = handle_malformed_chr(malformed_chr)
          end
          ucs << code
        end
      else
        ucs << handle_malformed_chr(malformed_chr)
        rest = 0
      end
    end
    ucs << handle_malformed_chr(malformed_chr) if rest > 0
    ucs.pack('U*')
  end

  def handle_malformed_chr(chr)
    raise err_msg(ERR_IllegalUnicode) unless chr
    chr
  end

  def err_msg(err)
    err + (Debug ? " #{@scanner.string[[0, @scanner.pos - 8].max,16].inspect}" : "")
  end

  def unescape_string(str)
    str = str.gsub(/\\(["\\\/bfnrt])/n) do
      $1.tr('"\\/bfnrt', "\"\\/\b\f\n\r\t")
    end.gsub(/(\\u[0-9a-fA-F]{4})+/n) do |matched|
      seq = matched.scan(/\\u([0-9a-fA-F]{4})/n).flatten.map { |c| c.hex }
      if @enable_surrogate
        seq.each_index do |index|
          if seq[index] && (0xd800..0xdbff) === seq[index]
            n = index + 1
            raise err_msg(ERR_IllegalUnicode) unless seq[n] && 0xdc00..0xdfff === seq[n]
            seq[index] = 0x10000 + ((seq[index] & 0x03ff) << 10) + (seq[n] & 0x03ff)
            seq[n] = nil
          end
        end.compact!
      end
      seq.pack('U*')
    end
    str = validate_string(str, @malformed_chr) if @enable_validation
    RUBY19 ? str.force_encoding('UTF-8') : str
  end

  def get_symbol
    raise err_msg(ERR_IllegalSyntax) unless @scanner.scan(/\s*(.)/n)
    @scanner[1]
  end

  def peek_symbol
    @scanner.match?(/\s*(.)/n) ? @scanner[1] : nil
  end

  def parse_string
    raise err_msg(ERR_IllegalSyntax) unless @scanner.scan(StringRegex)
    unescape_string(@scanner[1])
  end

  def parse_value
    raise err_msg(ERR_IllegalSyntax) unless @scanner.scan(ValueRegex)
    case
    when @scanner[1] then true
    when @scanner[2] then false
    when @scanner[3] then nil
    when @scanner[4] then unescape_string(@scanner[4])
    when @scanner[5] then @scanner[5].to_f
    when @scanner[6] then @scanner[6].to_i
    when @scanner[7] then parse_hash
    when @scanner[8] then parse_array
    else                  raise err_msg(ERR_IllegalSyntax)
    end
  end

  def parse_hash
    obj = {}
    if peek_symbol[0] == ?} then get_symbol ; return obj ; end
    while true
      index = parse_string
      raise err_msg(ERR_IllegalSyntax) unless get_symbol[0] == ?:
      value = parse_value
      obj[index] = value
      case get_symbol[0]
      when ?} then return obj
      when ?, then next
      else         raise err_msg(ERR_IllegalSyntax)
      end
    end
  end

  def parse_array
    obj = []
    if peek_symbol[0] == ?] then get_symbol ; return obj ; end
    while true
      obj << parse_value
      case get_symbol[0]
      when ?] then return obj
      when ?, then next
      else         raise err_msg(ERR_IllegalSyntax)
      end
    end
  end

end

class JsonBuilder

  RUBY19             = RUBY_VERSION >= '1.9.0'
  Name               = 'JsonBuilder'
  ERR_NestIsTooDeep  = "[#{Name}] Array / Hash nested too deep."
  ERR_NaN            = "[#{Name}] NaN and Infinite are not permitted in JSON."

  def initialize(options = {})
    @default_max_nest = options.has_key?(:max_nest) ? options[:max_nest] : 19
    @default_nan      = options.has_key?(:nan)      ? options[:nan]      : nil
  end

  def build(obj, options = {})
    @max_nest = options.has_key?(:max_nest) ? options[:max_nest] : @default_max_nest
    @nan      = options.has_key?(:nan)      ? options[:nan]      : @default_nan
    if RUBY19 && !@nan
      begin
        JSON.generate(obj, :max_nesting => @max_nest, :check_circular => false)
      rescue JSON::JSONError => e
        exception = RuntimeError.new(e.message)
        exception.set_backtrace(e.backtrace)
        raise exception
      end
    else
      case obj
      when Array then build_array(obj, 0)
      when Hash  then build_object(obj, 0)
      else            build_array([obj], 0)
      end
    end
  end

  private #---------------------------------------------------------

  ESCAPE_CONVERSION = {
    '"'    => '\"', '\\'   => '\\\\', '/'    => '\/', "\x08" => '\b',
    "\x0c" => '\f', "\x0a" => '\n',   "\x0d" => '\r', "\x09" => '\t'
  }
  if RUBY19
    def escape(str)
      str = str.to_s.encode('UTF-8')
      str.force_encoding('ASCII-8BIT')
      str = str.gsub(/[^\x20-\x21\x23-\x2e\x30-\x5b\x5d-\xff]/n) do |chr|
        escaped = ESCAPE_CONVERSION[chr]
        escaped = sprintf("\\u%04X", chr[0].ord) unless escaped
        escaped
      end
      str.force_encoding('UTF-8')
      "\"#{str}\""
    end
  else
    def escape(str)
      str = str.gsub(/[^\x20-\x21\x23-\x2e\x30-\x5b\x5d-\xff]/n) do |chr|
        escaped = ESCAPE_CONVERSION[chr]
        escaped = sprintf("\\u%04x", chr[0]) unless escaped
        escaped
      end
      "\"#{str}\""
    end
  end

  def build_value(obj, level)
    case obj
    when Integer, TrueClass, FalseClass then obj.to_s
    when Float    then raise ERR_NaN unless obj.finite? || (obj = @nan) ; obj.to_s
    when NilClass then 'null'
    when Array    then build_array(obj, level + 1)
    when Hash     then build_object(obj, level + 1)
    else               escape(obj)
    end
  end

  def build_array(obj, level)
    raise ERR_NestIsTooDeep if level >= @max_nest
    '[' + obj.map { |item| build_value(item, level) }.join(',') + ']'
  end

  def build_object(obj, level)
    raise ERR_NestIsTooDeep if level >= @max_nest
    '{' + obj.map do |item|
      "#{build_value(item[0].to_s,level)}:#{build_value(item[1],level)}"
    end.join(',') + '}'
  end

end

main()
