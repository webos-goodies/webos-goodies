#! /usr/bin/ruby
# -*- coding: utf-8 -*-

require 'gres_google_spreadsheets'
require 'account'

doc = GoogleSpreadsheets::Spreadsheet.find(:first, :params => { :title => 'テストデータ' })
puts "Document ID : #{doc.id}"

sheet = GoogleSpreadsheets::Worksheet.find(:first, :params => { :document_id => doc.id, :visibility => 'private', :projection => 'full' })
puts "Sheet ID : #{sheet.id}"

rows = GoogleSpreadsheets::List.find(:all, :params => { :document_id => doc.id, :worksheet_id => sheet.id, :visibility => 'private', :projection => 'full' })
rows.each do |row|
  puts "#{row.attributes['gsx_県名']}"
end
