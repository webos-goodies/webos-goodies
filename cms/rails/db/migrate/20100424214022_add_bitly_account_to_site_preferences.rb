class AddBitlyAccountToSitePreferences < ActiveRecord::Migration
  def self.up
    add_column :site_preferences, :bitly_user,   :string, :null => false, :default => ''
    add_column :site_preferences, :bitly_apikey, :string, :null => false, :default => ''
  end

  def self.down
    remove_column :site_preferences, :bitly_user
    remove_column :site_preferences, :bitly_apikey
  end
end
