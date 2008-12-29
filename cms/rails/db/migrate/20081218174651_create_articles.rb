class CreateArticles < ActiveRecord::Migration
  def self.up
    create_table :articles do |t|
      t.timestamps
      t.string   :page_name,   :null => false, :default => ''
      t.string   :parser,      :null => false, :default => ''
      t.string   :title,       :null => false, :default => ''
      t.string   :meta,        :null => false, :default => ''
      t.text     :body1,       :null => false, :default => ''
      t.text     :body2,       :null => false, :default => ''
      t.datetime :publish_date
      t.boolean  :published,   :null => false, :default => false
    end
    add_index :articles, :page_name, :unique => true
  end

  def self.down
    drop_table :articles
  end
end
