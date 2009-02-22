class Site < ActiveRecord::Base
  has_one  :preference, :dependent => :delete, :class_name => 'SitePreference'
  has_many :articles,   :dependent => :delete_all

  attr_protected :id, :created_at, :updated_at, :preference, :articles

  validates_presence_of :title
  validates_format_of   :url, :with => /\Ahttps?:\/\//u

  def format_title(page_title)
    self.title_format.gsub(/%(\w*)%/u) do |match|
      case $1
      when 'page_title' then page_title
      when 'site_title' then title
      when '',NilClass  then '%'
      else                   match
      end
    end
  end

  def full_url(first, *paths)
    if Symbol === first
      File.join(self.url, self.__send__(first))
    else
      File.join(self.url, first, *paths)
    end
  end

  def method_missing(name, *args)
    sname = name.to_s
    if SitePreference.columns_hash.has_key?(sname)
      self.preference[sname]
    else
      super
    end
  end

  def respond_to?(name, include_private = false)
    if SitePreference.columns_hash.has_key?(name.to_s)
      true
    else
      super
    end
  end

end
