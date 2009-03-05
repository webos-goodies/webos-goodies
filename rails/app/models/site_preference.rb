class SitePreference < ActiveRecord::Base
  belongs_to :site

  attr_protected :id, :site, :site_id, :refreshed_at

  def ftp_password=(value)
    self[:ftp_password] = value unless value.blank?
  end

  def google_password=(value)
    self[:google_password] = value unless value.blank?
  end

end
