#! /usr/bin/ruby
# -*- coding: utf-8 -*-

require 'gspreadsheets_resource'
require 'account'

params = {
  :document_id => '0Ao0lgngMECUtdGVrNDdqeVhudUFGdzRZeGpOdEtFb3c',
  :worksheet_id => 'od6',
  :visibility => 'private',
  :projection => 'full'
}

rows = GoogleSpreadsheet.find(:all, :params => params)

rows.each do |row|
  puts "#{row.attributes['gsx_県名']}"
end
