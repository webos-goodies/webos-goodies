#! /usr/bin/ruby

require 'webapi/delicious'
require 'nkf'
require 'erb'
require 'fileutils'
require 'net/ftp'

require 'account'

class Update

  JSONP_DIR = 'jsonp'

  def initialize(account, current_path, old_path, remote_path)
    @ftp          = nil
    @account      = account
    @current_path = current_path
    @old_path     = old_path
    @remote_path  = remote_path
    @new_files    = {}
    @new_dirs     = []
    @articles     = {}
  end

  def prepare()
    @ftp = Net::FTP.new(*@account)
    FileUtils.rm_rf(@current_path)
    FileUtils.mkdir(@current_path)
  end

  def fetch_articles()
    del = WebAPI::Delicious.new(*DELICIOUS)
    del.tags.each do |tag|
      @articles[tag.name] = del.posts(100, [tag.name])
    end
  end

  def build_files()
    Dir.chdir('erb') do
      Dir.glob('**/*') do |fname|
        if File.directory?(fname)
          @new_dirs << fname
        else
          @new_files[fname] = ERB.new(IO.read(fname)).result(binding)
        end
      end
    end
    @new_dirs << JSONP_DIR unless @new_dirs.include?(JSONP_DIR)
    json = WebAPI::Json.new
    @articles.each do |tag, posts|
      p = posts.map { |post| { "t" => post.title, "u" => post.url } }
      @new_files["#{JSONP_DIR}/#{tag}.js"] =
        "tplRegistCategory(\"#{json.escape(tag)}\", #{json.build(p)});"
    end
  end

  def update_current()
    Dir.chdir(@current_path) do
      @new_dirs.sort! { |a, b| a<=>b }
      @new_dirs.each do |dirname|
        FileUtils.mkdir(dirname)
      end
      @new_files.each do |fname, content|
        File.open(fname, 'wb') do |file|
          file.write(content)
        end
      end
    end
  end

  def upload()
    @new_dirs.sort! { |a, b| a<=>b }
    @new_dirs.each do |dir|
      unless File.exist?("#{@old_path}/#{dir}")
        @ftp.mkdir("#{@remote_path}/#{dir}")
      end
    end
    @new_files.each_key do |fname|
      @ftp.putbinaryfile("#{@current_path}/#{fname}",
                         "#{@remote_path}/#{fname}")
    end
  end

  def post_process()
    FileUtils.rm_rf(@old_path)
    FileUtils.cp_r(@current_path, @old_path)
  end

  def do()
    begin
      prepare()
      fetch_articles()
      build_files()
      update_current()
      upload()
      post_process()
    ensure
      @ftp.close if @ftp
    end
  end

end

Update.new(LIVEDOOR, 'current', 'old', '/categories').do()
