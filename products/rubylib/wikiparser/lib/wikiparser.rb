# 同じ Wiki 文法がネストすることはできない。
# 解析中は $ が $d$ に置き換えられているので注意。
# Wiki 文法は正しく入れ子にならなければならない。

require 'rexml/document'
require 'strscan'

module WikiParser

  class WikiParserError < StandardError; end
  class NotImplementedError < WikiParserError; end
  class SyntaxDefinitionError < WikiParserError
    def initialize(syntax, msg=nil)
      @syntax = syntax
      super(msg || 'WikiParser : Illegal syntax definition.')
    end
    attr_accessor :syntax
  end

  module InheritableList
    def self.included(mod)
      def mod.each_inheritable(key, &block)
        @inheritable_lists ||= {}
        if superclass.respond_to?(:each_inheritable, true)
          superclass.__send__(:each_inheritable, key, &block)
        end
        if @inheritable_lists.has_key?(key)
          @inheritable_lists[key].each(&block)
        end
        nil
      end
      def mod.push_to_inheritable(key, *values)
        @inheritable_lists      ||= {}
        @inheritable_lists[key] ||= []
        @inheritable_lists[key].push(*values)
      end
    end
  end

  module Utils
    def wiki_escape(text)
      text.gsub('$', '$d$')
    end
    def wiki_unescape(text)
      text.gsub('$d$', '$')
    end
  end

  class Section
    attr_accessor :text

    def to_xml(sections, scanner) raise NotImplementedError.new end
    def block?() @block end

    protected

    def initialize(text, options)
      @text  = text
      @block = options[:block]
    end

    def generate_children(text, sections, scanner)
      scanner.string = text
      children       = []
      until(scanner.eos?)
        str = scanner.scan(/[^$]*/u)
        (String === children.last ? children.last : children) << str if str && !str.empty?
        while(str = scanner.scan(/\$/u))
          if scanner.scan(/(\d+)\$/u)
            section = sections[scanner[1].to_i]
            children << section if section
          elsif scanner.scan(/d\$/u)
            (String === children.last ? children.last : children) << '$'
          end
        end
      end
      children
    end

    def generate_element(element, children, sections, scanner)
      children.each do |child|
        if Section === child
          e = child.to_xml(sections, scanner)
          element.add(e) if e
        else
          element.add_text(child)
        end
      end
      element
    end

  end

  class TagSection < Section
    def initialize(text, tag, options={})
      @element = REXML::Element.new(tag)
      @element.add_attributes(options[:attributes]) if options[:attributes]
      super(text, options)
    end

    def to_xml(sections, scanner)
      children = generate_children(@text, sections, scanner)
      generate_element(@element, children, sections, scanner)
    end
  end

  class InlineTagSection < TagSection
    def initialize(text, tag, options={}) super(text, tag, {:block=>false}.update(options)) end
  end

  class BlockTagSection < TagSection
    def initialize(text, tag, options={}) super(text, tag, {:block=>true}.update(options)) end
  end

  class RootSection < Section
    def initialize(text, options={})
      @element = REXML::Element.new('wiki')
      super(text, options)
    end

    def to_xml(sections, scanner)
      self.text.each_line('') do |paragraph|
        last = generate_children(paragraph.strip, sections, scanner).inject([]) do |children, child|
          if Section === child && child.block?
            create_paragraph(children, sections, scanner)
            e = child.to_xml(sections, scanner)
            @element.add(e) if e
            []
          else
            children << child
          end
        end
        create_paragraph(last, sections, scanner)
      end
      @element
    end

    private

    def create_paragraph(children, sections, scanner)
      return if !children || children.empty?
      e = REXML::Element.new('p')
      generate_element(e, children, sections, scanner)
      @element.add(e)
    end
  end

  class Parser
    include InheritableList
    include Utils

    attr_reader :scanner, :sections

    def initialize()
      @scanner = StringScanner.new('')
    end

    def parse(src, opts = {})
      @sections = [RootSection.new(wiki_escape(src))]
      [:tag_syntaxes, :block_syntaxes, :inline_syntaxes].each do |key|
        self.class.each_inheritable(key){|syntax| apply_syntax(syntax) }
      end
      @sections.freeze
      doc = REXML::Document.new
      e   = @sections[0].to_xml(@sections, @scanner)
      doc.add(e) if e
      doc
    end

    def self.add_tag_syntax(syntax, &block)
      syntax[:proc] = block if block
      raise SyntaxDefinitionError.new(syntax) unless Regexp === syntax[:pattern]
      raise SyntaxDefinitionError.new(syntax) unless syntax[:proc]
      push_to_inheritable(:tag_syntaxes) << syntax
    end

    def self.add_block_syntax(syntax, &block)
      syntax[:proc] = block if block
      raise SyntaxDefinitionError.new(syntax) unless Regexp === syntax[:pattern]
      raise SyntaxDefinitionError.new(syntax) unless syntax[:proc]
      push_to_inheritable(:block_syntaxes) << syntax
    end

    def self.add_inline_syntax(syntax, &block)
      syntax[:proc] = block if block
      raise SyntaxDefinitionError.new(syntax) unless Regexp === syntax[:pattern]
      raise SyntaxDefinitionError.new(syntax) unless syntax[:proc]
      push_to_inheritable(:inline_syntaxes) << syntax
    end

    private

    def apply_syntax(syntax)
      processed = []
      current   = @sections
      until(current.empty?)
        new_sections = []
        current.each do |section|
          section.text.gsub!(syntax[:pattern]) do |matched|
            sections = [*syntax[:proc].call(Regexp.last_match)]
            base   = processed.length + current.length + new_sections.length
            new_sections += sections
            (base ... (base+sections.length)).map{|n| "$#{n}$" }.join
          end
        end
        processed += current
        current    = new_sections
      end
      @sections = processed
    end

  end

end
