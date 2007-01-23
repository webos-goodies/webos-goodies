#! /usr/bin/ruby

require 'webapi/delicious'
require 'erb'
require 'fileutils'
require 'net/ftp'
require 'kconv'

require 'account'
require 'caption'
require 'open-uri'

class Update

  JSONP_DIR = 'jsonp'

  class TemplateEngine

    EntityRefMap = {
      '>' => '&lt;',  '<' => '&gt;', '&' => '&amp;', '"' => '&quot;'
    }

    def initialize(template_dir)
      @templates = {}
      Dir.chdir(template_dir) do
        Dir.glob('*') do |fname|
          @templates[fname] = IO.read(fname)
        end
      end
      pluginA = open('http://webos-goodies.jp/archives/plugin_A.inc') do |file|
        file.read
      end
      @pluginA = Kconv.kconv(pluginA, Kconv::UTF8, Kconv::EUC)
    end

    def apply(fname, articles, bundles, captions)
      @basename = File.basename(fname, '.*')
      @articles = articles
      @bundles  = bundles
      @captions = captions
      @template = 'standard'
      @title    = 'No title'
      @content = ERB.new(IO.read(fname)).result(binding)
      if @template
        @content = ERB.new(@templates[@template]).result(binding)
      end
      Kconv.kconv(@content, Kconv::EUC, Kconv::UTF8)
    end

    def list_articles(tag, max = nil, reverse = true)
      posts = max ? @articles[tag][0, max] : @articles[tag]
      posts = posts.reverse if posts.size >= 2 && !reverse
      text = ''
      posts.each do |post|
        url     = post.url
        title   = post.title
        text += '<li><a href="' + url + '">' + title + "</a></li>\n"
      end
      text
    end

    def escapeHTML(str)
      str.gsub('<>&"') do |s|
        EntityRefMap[s]
      end
    end

  end

  def initialize(account, current_path, old_path, remote_path, template_dir)
    @ftp          = nil
    @account      = account
    @current_path = current_path
    @old_path     = old_path
    @remote_path  = remote_path
    @template     = TemplateEngine.new(template_dir)
    @new_files    = {}
    @new_dirs     = []
    @articles     = {}
    @bundles      = {}
  end

  def prepare()
    @ftp = Net::FTP.new(*@account)
    @ftp.passive = true
    FileUtils.rm_rf(@current_path)
    FileUtils.mkdir(@current_path)
  end

  def fetch_articles()
    del = WebAPI::Delicious.new(*DELICIOUS)
    print "Fetching tags...\n"
    del.get_bundles().each do |bundle|
      bundle.tags.each do |tag|
        raise "Two or more bundles have #{tag}." if @bundles.has_key?(tag)
        @bundles[tag] = bundle
      end
    end
    print "Fetching posts...\n"
    all_posts = del.get_posts()
    @bundles.each_key do |tag|
      @articles[tag] = all_posts.collect do |post|
        post.tags.include?(tag) ? post : nil
      end.compact
    end
    # @bundles.each_key do |tag|
    #   print "Fetching #{tag}...\n"
    #   @articles[tag] = del.get_posts('tags' => [tag])
    # end
  end

  def build_files()
    Dir.chdir('erb') do
      Dir.glob('**/*') do |fname|
        if File.directory?(fname)
          @new_dirs << fname
        else
          @new_files[fname] =
            @template.apply(fname, @articles, @bundles, CaptionMap)
        end
      end
    end
    @new_dirs << JSONP_DIR unless @new_dirs.include?(JSONP_DIR)
    json = WebAPI::Json.new
    @articles.each do |tag, posts|
      raise "The caption of #{tag} is not defined." unless CaptionMap[tag]
      fname = "#{JSONP_DIR}/#{tag}.js"
      obj = {}
      obj['p'] = posts.map { |post| { "t" => post.title, "u" => post.url } }
      obj['t'] = tag;
      obj['c'] = CaptionMap[tag]
      @new_files[fname] = "tplRegistCategory(#{json.build(obj)});"
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
        print "mkdir #{@old_path}/#{dir}...\n"
        @ftp.mkdir("#{@remote_path}/#{dir}")
      end
    end
    @new_files.each_key do |fname|
      print "send #{@current_path}/#{fname}...\n"
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

Update.new(LIVEDOOR, 'current', 'old', '/categories', 'templates').do()
