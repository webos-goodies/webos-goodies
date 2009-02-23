class CreateSites < ActiveRecord::Migration
  def self.up
    create_table :sites do |t|
      t.timestamps
      t.string :title,        :null => false, :default => ''
      t.string :url,          :null => false, :default => ''
      t.string :article_path, :null => false, :default => ''
      t.string :title_format, :null => false, :default => ''
    end
    create_table :site_preferences do |t|
      t.integer  :site_id
      t.datetime :refreshed_at
      t.string   :description,     :null => false, :default => ''
      t.string   :author,          :null => false, :default => ''
      t.string   :atom_path,       :null => false, :default => ''
      t.string   :rss_path,        :null => false, :default => ''
      t.text     :ping_servers,    :null => false, :default => ''
      t.string   :ftp_host,        :null => false, :default => ''
      t.string   :ftp_path,        :null => false, :default => ''
      t.string   :ftp_user,        :null => false, :default => ''
      t.string   :ftp_password,    :null => false, :default => ''
      t.string   :google_account,  :null => false, :default => ''
      t.string   :google_password, :null => false, :default => ''
    end
    add_column :articles, :site_id, :integer
    connection = ActiveRecord::Base.connection
    fields, values = {
      :title        => 'DEFAULT_SITE',
      :url          => 'http://www.example.com/',
      :article_path => '/archives',
      :title_format => '%page_title% - %site_title%'
    }.inject([[],[]]){|a,i| a[0] << "'#{i[0]}'"; a[1] << "'#{i[1]}'"; a }
    site_id = connection.insert("INSERT INTO sites (created_at, updated_at, #{fields.join(',')})" +
                                " VALUES (datetime('now'), datetime('now'), #{values.join(',')})")
    fields, values = {
      :site_id      => site_id,
      :atom_path    => '/atom.xml',
      :rss_path     => '/rss.xml',
      :ftp_host     => 'www.example.com',
      :ftp_path     => '/public_html'
    }.inject([[],[]]){|a,i| a[0] << "'#{i[0]}'"; a[1] << "'#{i[1]}'"; a }
    pref_id = connection.insert("INSERT INTO site_preferences" +
                                "(#{fields.join(',')}) VALUES (#{values.join(',')})")
    connection.update("UPDATE articles SET site_id = #{site_id}")
  end

  def self.down
    remove_column(:articles, :site_id)
    drop_table :sites
    drop_table :site_preferences
  end
end
