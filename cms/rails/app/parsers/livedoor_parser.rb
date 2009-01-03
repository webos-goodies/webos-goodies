require 'wikiparser/wikiparser.rb'
require 'nkf'

class LivedoorParser < Parser::Base

  class LivedoorWikiParser < WikiParser::Parser
    include ActionView::Helpers::TextHelper

    URI_LETTERS    = '\w#%&()=\-+~|@\[\]{}:;?.,'
    IMAGE_SUFFIXES = %w".jpg .jpeg .png .gif"
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

    # 引用（歴史的理由により、 pre 扱い ＾＾；）
    block_syntax(/(?:^>.*#{EOL})+/u) do |match, parser|
      text = match[0].gsub(/^>/u, '')
      WikiParser::BlockTagSection.new(text, 'pre')
    end

    # テーブル
    block_syntax(/(?:^\|.*#{EOL})+/u) do |match, parser|
      children = []
      match[0].each_line{|line| children << parser.table_row(line) }
      { :section => WikiParser::BlockTagSection.new('', 'table'), :children => children.flatten }
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

    # リンク
    inline_syntax(/\[\[([^>\[\]\r\n]+)(?:>([^\[\]\r\n]+))?\]\]/u) do |match, parser|
      text = match[1]
      url  = match[2] || match[1]
      if SCHEMA_REGEXP === text && IMAGE_SUFFIXES.include?(File.extname(text))
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
      if IMAGE_SUFFIXES.include?(File.extname(url))
        parser.image(url)
      else
        parser.link(url, parser.truncate(url, :length => 53))
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
      children = columns.map do |text|
        WikiParser::BlockTagSection.new(text.strip, tag)
      end
      { :section => WikiParser::BlockTagSection.new('', 'tr'), :children => children }
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
    LivedoorWikiParser.new.parse(documents).elements.to_a('/root/wiki').map do |element|
      '<div class="dokuwiki">' + 
        element.elements.to_a.map{|child| child.to_s }.join('') +
        '</div>'
    end
  end

end
