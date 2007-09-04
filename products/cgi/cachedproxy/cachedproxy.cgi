#! /usr/bin/ruby

require 'net/http'
require 'fileutils'
require 'cgi'
require 'digest/sha1'

$KCODE = 'UTF8'

# --------------------------------------
# 以下の定数を適切に変更してください

# キャッシュの保存に必要なパスワード（できるだけハッシュ後の文字列に置き換えてください）
PASSWORD = Digest::SHA1.new('password')

# キャッシュディレクトリのフルパス
CACHE_PATH = ENV['DOCUMENT_ROOT'] + '/cache'

# キャッシュディレクトリの ServerRoot からのパス
CACHE_URL = '/cache'

# --------------------------------------
# 以下は必要に応じて変更してください

# trueにすると若干わかりやすいエラーが表示され、キャッシュファイルは作成されません
ENABLE_DEBUG = false

# 実際にリクエストされたURL（Apacheのバージョンによって環境変数が違う？）
REQUEST_URI = ENV['REQUEST_URI']

# リクエストURLが http://[ホスト名][CACHE_URL][キャッシュパス] として...
# キャッシュパスが以降の正規表現のいずれかにマッチしなければ拒否する
WHITE_LIST = [
  /\.(?:jpg|jpeg|png|gif)$/, # 許可する拡張子
  /^(?:\/[-+_%\w][-+_%.\w]{0,255}){2,10}(?:\=\.[-+_%\w]+)?$/]

# キャッシュパスが以降の正規表現のいずれかにマッチすれば拒否する
BLACK_LIST = [ /(?:\.\.|\/\/)/ ] # 念のため（＾＾；

# mime-typeが以降の正規表現のいずれかにマッチすれば許可する
ALLOW_TYPE = [ /^image\/(?:jpeg|png|gif)$/ ]

# パスワードを保存するCookieの名前
PASSWORD_COOKIE = 'cache_pw'

# Cookieの保存期間（秒数）
PASSWORD_EXPIRES = 30*(24*60*60) # 30日

# --------------------------------------

def get_env()
  envs = []
  ENV.each do |key, value|
    envs.push(key + ' : ' + value)
  end
  envs.join("\n")
end

AUTH_FORM = <<EOS
Content-type: text/html;charset=utf-8

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>CachedProxy : 認証</title>
</head>
<body>
<form method="POST" action="#{File.basename(ENV['SCRIPT_NAME'])}">
パスワードを入力してください<br>
<input type="password" name="pw" size="60">
<input type="submit">
<pre>#{ if ENABLE_DEBUG then CGI.escapeHTML(get_env()) else '' end }</pre>
</body>
</html>
EOS

AUTH_SET = <<EOS
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>CachedProxy : 認証</title>
</head>
<body>
パスワードを設定しました
</body>
EOS

Net::HTTP.version_1_2

class CachedProxy

  def initialize(cache_path, white_list, black_list, allow_type)
    @cache_path = cache_path + (/\/$/ === cache_path ? '' : '/')
    @white_list = white_list
    @black_list = black_list
    @allow_type = allow_type
  end

  def validate_url(url)
    @white_list.each do |regex|
      raise regex.to_s + 'にマッチしません' unless regex === url
    end
    @black_list.each do |regex|
      raise regex.to_s + 'にマッチしました' if regex === url
    end
  end

  def fetch(url, limit = 10)
    raise 'リダイレクトが深すぎます' if limit == 0
    uri = URI.parse(url)
    if ENV['SERVER_NAME'] == uri.host && ENV['SERVER_PORT'].to_i == uri.port
      raise '同じサーバーのファイルはキャッシュできません'
    end
    response = Net::HTTP.get_response(uri)
    case response
    when Net::HTTPSuccess     then response
    when Net::HTTPRedirection then fetch(response['location'], limit - 1)
    else
      response.error!
    end
  end

  def validate_type(response)
    raise 'レスポンスにContent-typeがありません' unless response.key?('content-type')
    raise 'Content-typeの形式が間違っています' unless /^\s*([^; \t]+)/ === response['content-type']
    type  = $1
    match = false
    @allow_type.each do |regex|
      if regex === type
        match = true
        break
      end
    end
    raise type + 'はキャッシュできません' unless match
  end

  def write_cache(path, response)
    full_path = @cache_path.sub(/\/+$/, '') + path
    FileUtils.mkdir_p(File.dirname(full_path))
    File.open(full_path, 'w', 0644) do |file|
      file.write(response.body)
    end
  end

  def cache(path, debug = false)
    validate_url(path)
    response = fetch('http:/' + URI.unescape(path.sub(/\=\.[-+_%\w]+$/, '')))
    validate_type(response)
    write_cache(path, response) unless debug
    response
  end

end

def get_target_path()
  cache_url = CACHE_URL + (/\/$/ === CACHE_URL ? '' : '/')
  return nil unless REQUEST_URI
  index = REQUEST_URI.index(cache_url)
  index == 0 ? URI.unescape(REQUEST_URI[cache_url.length-1..-1]) : nil
end

begin

  target_path = get_target_path()
  if target_path
    cgi = CGI.new('html4')
    if !(cgi.cookies[PASSWORD_COOKIE] && Digest::SHA1.new(cgi.cookies[PASSWORD_COOKIE][0]) == PASSWORD)
      raise 'パスワードが違います'
    end
    cachedproxy = CachedProxy.new(CACHE_PATH, WHITE_LIST, BLACK_LIST, ALLOW_TYPE)
    response = cachedproxy.cache(target_path, ENABLE_DEBUG)
    print 'Content-type: ' + response['content-type'] + "\n"
    print 'Content-length: ' + response['content-length'] + "\n" if response.key?('content-length')
    #print 'Status-code: 200 OK\n"
    print "\n"
    print response.body
  elsif ENV['REQUEST_METHOD'] == 'POST'
    begin
      cgi = CGI.new('html4')
      raise 'パスワードが指定されていません' if !cgi.has_key?('pw') || cgi['pw'].size <= 0
      cookie = CGI::Cookie::new({
        'name'    => PASSWORD_COOKIE,
        'value'   => cgi['pw'],
        'path'    => '/',
        'expires' => Time.now + PASSWORD_EXPIRES })
      cgi.out({ 'cookie' => [cookie] }) do
        cgi.html() do
          AUTH_SET
        end
      end
    rescue => err
      print "Content-type: text/plain;charset=utf-8\n"
      #print "Status: 500 Internal Server Error\n"
      print "\n" + err.to_s
    end
  else
    print AUTH_FORM
  end

rescue => err

  print "Content-type: text/plain;charset=utf-8\n"
  #print "Status: 500 Internal Server Error\n"
  print "\n"
  if ENABLE_DEBUG
    print err.to_s + "\n\n[環境変数]\n" + get_env()
  else
    print "エラーが発生しました\n"
  end

end
