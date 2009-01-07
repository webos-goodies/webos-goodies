class HtmlParser < Parser::Base

  Label = "HTML"

  def parse(*documents)
    documents.map{|s| s.gsub(/\r\n|\n|\r/u, "\n") }
  end

end
