xml.instruct!

xml.rss("version"    => "2.0",
        "xmlns:dc"   => "http://purl.org/dc/elements/1.1/",
        "xmlns:atom" => "http://www.w3.org/2005/Atom") do
  xml.channel do

    xml.title       @site.title
    xml.link        @site.url
    xml.pubDate     Time.now.rfc822
    xml.description @site.description
    xml.atom :link, "href" => @site.full_url(:rss_path), "rel" => "self", "type" => "application/rss+xml"

    @articles.each do |article|
      xml.item do
        xml.title        article.title
        xml.link         article.url
        xml.description  <<EOS
#{article.formatted_body1}
<p><a href="#{CGI.escapeHTML(article.url)}">&gt;&gt; 続きを読む</a></p>
EOS
        xml.pubDate      article.publish_date.to_formatted_s(:rfc822)
        xml.guid         article.url
        xml.dc :creator, @site.author
      end
    end

  end
end
