# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130103072259) do

  create_table "articles", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "page_name",                  :default => "",    :null => false
    t.string   "parser",       :limit => 32, :default => "",    :null => false
    t.string   "title",                      :default => "",    :null => false
    t.string   "meta",                       :default => "",    :null => false
    t.text     "body1",                      :default => "",    :null => false
    t.text     "body2",                      :default => "",    :null => false
    t.datetime "publish_date"
    t.boolean  "published",                  :default => false, :null => false
    t.integer  "site_id"
    t.string   "short_url",                  :default => "",    :null => false
    t.string   "image"
    t.string   "tags"
  end

  add_index "articles", ["page_name"], :name => "index_articles_on_page_name", :unique => true
  add_index "articles", ["publish_date"], :name => "index_articles_on_publish_date"

  create_table "categories", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "site_id"
    t.string   "name",        :default => "", :null => false
    t.string   "title",       :default => "", :null => false
    t.text     "description", :default => "", :null => false
    t.string   "tags",        :default => "", :null => false
  end

  add_index "categories", ["name"], :name => "index_categories_on_name", :unique => true

  create_table "site_preferences", :force => true do |t|
    t.integer  "site_id"
    t.datetime "refreshed_at"
    t.string   "description",      :default => "", :null => false
    t.string   "author",           :default => "", :null => false
    t.string   "atom_path",        :default => "", :null => false
    t.string   "rss_path",         :default => "", :null => false
    t.text     "ping_servers",     :default => "", :null => false
    t.string   "ftp_host",         :default => "", :null => false
    t.string   "ftp_path",         :default => "", :null => false
    t.string   "ftp_user",         :default => "", :null => false
    t.string   "ftp_password",     :default => "", :null => false
    t.string   "google_account",   :default => "", :null => false
    t.string   "google_password",  :default => "", :null => false
    t.string   "article_list_key", :default => "", :null => false
    t.string   "bitly_user",       :default => "", :null => false
    t.string   "bitly_apikey",     :default => "", :null => false
    t.string   "aws_id",           :default => "", :null => false
    t.string   "aws_secret",       :default => "", :null => false
  end

  create_table "sites", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "title",        :default => "", :null => false
    t.string   "url",          :default => "", :null => false
    t.string   "article_path", :default => "", :null => false
    t.string   "title_format", :default => "", :null => false
  end

end
