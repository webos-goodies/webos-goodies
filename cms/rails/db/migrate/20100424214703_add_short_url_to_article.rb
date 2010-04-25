class AddShortUrlToArticle < ActiveRecord::Migration
  def self.up
    add_column :articles, :short_url, :string, :null => false, :default => ''
  end

  def self.down
    remove_column :articles, :short_url
  end
end
