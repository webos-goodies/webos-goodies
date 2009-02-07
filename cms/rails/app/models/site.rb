class Site < ActiveRecord::Base
  has_one  :site_preference, :dependent => :destroy
  has_many :articles,        :dependent => :destroy

  validates_presence_of :title
  validates_presence_of :url
  validates_presence_of :settings

  def preferences()
    self.site_preference ? (self.site_preference.preferences || {}) : {}
  end

  def preferences=(prefs)
    self.site_preference = SitePreference.new if self.site_preference.nil?
    self.site_preference.preferences = prefs
  end

end
