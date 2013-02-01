class AddS3AccountToSitePreferences < ActiveRecord::Migration
  def self.up
    add_column :site_preferences, :aws_id,     :string, :null => false, :default => ''
    add_column :site_preferences, :aws_secret, :string, :null => false, :default => ''
  end

  def self.down
    remove_column :site_preferences, :aws_secret
    remove_column :site_preferences, :aws_id
  end
end
