#! /usr/bin/ruby

require 'webapi/delicious'

print 'Password? '
#password = gets().strip
password = 'Hvikmf43UjdE'
p password

del = WebAPI::Delicious.new('hokousya', password)

posts = del.get_posts({ :tags => ['google-universal-gadget']})
data = []

posts.sort! do |a, b|
  a[:title] <=> b[:title]
end

posts.each do |post|
  if /^http\:\/\/webos-goodies\.jp\/archives\/(\d+)\.html/ === post[:url]
    id = $1
    data << {
      't' => post[:title],
      'id' => id,
      'dt' => post[:date].strftime('%Y-%m-%d %H:%M:%S')
    }
  end
end

File.open('data_source.js', 'w') do |file|
  file << 'dataSrc = ' + WebAPI::JsonBuilder.new.build(data)
end
