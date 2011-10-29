class CreateCategories < ActiveRecord::Migration
  def self.up
    create_table :categories do |t|
      t.timestamps
      t.integer :site_id
      t.string  :name,        :null => false, :default => ''
      t.string  :title,       :null => false, :default => ''
      t.text    :description, :null => false, :default => ''
      t.string  :tags,        :null => false, :default => ''
    end
    add_index :categories, :name, :unique => true
  end

  def self.down
    drop_table :categories
  end
end
