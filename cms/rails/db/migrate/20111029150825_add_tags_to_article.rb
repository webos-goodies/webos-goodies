class AddTagsToArticle < ActiveRecord::Migration
  def self.up
    add_column :articles, :tags, :string
  end

  def self.down
    remove_column :articles, :tags
  end
end
