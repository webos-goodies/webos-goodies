class AddArticleListKeyToSitePreference < ActiveRecord::Migration
  def self.up
    add_column :site_preferences, :article_list_key, :string, :null => false, :default => ''
  end

  def self.down
    remove_column :site_preferences, :article_list_key
  end
end
