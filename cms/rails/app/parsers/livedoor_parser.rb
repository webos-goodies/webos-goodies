# -*- coding: utf-8 -*-
require 'wikiparser/wikiparser.rb'
require 'nkf'
require 'net/http'
require 'net/https'
require 'uri'

class LivedoorParser < Parser::Base

  class LivedoorWikiParser < WikiParser::Parser
    include ActionView::Helpers::TextHelper

    URI_LETTERS    = '\w#%&()=\-+~|@\[\]{}:;?.,'
    IMAGE_SUFFIXES = /\A(?:\.jpg|\.jpeg|\.png|\.gif)\z/ui
    SCHEMA         = '(?:https?|ftp):\/\/'
    SCHEMA_REGEXP  = /^#{SCHEMA}/u
    EOL            = "(?:\n|\z)"
    WIKI_URL       = 'http://wiki.livedoor.jp/sourcewalker/d/'

    enable_character_reference
    add_entities({ 'lt' => '<', 'gt' => '>', 'quot' => '"', 'apos' => "'", 'amp' => '&' })

    # 見出し
    block_syntax(/^(\*+)(.+)/u) do |match, parser|
      if (1..6) === match[1].length
        WikiParser::BlockTagSection.new(match[2], 'h' + match[1].length.to_s)
      end
    end

    # 水平線
    block_syntax(/^----.*#{EOL}/u) do |match, parser|
      WikiParser::BlockTagSection.new('', 'hr')
    end

    # 番号付きリスト
    block_syntax(/(?:^\+.*#{EOL})+/u) do |match, parser|
      parser.scanner.string = match[0]
      parser.list('ol', /^(\++)(.*)#{EOL}/u)
    end

    # 番号なしリスト
    block_syntax(/(?:^-.*#{EOL})+/u) do |match, parser|
      parser.scanner.string = match[0]
      parser.list('ul', /^(-+)(.*)#{EOL}/u)
    end

    # 定義リスト
    block_syntax(/(?:^\:[^\r\n|]*\|.*#{EOL})+/u) do |match, parser|
      children = []
      match[0].each_line do |line|
        if /^\:([^\r\n|]*)\|(.*)/u === line
          children << WikiParser::BlockTagSection.new($1, 'dt')
          children << WikiParser::BlockTagSection.new($2, 'dd')
        end
      end
      { :section => WikiParser::BlockTagSection.new('', 'dl'), :children => children }
    end

    # フォーマット済みテキスト
    block_syntax(/(?:^[ ^].*#{EOL})+/u) do |match, parser|
      text = match[0].gsub(/^[ ^]/u, '')
      WikiParser::BlockTagSection.new(text, 'pre', :filter => false, :syntax => nil)
    end

    # 引用
    block_syntax(/(?:^\>.*#{EOL})+/u) do |match, parser|
      text = match[0].gsub(/^\>/u, '')
      WikiParser::BlockTagSection.new(text, 'blockquote')
    end

    # テーブル
    block_syntax(/(?:^\|.*#{EOL})+/u) do |match, parser|
      children = []
      match[0].each_line do |line|
        children << {
          :section => WikiParser::BlockTagSection.new('', 'tr'),
          :children => parser.table_row(line)
        }
      end
      { :section => WikiParser::BlockTagSection.new('', 'table'), :children => children }
    end

    # 斜体
    inline_syntax(/'''([^\n']+)'''/u) do |match, parser|
      WikiParser::InlineTagSection.new(match[1], 'em')
    end

    # 強調
    inline_syntax(/''([^\n']+)''/u) do |match, parser|
      WikiParser::InlineTagSection.new(match[1], 'strong')
    end

    # 下線付き
    inline_syntax(/%%%([^\n']+)%%%/u) do |match, parser|
      WikiParser::InlineTagSection.new(match[1], 'u')
    end

    # 取り消し線
    inline_syntax(/%%([^\n']+)%%/u) do |match, parser|
      WikiParser::InlineTagSection.new(match[1], 'del')
    end

    # 色指定
    inline_syntax(/\&color\(\s*([\w#]+)\s*\)\{(.*)\}/u) do |match, parser|
      WikiParser::InlineTagSection.new(match[2], 'span', :attributes => { 'style' => "color:#{match[1]};" })
    end

    # 文字サイズ指定
    inline_syntax(/\&size\(\s*(\d+)\s*\)\{(.*)\}/u) do |match, parser|
      WikiParser::InlineTagSection.new(match[2], 'span', :attributes => { 'style' => "font-size:#{match[1]}px;" })
    end

    # リンク
    inline_syntax(/\[\[([^>\[\]\r\n]+)(?:>([^\[\]\r\n]+))?\]\]/u) do |match, parser|
      text = match[1]
      url  = match[2] || match[1]
      if SCHEMA_REGEXP === text && IMAGE_SUFFIXES === File.extname(text)
        text = parser.image(text)
      end
      if SCHEMA_REGEXP === url
        parser.link(url, text)
      else
        hash = ''
        if /^([^#]+)(#.*)/u === url
          url  = $1
          hash = NKF.nkf('-We', $2)
        end
        parser.link(WIKI_URL + ERB::Util.u(NKF.nkf('-We', url)) + hash, text)
      end
    end

    # URL
    inline_syntax(/#{SCHEMA}[#{URI_LETTERS}\/]+/u) do |match, parser|
      url = match[0]
      if IMAGE_SUFFIXES === File.extname(url)
        parser.image(url)
      else
        parser.link(url, parser.truncate(url, :length => 53))
      end
    end

    # 改行
    inline_syntax(/&br;/u) do |match, parser|
      WikiParser::InlineTagSection.new('', 'br', :syntax => nil, :filter => false)
    end

    # ソースコード（HTML より先に解析しないと、ソース中に <html> タグがあったときにおかしくなる）
    tag_syntax(/^<code([^>]*)>(.*?)^<\/code>\s*$/mu) do |match, parser|
      text  = match[2]
      attrs = { 'class' => 'prettyprint' }
      match[1].gsub(/(?:^|\s)(\w+)=\"([^\"]*)\"/mu) do
        name, value = $1, CGI.unescapeHTML($2)
        case name
        when 'lang'
          attrs['class'] = "#{attrs['class']} lang-#{CGI.escapeHTML(value.strip)}"
        when 'src'
          text = WikiParser::Utils.wiki_escape(parser.fetch_url(value));
        when 'height'
          attrs['style'] = (attrs['style']||'') + "height:#{value}px;overflow:auto;"
        end
        ''
      end
      parser.set_prettify()
      options = { :attributes => attrs, :filter => false, :syntax => nil }
      WikiParser::BlockTagSection.new(text, 'pre', options)
    end

    # HTML
    tag_syntax(/^<html>(.*?)^<\/html>\s*$/mu) do |match, parser|
      WikiParser::BlockTagSection.new(match[1], 'rawhtml', :filter => false, :syntax => [])
    end

    # 引用
    tag_syntax(/^<quote>(.*?)^<\/quote>\s*$/mu) do |match, parser|
      text = match[1]
      opts = { :attributes => { 'class' => 'tpl_nest' } }
      WikiParser::RootTagSection.new(text, 'blockquote', opts)
    end

    # 複雑な表
#     tag_syntax(/^<table([^>]*)>(.*?)^<\/table>\s*$/mu) do |match, parser|
#       opts = { :attributes => {} }
#       match[1].gsub(/(?:^|\s)(\w+)=\"([^\"]*)\"/mu) do
#         name, value = $1, CGI.unescapeHTML($2)
#         case name
#         when 'class'
#           opts[:attributes]['class'] = "#{CGI.escapeHTML(value.strip)}"
#         end
#         ''
#       end

#       rows = []
#       match[2].split(/^={4,}\s*$/u).each do |text|
#         unless (text.strip! || text).empty?
#           if text[0,1] == '|'
#             text.each_line{|line| rows << parser.table_row(line) }
#           else
#             rows << parser.complex_table_row(text)
#           end
#         end
#       end
#       rows.compact!
#       num_columns = rows.inject(0) {|v, row| row.length > v ? row.length : v }
#       rows = rows.map do |row|
#         if !row.empty? && (colspan = num_columns - row.length) > 0
#           row.last.add_attributes('colspan' => (colspan + 1).to_s)
#         end
#         { :section => WikiParser::BlockTagSection.new('', 'tr'), :children => row }
#       end
#       { :section => WikiParser::BlockTagSection.new('', 'table', opts), :children => rows }
#     end

    # ---- メソッド --------------------------------------------------

    def initialize()
      @prettify = false
      super
    end

    def set_prettify() @prettify = true end
    def prettify?() @prettify end

    def fetch_url(url, limit = 3)
      if limit <= 0
        'http redirect too deep'
      else
        Net::HTTP.version_1_2
        uri = URI.parse(url)
        http = Net::HTTP.new(uri.host, uri.port)
        if uri.scheme == 'https'
          http.use_ssl = true
          http.verify_mode = OpenSSL::SSL::VERIFY_NONE
        end

        response = nil
        http.start do |h|
          response = h.get(uri.path + (uri.query ? '?' + uri.query : ''))
        end

        case response
        when Net::HTTPSuccess     then response.body
        when Net::HTTPRedirection then fetch_url(response['location'], limit - 1)
        else                           response.message
        end
      end
    end

    # ---- 下位ルーチン ----------------------------------------------

    def list(tag, regexp, level=1)
      scnr     = self.scanner
      children = []
      while(scnr.scan(regexp))
        line_level = scnr[1].length
        if line_level == level
          children << WikiParser::BlockTagSection.new(scnr[2], 'li')
        elsif line_level > level
          scnr.unscan
          children << list(tag, regexp, level+1)
        else
          scnr.unscan
          break
        end
      end
      { :section => WikiParser::BlockTagSection.new('', tag), :children => children }
    end

    def table_row(line)
      tag  = (/\|\~/u === line ? 'th' : 'td')
      (columns = line.strip.split(/\|\~?/u)).shift
      columns.map do |text|
        WikiParser::BlockTagSection.new(text.strip, tag)
      end
    end

    def complex_table_row(text)
      children = []
      tag      = 'td'
      while /\A(.*?)^([-+]{4,})\s*$/mu === text
        cell_text = $1.strip
        separator = $2
        text      = $'
        children << complex_table_cell(cell_text, tag)
        tag = separator[0, 1] == '+' ? 'th' : 'td'
      end
      children << complex_table_cell(text, tag)
      children.compact!
      children.empty? ? nil : children
    end

    def complex_table_cell(text, tag)
      opts = { :attributes => { 'class' => 'tpl_nest' } }
      text.empty? ? nil : WikiParser::RootTagSection.new(text.strip + "\n", tag, opts)
    end

    def link(url, content)
      options = { :attributes => { 'href' => url }, :syntax => nil, :filter => false }
      if String === content
        WikiParser::InlineTagSection.new(content, 'a', options)
      else
        { :section => WikiParser::InlineTagSection.new('', 'a', options), :children => content }
      end
    end

    def image(url)
      options = { :attributes => { 'src' => url }, :syntax => nil, :filter => false }
      WikiParser::InlineTagSection.new('', 'img', options)
    end

  end

  Label = "Livedoor"

  def parse(*documents)
    parser = LivedoorWikiParser.new
    doc    = parser.parse(documents.map{|s| (s||'').to_s.strip + "\n"})
    self.set_meta('prettify', parser.prettify?)
    WikiParser::HtmlFormatter.new.format(doc)
  end

end
