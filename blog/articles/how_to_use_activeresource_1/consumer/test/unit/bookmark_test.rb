require 'test_helper'
require 'active_resource/http_mock'
 
class BookmarkTest < ActiveSupport::TestCase
  def setup
    @record = {
      :id      => 1,
      :title   => 'WebOS Goodies',
      :url     => 'http://webos-goodies.jp/',
      :comment => 'Welcome!'
    }.to_xml(:root => 'bookmarks')
    @header = Bookmark.connection.__send__(:build_request_headers, {}, :get)
    ActiveResource::HttpMock.respond_to do |mock|
      mock.get '/bookmarks/1.xml', @header, @record
    end
  end
 
  test "get bookmark" do
    bookmark = Bookmark.find(1)
    assert_equal 'WebOS Goodies',            bookmark.title
    assert_equal 'http://webos-goodies.jp/', bookmark.url
    assert_equal 'Welcome!',                 bookmark.comment
    expected_request = ActiveResource::Request.new(:get, '/bookmarks/1.xml', nil, @header)
    assert ActiveResource::HttpMock.requests.include?(expected_request)
  end
end
