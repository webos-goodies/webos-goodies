require 'nkf'

module LivedoorBlog

  class Meta

    def initialize(source='')
      @items = {}
      source.each do |line|
        if /^([^:]+):\s+(.+)$/u === line
          ($1 == 'CATEGORY') ? ((@items[$1] ||= []) << $2) : (@items[$1] = $2)
        end
      end
      if @items['DATE'] && /^(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+):(\d+)$/u === @items['DATE']
        @items['DATE'] = Time.local($3, $1, $2, $4, $5, $6)
      end
    end

    def method_missing(name, *args)
      key = name.to_s.upcase.gsub('_', ' ')
      @items.has_key?(key) ? @items[key] : super
    end

  end

  class Body

    def initialize(*texts)
      @wiki  = false
      @texts = texts.compact
      text   = @texts.join
      if /\A\s*<div\s*class="dokuwiki">/u === text
        @wiki = false
      elsif !(/<\/\w+>/u === text)
        @wiki = true
      elsif text.scan(/\[\[[^\]\n\r]+\]\]/u).size > text.scan(/<\/\w+>/u).size
        @wiki = true
      else
      end
    end

    def [](index) @texts[index] end
    def wiki?()   @wiki         end

  end

  class Article

    def initialize(text)
      blocks = text.split(/^-----\n/)
      raise "Illegal backup file :\n" + text if blocks.size < 3
      @meta = Meta.new(blocks.shift)
      body1 = nil
      body2 = nil
      blocks.each do |block|
        unless block.strip.empty?
          label = nil
          block.sub!(/\A(.+)\n/u){ label = $1; '' }
          raise "Illegal backup file :\n" + block unless label
          case label
          when 'BODY:'
            body1 = block
          when 'EXTENDED BODY:'
            body2 = block
          end
        end
      end
      @body = Body.new(body1, body2)
    end

    def meta() @meta end
    def body() @body end

  end

  class ExportData

    def initialize(fname)
      @articles = []
      backup = IO.read(File.join(RAILS_ROOT, 'db/backup.htm'))
      backup = NKF.nkf('-wE', backup).gsub(/\r\n|\n|\r/u, "\n")
      backup.split(/^--------\n/).each do |article_text|
        unless article_text.strip.empty?
          @articles << Article.new(article_text)
        end
      end
      @articles.reverse!
    end

    def each(&block)
      @articles.each(&block)
    end

  end

end
