class CreateSites < ActiveRecord::Migration
  def self.up
    create_table :sites do |t|
      t.timestamps
      t.string :title, :null => false, :default => ''
      t.string :url,   :null => false, :default => ''
    end
    create_table :site_preferences do |t|
      t.integer :site_id
      t.integer :sync_version, :null => false, :default => 0
      t.text    :preferences
    end
    add_column :articles, :site_id, :integer
    connection = ActiveRecord::Base.connection
    site_id = connection.insert("INSERT INTO sites (created_at, updated_at, title, url)" +
                                " VALUES (datetime('now'), datetime('now'), " +
                                " 'DEFAULT_SITE', 'http://www.example.com/')")
    pref_id = connection.insert("INSERT INTO site_preferences (site_id) VALUES (#{site_id})")
    connection.update("UPDATE articles SET site_id = #{site_id}")
  end

  def self.down
    drop_table :sites
    drop_table :site_preferences
    remove_column(:articles, :site_id)
  end
end
