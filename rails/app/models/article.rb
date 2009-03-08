class Article < ActiveRecord::Base
  belongs_to     :site
  attr_protected :id, :created_at, :updated_at, :site_id, :site, :published

  AVAILABLE_PARSERS = Parser::Base.all_parsers.map{|k| k.name }

  validates_presence_of   :page_name
  validates_uniqueness_of :page_name
  validates_inclusion_of  :parser, :in => AVAILABLE_PARSERS
  validates_presence_of   :title
  validates_presence_of   :body1

  def url()             self.site.full_url(self.site.article_path, self.page_name + '.html') end
  def full_title()      self.site.format_title(self.title) end

  def page_name=(value) self[:page_name] = value.strip end
  def title=(value)     self[:title]     = value.strip end

  def body1=(value)
    self[:body1]     = value.to_s.gsub(/\r\n|\n|\r/u, "\n")
    @formatted_body1 = nil
  end

  def body2=(value)
    self[:body2] = value.to_s.gsub(/\r\n|\n|\r/u, "\n")
    @formatted_body2 = nil
  end

  def formatted_body1
    parse() unless @formatted_body1
    @formatted_body1
  end

  def formatted_body2
    parse() unless @formatted_body2
    @formatted_body2
  end

  def upload_googledocs(cache = {})
    return nil if self.site.google_account.blank? || self.site.google_password.blank?
    article_list_cache = cache[:article_list] || {}
    if self.site.article_list_key
      opts = {
        :user         => self.site.google_account,
        :password     => self.site.google_password,
        :document_id  => self.site.article_list_key,
        :worksheet_id => article_list_cache[:worksheet_id],
        :visibility   => 'private',
        :projection   => 'full'
      }
      unless opts[:worksheet_id]
        sheet = GData::Spreadsheets::Worksheet.generate_subclass(opts).find(:first)
        opts[:worksheet_id] = sheet.id if sheet
      end
      if opts[:worksheet_id]
        klass = article_list_cache[:list_class] || GData::Spreadsheets::List.generate_subclass(opts)
        page  = ERB::Util.h(self.page_name)
        rows  = (article_list_cache[:rows] ?
                 article_list_cache[:rows].select{|r| r.gsx_pagename == page } :
                 klass.find(:all, :params => { :sq => %(pagename="#{page}") }))
        rows << klass.new if rows.empty?
        (rows[1..-1]||[]).each{|r| r.destroy }
        rows[0].gsx_pagename = self.page_name
        rows[0].gsx_title    = self.title
        rows[0].save
      end
      article_list_cache = {
        :document_id  => opts[:document_id],
        :worksheet_id => opts[:worksheet_id],
        :list_class   => klass,
        :rows         => article_list_cache[:rows]
      }
    end
    { :article_list => article_list_cache }
  end

  private

  def parse()
    parser  = Parser::Base.find(self.parser).new
    @formatted_body1, @formatted_body2 = parser.parse(self.body1||'', self.body2||'')
  end

end
