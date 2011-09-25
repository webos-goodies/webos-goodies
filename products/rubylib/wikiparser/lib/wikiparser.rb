# -*- coding: utf-8 -*-
# 同じ Wiki 文法がネストすることはできない。
# 解析中は $ が $d$ に置き換えられているので注意。
# Wiki 文法は正しく入れ子にならなければならない。
# http:- をリンクに変換する時など、section のテキストに変換前と同じ文字列を設定する時は、 syntax を空にすること。

require 'rexml/document'
require 'strscan'
require 'stringio'

module WikiParser

  class WikiParserError < StandardError; end
  class NotImplementedError < WikiParserError; end
  class IllegalSectionError < WikiParserError; end
  class SyntaxDefinitionError < WikiParserError; end

  module InheritableList
    def self.included(mod) mod.extend(ClassMethods) end
    def self.extended(mod) mod.extend(ClassMethods) end

    module ClassMethods
      def each_inheritable(key, &block)
        @inheritable_lists ||= {}
        if superclass.respond_to?(:each_inheritable, true)
          superclass.__send__(:each_inheritable, key, &block)
        end
        if @inheritable_lists.has_key?(key)
          @inheritable_lists[key].each(&block)
        end
        nil
      end

      def push_to_inheritable(key, *values)
        @inheritable_lists      ||= {}
        @inheritable_lists[key] ||= []
        @inheritable_lists[key].push(*values)
      end
    end
  end

  module Utils
    module_function
    def wiki_escape(text)
      text.gsub('$', '$d$')
    end
    def wiki_unescape(text)
      text.gsub('$d$', '$')
    end
    def hesc(str)
      str.gsub(/&/u, '&amp;').gsub(/</u, '&lt;').gsub(/>/u, '&gt;').gsub(/"/u, '&quot;').gsub(/'/u, '&#39;')
    end
  end

  class Section
    include Utils

    attr_accessor :text
    attr_reader   :syntax

    def to_xml(sections, scanner) raise NotImplementedError.new end
    def block?() @block end
    def filter?() @filter end

    protected

    def initialize(text, options)
      @text   = text
      @block  = options[:block]
      @syntax = [*(options[:syntax]||[])]
      @filter = options.fetch(:filter, true)
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
          element.add_text(hesc(child))
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
    def initialize(text, tag, options={})
      super(text, tag, {:block => false, :syntax => :inline }.update(options))
    end
  end

  class BlockTagSection < TagSection
    def initialize(text, tag, options={})
      super(text, tag, {:block => true, :syntax => :inline }.update(options))
    end
  end

  class RootTagSection < Section
    def initialize(text, tag, options={:syntax => [:tag, :block, :inline]})
      @element = REXML::Element.new(tag)
      @element.add_attributes(options[:attributes]) if options[:attributes]
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
      children.first.lstrip! if String === children.first
      children.last.rstrip!  if String === children.last
      return if children.size == 1 && String === children[0] && children[0].empty?
      e = REXML::Element.new('p')
      generate_element(e, children, sections, scanner)
      @element.add(e)
    end
  end

  class RootSection < RootTagSection
    def initialize(text, options={})
      super(text, 'wiki')
    end
  end

  class Parser
    include InheritableList
    include Utils

    @@entities      = nil
    @@character_ref = false

    attr_reader :scanner, :sections

    def initialize()
      @scanner = StringScanner.new('')
    end

    def parse(sources)
      doc  = REXML::Document.new(nil, :raw => :all)
      root = REXML::Element.new('root')
      [*sources].each do |src|
        @sections = [RootSection.new(wiki_escape(src.gsub(/(?:\r\n|\r|\n)/u, "\n")))]
        [:tag_syntaxes, :block_syntaxes, :inline_syntaxes].each do |key|
          self.class.each_inheritable(key){|syntax| apply_syntax(syntax) }
        end
        replace_entities()
        @sections.freeze
        e = @sections[0].to_xml(@sections, @scanner)
        root.add(e) if e
      end
      doc.add(root)
      doc
    end

    def self.tag_syntax(pattern, options={}, &block)
      add_syntax(:tag_syntaxes, pattern, options, block)
    end

    def self.block_syntax(pattern, options={}, &block)
      add_syntax(:block_syntaxes, pattern, options, block)
    end

    def self.inline_syntax(pattern, options={}, &block)
      add_syntax(:inline_syntaxes, pattern, options, block)
    end

    def self.add_syntax(type, pattern, options, callback)
      callback ||= options[:method]
      unless Regexp === pattern && Proc === callback
        raise SyntaxDefinitionError.new('Illegal arguments.')
      end
      push_to_inheritable(type) << {
        :type    => type.to_s.gsub(/_syntaxes$/, '').to_sym,
        :pattern => pattern,
        :proc    => callback
      }
    end

    def self.add_entities(*params)
      @@entities ||= {}
      if Hash === params[0]
        params[0].each{|key, value| @@entities[key.to_s] = value.to_s }
      elsif params[0].respond_to(:to_s) && params[1].respond_to(:to_s)
        @@entities[params[0].to_s] = params[1].to_s
      else
        raise ArgumentError.new('Arguments of WikiParser::Parser.add_entities must be a hash or two strings.')
      end
      @@entity_regexp = nil
      nil
    end

    def self.enable_character_reference()
      @@character_ref = true
    end

    private

    def apply_syntax(syntax)
      processed = []
      current   = @sections
      until(current.empty?)
        new_sections = []
        base         = processed.length + current.length
        current.each do |section|
          if section.syntax.include?(syntax[:type])
            section.text.gsub!(syntax[:pattern]) do |matched|
              sections = syntax[:proc].call(Regexp.last_match, self)
              if sections
                add_section_array(new_sections, base, sections)
              else
                matched
              end
            end
          end
        end
        processed += current
        current    = new_sections
      end
      @sections = processed
    end

    def add_section_array(new_sections, base, array)
      indices = []
      (Array === array ? array : [array]).each do |section|
        case section
        when Section
          indices << base + (new_sections << section).length - 1
        when Hash
          indices << add_section_hash(new_sections, base, section)
        else
          raise IllegalSectionError.new('A return value of a syntax callback must be a section, an array of sections or a hash of section tree.')
        end
      end
      indices.map{|n| "$#{n}$" }.join
    end

    def add_section_hash(new_sections, base, hash)
      unless Section === hash[:section]
        raise IllegalSectionError.new('A section must be an instance of Section.')
      end
      index = base + (new_sections << hash[:section]).length - 1
      if hash[:children]
        hash[:section].text += add_section_array(new_sections, base, hash[:children])
      end
      index
    end

    def replace_entities()
      return nil if !@@entities && !@@character_ref
      entities = @@entities || {}
      @sections.each do |section|
        if section.filter?
          section.text.gsub!(/&(#[xX]?)?(\w+);/u) do |match|
            if $1 && @@character_ref
              [$2.to_i($1 == '#' ? 10 : 16)].pack('U')
            else
              entities[$2] || match
            end
          end
        end
      end
    end

  end

  class HtmlFormatter
    include Utils

    OPEN_TAGS = Hash[*['img', 'input', 'br', 'col', 'embed', 'hr',
                       'link', 'meta', 'param', 'wbr'].map{|k| [k,true]}.flatten]
    BLOCK_TAGS = Hash[*['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr',
                        'div', 'p', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
                        'table', 'tr', 'caption', 'tbody', 'thead', 'tfoo',
                        'colgroup', 'pre', 'blockquote'].map{|k| [k,true]}.flatten]
    GROUP_TAGS = Hash[*['table', 'tbody', 'thead', 'tfoot',
                        'ul', 'ol', 'dl'].map{|k| [k,true]}.flatten]

    def format(doc)
      doc.elements.to_a('/root/wiki').map do |element|
        @output = StringIO.new
        element.each do |child|
          case child
          when REXML::Text:    @output << hesc(child.value)
          when REXML::Element: render_element(child)
          end
        end
        @output.string
      end
    end

    def render_element(element)
      node_name       = element.fully_expanded_name
      node_name_lower = node_name.downcase
      if node_name_lower != 'rawhtml'
        @output << "<#{node_name}"
        @output << element.attributes.map{|k,v| " #{hesc(k)}=\"#{hesc(v)}\"" }.join
        @output << '>'
        @output << "\n" if GROUP_TAGS[node_name_lower]
        if element.size > 0
          element.each do |child|
            case child
            when REXML::Text:    @output << hesc(child.value)
            when REXML::Element: render_element(child)
            end
          end
          @output << "</#{node_name}>"
        elsif !OPEN_TAGS[node_name_lower]
          @output << "</#{node_name}>"
        end
        @output << "\n" if BLOCK_TAGS[node_name_lower]
      else
        element.each do |child|
          @output << child.value if REXML::Text === child
        end
      end
    end

  end

end
