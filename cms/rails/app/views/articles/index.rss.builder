xml.instruct!

xml.rss "version" => "2.0", "xmlns:dc" => "http://purl.org/dc/elements/1.1/" do
  xml.channel do

    xml.title       @site_title
    xml.link        @site_url
    xml.pubDate     Time.now.rfc822
    xml.description @site_description

    @articles.each do |article|
      xml.item do
        xml.title       article.title
        xml.link        @article_base_url + article.page_name + '.html'
        xml.description article.formatted_body1
        xml.pubDate     article.publish_date.to_formatted_s(:rfc822)
        xml.guid        @article_base_url + article.page_name + '.html'
        xml.author      @author
      end
    end

  end
end
